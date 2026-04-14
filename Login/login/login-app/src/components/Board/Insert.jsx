import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import { Save, List as ListIcon, Image as ImageIcon, FilePlus, X, Plus, Pencil, Type, User, Camera, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import * as fileApi from '../../apis/files';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";

const MAX_LENGTH = 3000;

const Insert = ({ onInsert }) => {
  const navigate = useNavigate();
  const userInfo = useAuthStore(state => state.userInfo);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('자유');
  const [submitting, setSubmitting] = useState(false);

  const [mainFile, setMainFile] = useState({ file: null, preview: null });
  const [subFiles, setSubFiles] = useState([]);

  const writer = userInfo?.nickname || userInfo?.name || '익명';

  useEffect(() => {
    return () => {
      if (mainFile.preview) URL.revokeObjectURL(mainFile.preview);
      subFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [mainFile.preview, subFiles]);

  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (mainFile.preview) URL.revokeObjectURL(mainFile.preview);
      setMainFile({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleSubFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSubFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index, isMain = false) => {
    if (isMain) {
      URL.revokeObjectURL(mainFile.preview);
      setMainFile({ file: null, preview: null });
    } else {
      setSubFiles(prev => {
        const target = prev[index];
        if (target) URL.revokeObjectURL(target.preview);
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!userInfo?.no) return Swal.fire('인증 오류', '로그인 세션이 만료되었습니다.', 'error');
    if (!title.trim()) return Swal.fire('입력 오류', '제목을 입력해주세요.', 'warning');
    if (content.length > MAX_LENGTH) return Swal.fire('입력 초과', '내용이 너무 깁니다.', 'warning');

    setSubmitting(true);
    try {
      let mainFileInfo = null;
      if (mainFile.file) {
        const { fileUrl, sanitizedName } = await fileApi.uploadFileToSupabase(mainFile.file, 'MAIN');
        mainFileInfo = { url: fileUrl, name: sanitizedName, originName: mainFile.file.name, size: mainFile.file.size };
      }

      const filesInfo = await Promise.all(
        subFiles.map(async ({ file }) => {
          const { fileUrl, sanitizedName } = await fileApi.uploadFileToSupabase(file, 'SUB');
          return { url: fileUrl, name: sanitizedName, originName: file.name, size: file.size };
        })
      );

      const payload = {
        title,
        writer,
        content,
        type,
        mainFile: mainFileInfo,
        files: filesInfo,
        userNo: userInfo.no
      };

      await onInsert(payload);
      await Swal.fire({
        icon: 'success',
        title: '등록 완료',
        text: '게시글이 성공적으로 등록되었습니다.',
        confirmButtonColor: 'var(--primary)',
        timer: 1500
      });
      navigate('/boards');
    } catch (err) {
      console.error(err);
      Swal.fire('오류', '등록 중 문제가 발생했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="board-page premium-board forms-page">
      <div className="form-container-full glass">
        <header className="form-header">
          <nav className="form-nav">
            <Link to="/boards" className="back-link">
              <ArrowLeft size={18} />
              <span>목록으로 돌아가기</span>
            </Link>
          </nav>
          <div className="header-badge">
            <Pencil size={16} />
            <span>NEW POST</span>
          </div>
          <h1 className="form-title">새로운 이야기 작성</h1>
          <p className="form-subtitle">여러분의 소중한 경험과 정보를 정성스럽게 담아주세요.</p>
        </header>

        <form onSubmit={handleSubmit} className="premium-form">
          <section className="form-section">
            <div className="section-title-area">
              <Type size={18} />
              <h3>기본 정보</h3>
            </div>
            <div className="form-row">
              <div className="board-form-group flex-2">
                <label className="board-form-label">제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  placeholder="공감 가는 제목을 입력해보세요"
                  required
                />
              </div>
              <div className="board-form-group flex-1">
                <label className="board-form-label">카테고리</label>
                <select 
                  className="form-control" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="자유">자유</option>
                  <option value="정보">정보</option>
                  <option value="코스추천">코스추천</option>
                  <option value="Q&A">Q&A</option>
                </select>
              </div>
              <div className="board-form-group flex-1">
                <label className="board-form-label">작성자</label>
                <input type="text" value={writer} className="form-control readonly" readOnly tabIndex={-1} />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="section-header">
              <h3 className="section-title"><FilePlus size={18} /> 게시글 내용</h3>
              <span className={`content-counter ${content.length > MAX_LENGTH ? 'limit' : ''}`}>
                {content.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
            </div>
            <div className="ck-editor-wrapper">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                config={{
                  placeholder: '이곳에 내용을 입력하세요...',
                }}
                onChange={(event, editor) => setContent(editor.getData())}
              />
            </div>
          </section>

          <section className="form-section multi-section">
            <div className="upload-box main-upload">
              <h3 className="section-title"><Camera size={18} /> 대표 썸네일</h3>
              <div className="file-preview-grid">
                {mainFile.preview ? (
                  <div className="preview-item">
                    <div className="preview-media">
                      <img src={mainFile.preview} alt="main-preview" />
                    </div>
                    <span className="media-badge">MAIN</span>
                    <button type="button" onClick={() => removeFile(0, true)} className="remove-btn">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-placeholder">
                    <Plus size={32} />
                    <span>대표 이미지 선택</span>
                    <input type="file" onChange={handleMainFileChange} style={{ display: 'none' }} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <div className="upload-box sub-upload">
              <h3 className="section-title"><ImageIcon size={18} /> 추가 이미지</h3>
              <div className="file-preview-grid scroll">
                {subFiles.map((item, idx) => (
                  <div key={idx} className="preview-item">
                    <div className="preview-media">
                      <img src={item.preview} alt={`sub-${idx}`} />
                    </div>
                    <button type="button" onClick={() => removeFile(idx)} className="remove-btn">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="upload-placeholder mini">
                  <Plus size={20} />
                  <input type="file" multiple onChange={handleSubFilesChange} style={{ display: 'none' }} accept="image/*" />
                </label>
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button 
              type="submit" 
              className="premium-btn" 
              disabled={submitting || content.length > MAX_LENGTH}
              style={{ padding: '20px 80px' }}
            >
              <Save size={20} />
              <span>{submitting ? '등록 중...' : '게시글 등록하기'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Insert;