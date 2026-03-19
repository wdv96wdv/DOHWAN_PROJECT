import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import * as fileApi from '../../apis/files';
import { Save, List as ListIcon, Image as ImageIcon, FilePlus, X, Trash2 } from 'lucide-react';

const Update = ({
  board,
  fileList,
  onUpdate,
  onDownload,
  onDeleteFile,
  deleteCheckedFiles
}) => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [fileIdList, setFileIdList] = useState([]);
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
      setCharCount(board.content?.length || 0);
    }
  }, [board]);

  const handleNewMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMainFile(file);
      setNewMainPreview(URL.createObjectURL(file));
      // Mark old main for deletion if exists
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Update post?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'UPDATE',
    }).then(async (res) => {
      if (res.isConfirmed) {
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
            deleteFiles: fileIdList,
            ...(addedMainFile ? { mainFile: addedMainFile } : {}),
            ...(addedFiles.length ? { files: addedFiles } : {}),
          };
          
          await onUpdate(data, { 'Content-Type': 'application/json' });
          Swal.fire('Updated!', 'Your post has been updated.', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to update post.', 'error');
        }
      }
    });
  };

  return (
    <div className="board-page">
      <div className="read-container">
        <header className="read-header">
           <h1 className="read-title">EDIT POST</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%', gap: '24px' }}>
          <div className="board-form-group">
            <label className="board-form-label">TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              required
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

          <div className="board-form-group">
            <label className="board-form-label"><FilePlus size={16} style={{marginRight: '8px'}} /> EXISTING ATTACHMENTS (Select for deletion)</label>
            <div className="file-preview-grid">
              {fileList?.map((file) => (
                <div key={file.id} className="preview-item" style={{ opacity: fileIdList.includes(file.id) ? 0.4 : 1 }}>
                   <img src={file.filePath} className="preview-img" alt="file" />
                   {file.type === 'MAIN' && <span className="preview-badge">MAIN</span>}
                   <button type="button" onClick={() => toggleFileCheck(file.id)} className={`btn-icon ${fileIdList.includes(file.id) ? 'active' : ''}`} style={{ position: 'absolute', top: '4px', right: '4px' }}>
                     {fileIdList.includes(file.id) ? <Trash2 size={12} color="red" /> : <X size={12}/>}
                   </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="board-form-group">
              <label className="board-form-label"><ImageIcon size={16} style={{marginRight: '8px'}} /> CHANGE MAIN IMAGE</label>
              <div className="file-preview-grid">
                {newMainPreview ? (
                  <div className="preview-item">
                     <span className="preview-badge">NEW MAIN</span>
                     <img src={newMainPreview} className="preview-img" alt="preview" />
                  </div>
                ) : (
                  <label className="preview-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                    <Plus size={24} color="var(--text-muted)" />
                    <input type="file" onChange={handleNewMainFileChange} style={{ display: 'none' }} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            <div className="board-form-group">
              <label className="board-form-label"><FilePlus size={16} style={{marginRight: '8px'}} /> ADD MORE FILES</label>
              <div className="file-preview-grid">
                {newFilePreviews.map((src, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={src} className="preview-img" alt="preview" />
                  </div>
                ))}
                <label className="preview-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--glass-border)', background: 'transparent' }}>
                  <Plus size={24} color="var(--text-muted)" />
                  <input type="file" multiple onChange={handleNewFilesChange} style={{ display: 'none' }} accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          <div className="board-header" style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}>
            <Link to="/boards" className="btn-auth secondary" style={{ padding: '12px 24px' }}>
              <ListIcon size={18} style={{marginRight: '8px'}} /> CANCEL
            </Link>
            <button type="submit" className="btn-auth" style={{ padding: '12px 32px' }}>
              <Save size={18} style={{marginRight: '8px'}} /> UPDATE POST
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;