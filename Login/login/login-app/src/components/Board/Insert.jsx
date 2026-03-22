import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import * as fileApi from '../../apis/files';
import { Save, List as ListIcon, Image as ImageIcon, FilePlus, X, Plus } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Insert = ({ onInsert }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState(userInfo?.nickname || userInfo?.id || '');
  const [content, setContent] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_LENGTH = 3000;

  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainFile(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
    setFilePreviews(prev => [...prev, ...selectedFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeFile = (index, isMain = false) => {
    if (isMain) {
      setMainFile(null);
      setMainPreview(null);
    } else {
      setFiles(prev => prev.filter((_, i) => i !== index));
      setFilePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!userInfo?.no) return Swal.fire('로그인 필요', '로그인 후 이용 가능합니다.', 'warning');
    if (!title.trim() || !content.trim()) return Swal.fire('필수 입력', '제목과 내용을 입력해주세요.', 'warning');

    setSubmitting(true);
    try {
      let mainFileInfo = null;
      if (mainFile) {
        const { fileUrl, sanitizedName } = await fileApi.uploadFileToSupabase(mainFile, 'MAIN');
        mainFileInfo = { url: fileUrl, name: sanitizedName, originName: mainFile.name, size: mainFile.size };
      }

      let filesInfo = [];
      for (let file of files) {
        const { fileUrl, sanitizedName } = await fileApi.uploadFileToSupabase(file, 'SUB');
        filesInfo.push({ url: fileUrl, name: sanitizedName, originName: file.name, size: file.size });
      }

      const data = { title, writer, content, mainFile: mainFileInfo, files: filesInfo, userNo: userInfo.no };
      await onInsert(data, { 'Content-Type': 'multipart/form-data' });
      Swal.fire('성공', '게시글이 등록되었습니다!', 'success');
    } catch (err) {
      Swal.fire('오류', '게시글 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="board-page">
      <div className="read-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="read-header">
           <h1 className="read-title">새 게시글 작성</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%', gap: '24px' }}>
          <div className="board-form-group">
            <label className="board-form-label">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          <div className="board-form-group">
            <label className="board-form-label">작성자</label>
            <input
              type="text"
              value={writer}
              className="form-control"
              readOnly
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className="board-form-group">
            <label className="board-form-label">내용 ({charCount} / {MAX_LENGTH})</label>
            <div className="ck-editor-wrapper">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                   const data = editor.getData();
                   setContent(data);
                   setCharCount(data.length);
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="board-form-group">
              <label className="board-form-label"><ImageIcon size={16} style={{marginRight: '8px'}} /> 대표 이미지</label>
              <div className="file-preview-grid">
                {mainPreview ? (
                  <div className="preview-item">
                     <span className="preview-badge">MAIN</span>
                     <img src={mainPreview} className="preview-img" alt="preview" />
                     <button type="button" onClick={() => removeFile(0, true)} className="btn-icon delete" style={{ position: 'absolute', top: '4px', right: '4px' }}><X size={12}/></button>
                  </div>
                ) : (
                  <label className="preview-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                    <Plus size={24} color="var(--text-muted)" />
                    <input type="file" onChange={handleMainFileChange} style={{ display: 'none' }} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <div className="board-form-group">
              <label className="board-form-label"><FilePlus size={16} style={{marginRight: '8px'}} /> 첨부 파일</label>
              <div className="file-preview-grid">
                {filePreviews.map((src, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={src} className="preview-img" alt="preview" />
                    <button type="button" onClick={() => removeFile(idx)} className="btn-icon delete" style={{ position: 'absolute', top: '4px', right: '4px' }}><X size={12}/></button>
                  </div>
                ))}
                <label className="preview-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                  <Plus size={24} color="var(--text-muted)" />
                  <input type="file" multiple onChange={handleFilesChange} style={{ display: 'none' }} accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          <div className="board-header" style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '32px', justifyContent: 'center', gap: '20px' }}>
            <Link to="/boards" className="btn-auth secondary" style={{ padding: '12px 24px', width: 'auto', minWidth: '120px' }}>
              <ListIcon size={18} style={{marginRight: '8px'}} /> 목록
            </Link>
            <button type="submit" className="btn-auth" disabled={submitting} style={{ padding: '12px 32px', width: 'auto', minWidth: '150px' }}>
              <Save size={18} style={{marginRight: '8px'}} /> {submitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Insert;
