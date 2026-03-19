import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import * as fileApi from '../../apis/files';
import { Save, List as ListIcon, Image as ImageIcon, FilePlus, X } from 'lucide-react';
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

    if (!userInfo?.no) return Swal.fire('Login Required', '', 'warning');
    if (!title.trim() || !content.trim()) return Swal.fire('Missing Fields', 'Title and content are required.', 'warning');

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
      Swal.fire('Success', 'Post published!', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to publish post.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="board-page">
      <div className="read-container">
        <header className="read-header">
           <h1 className="read-title">NEW POST</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%', gap: '24px' }}>
          <div className="board-form-group">
            <label className="board-form-label">TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="board-form-group">
            <label className="board-form-label">WRITER</label>
            <input
              type="text"
              value={writer}
              className="form-control"
              readOnly
              style={{ opacity: 0.7 }}
            />
          </div>

          <div className="board-form-group">
            <label className="board-form-label">CONTENT ({charCount} / {MAX_LENGTH})</label>
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
              <label className="board-form-label"><ImageIcon size={16} style={{marginRight: '8px'}} /> MAIN IMAGE</label>
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
              <label className="board-form-label"><FilePlus size={16} style={{marginRight: '8px'}} /> ATTACHMENTS</label>
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

          <div className="board-header" style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}>
            <Link to="/boards" className="btn-auth secondary" style={{ padding: '12px 24px' }}>
              <ListIcon size={18} style={{marginRight: '8px'}} /> LIST
            </Link>
            <button type="submit" className="btn-auth" disabled={submitting} style={{ padding: '12px 32px' }}>
              <Save size={18} style={{marginRight: '8px'}} /> {submitting ? 'PUBLISHING...' : 'PUBLISH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Insert;
