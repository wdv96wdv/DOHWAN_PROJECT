import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import * as fileApi from '../../apis/files';
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  FilePlus, 
  X, 
  Trash2, 
  Plus, 
  Pencil, 
  Type, 
  User, 
  Camera,
  Layout
} from 'lucide-react';

const Update = ({
  board,
  fileList,
  onUpdate,
  deleteCheckedFiles
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('자유');
  const [fileIdList, setFileIdList] = useState([]); // List of file IDs to delete
  const [charCount, setCharCount] = useState(0);
  const MAX_LENGTH = 3000;

  const [newMainFile, setNewMainFile] = useState(null);
  const [newMainPreview, setNewMainPreview] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);

  useEffect(() => {
    if (board) {
      setTitle(board.title ?? '');
      setWriter(board.writer ?? '');
      setContent(board.content ?? '');
      setType(board.type ?? '자유');
      setCharCount(board.content?.length || 0);
    }
  }, [board]);

  const handleNewMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMainFile(file);
      setNewMainPreview(URL.createObjectURL(file));
      // Automatically check the old main file for deletion
      const oldMain = fileList?.find(f => f.type === 'MAIN');
      if (oldMain && !fileIdList.includes(oldMain.id)) {
        setFileIdList(prev => [...prev, oldMain.id]);
      }
    }
  };

  const handleNewFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setNewFiles(prev => [...prev, ...selectedFiles]);
    setNewFilePreviews(prev => [...prev, ...selectedFiles.map(f => URL.createObjectURL(f))]);
  };

  const toggleFileCheck = (id) => {
    setFileIdList(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (charCount > MAX_LENGTH) {
      Swal.fire('경고', '내용이 너무 깁니다.', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: '게시글을 수정하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '수정',
      cancelButtonText: '취소',
      confirmButtonColor: 'var(--primary)',
      background: 'var(--bg)',
      color: 'var(--text-primary)'
    });

    if (result.isConfirmed) {
      try {
        // Upload new files
        let addedMainFile = null;
        if (newMainFile) {
          const uploaded = await fileApi.uploadFileToSupabase(newMainFile, 'MAIN');
          addedMainFile = { url: uploaded.fileUrl, name: newMainFile.name, originName: newMainFile.name, size: newMainFile.size };
        }

        const addedFiles = [];
        for (const f of newFiles) {
          const uploaded = await fileApi.uploadFileToSupabase(f, 'SUB');
          addedFiles.push({ url: uploaded.fileUrl, name: f.name, originName: f.name, size: f.size });
        }

        const data = {
          id,
          title,
          writer,
          content,
          type,
          deleteFiles: fileIdList,
          ...(addedMainFile ? { mainFile: addedMainFile } : {}),
          ...(addedFiles.length ? { files: addedFiles } : {}),
        };
        
        if (fileIdList.length > 0) {
          await deleteCheckedFiles(fileIdList);
        }
        await onUpdate(data, { 'Content-Type': 'application/json' });
        await Swal.fire({
          icon: 'success',
          title: '수정 완료!',
          text: '게시글이 성공적으로 수정되었습니다.',
          timer: 1500,
          showConfirmButton: false
        });
        navigate(`/boards/${id}`);
      } catch (err) {
        console.error(err);
        Swal.fire('오류', '게시글 수정에 실패했습니다.', 'error');
      }
    }
  };

  return (
    <div className="board-page premium-board forms-page">
      <div className="form-container-full glass">
        {/* Navigation */}
        <nav className="form-nav">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={18} />
            <span>돌아가기</span>
          </button>
        </nav>

        {/* Header */}
        <header className="form-header">
          <div className="header-badge">
            <Pencil size={16} />
            <span>EDIT POST</span>
          </div>
          <h1 className="form-title">이야기 수정하기</h1>
          <p className="form-subtitle">더 나은 내용으로 소통을 이어가보세요.</p>
        </header>

        <form onSubmit={handleSubmit} className="premium-form">
          {/* Basic Info Section */}
          <section className="form-section">
            <div className="section-title-area">
              <Layout size={18} />
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
                  placeholder="공감 가는 제목으로 수정해보세요"
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

          {/* Editor Section */}
          <section className="form-section">
            <div className="section-title-area">
              <Type size={18} />
              <h3>내용 작성</h3>
              <span className={`char-counter ${charCount > MAX_LENGTH ? 'danger' : ''}`}>
                {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
            </div>
            <div className="ck-editor-wrapper">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onReady={editor => {
                  console.log('Editor UI is ready!');
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setContent(data);
                  setCharCount(data.length);
                }}
              />
            </div>
          </section>

          {/* Existing Files Section */}
          {fileList && fileList.length > 0 && (
            <section className="form-section">
              <div className="section-title-area">
                <Trash2 size={18} />
                <h3>기존 첨부 파일 <span className="helper-text">(삭제할 파일을 선택하세요)</span></h3>
              </div>
              <div className="file-preview-grid">
                {fileList.map((file) => (
                  <div 
                    key={file.id} 
                    className={`preview-item glass ${fileIdList.includes(file.id) ? 'marked-delete' : ''}`}
                    onClick={() => toggleFileCheck(file.id)}
                  >
                    <div className="preview-media">
                      <img src={file.filePath} alt="existing file" />
                      {file.type === 'MAIN' && <span className="media-badge">MAIN</span>}
                      <div className="delete-overlay">
                        {fileIdList.includes(file.id) ? <Plus size={24} style={{transform: 'rotate(45deg)'}} /> : <Trash2 size={24} />}
                      </div>
                    </div>
                    <div className="preview-info">
                      <span className="file-name">{file.originName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* New Files Section */}
          <section className="form-section">
            <div className="form-row">
              {/* Main Image Change */}
              <div className="board-form-group flex-1">
                <div className="section-title-area">
                  <Camera size={18} />
                  <h3>대표 이미지 변경</h3>
                </div>
                <div className="file-preview-grid single">
                  {newMainPreview ? (
                    <div className="preview-item glass">
                      <div className="preview-media">
                        <img src={newMainPreview} alt="new main" />
                        <span className="media-badge new">NEW MAIN</span>
                        <button type="button" className="btn-remove" onClick={() => {setNewMainFile(null); setNewMainPreview(null)}}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-placeholder glass">
                      <Plus size={32} />
                      <span>교체할 사진 선택</span>
                      <input type="file" onChange={handleNewMainFileChange} style={{ display: 'none' }} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>

              {/* Additional Files */}
              <div className="board-form-group flex-2">
                <div className="section-title-area">
                  <ImageIcon size={18} />
                  <h3>추가 첨부 파일</h3>
                </div>
                <div className="file-preview-grid">
                  {newFilePreviews.map((src, idx) => (
                    <div key={idx} className="preview-item glass">
                      <div className="preview-media">
                        <img src={src} alt="preview" />
                        <button type="button" className="btn-remove" onClick={() => removeNewFile(idx)}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <label className="upload-placeholder glass">
                    <Plus size={32} />
                    <input type="file" multiple onChange={handleNewFilesChange} style={{ display: 'none' }} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="premium-btn secondary">
              취소하기
            </button>
            <button type="submit" className="premium-btn primary">
              <Save size={20} />
              <span>수정 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;