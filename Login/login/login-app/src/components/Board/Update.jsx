import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import * as fileApi from '../../apis/files';
import { Save, List as ListIcon, Image as ImageIcon, FilePlus, X, Trash2, Plus, Pencil, Type, User, Camera } from 'lucide-react';

const Update = ({
  board,
  fileList,
  onUpdate,
  onDownload,
  onDeleteFile,
  deleteCheckedFiles
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      title: '게시글을 수정하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '수정',
      cancelButtonText: '취소'
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
          
          if (fileIdList.length > 0) {
            await deleteCheckedFiles(fileIdList);
          }
          await onUpdate(data, { 'Content-Type': 'application/json' });
          await Swal.fire('수정 완료!', '게시글이 성공적으로 수정되었습니다.', 'success');
          navigate(`/boards/${id}`);
        } catch (err) {
          console.error(err);
          Swal.fire('오류', '게시글 수정에 실패했습니다.', 'error');
        }
      }
    });
  };

  return (
    <div className="board-page trendy-board">
      <style>{`
        .trendy-board .read-container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
          padding: 56px;
        }
        .trendy-board .read-title {
          font-size: 2.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .trendy-board .board-form-label {
          font-weight: 700;
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
        }
        .trendy-board .form-control {
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 18px 20px;
          font-size: 1.05rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          width: 100%;
          color: #1e293b;
        }
        .trendy-board .form-control:focus {
          background: #fff;
          border-color: var(--primary, #007bff);
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15), inset 0 2px 4px rgba(0,0,0,0.01);
          outline: none;
        }
        .trendy-board .preview-item {
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
        }
        .trendy-board .preview-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: var(--primary, #007bff);
          background: rgba(0, 123, 255, 0.02);
        }
        .trendy-board .preview-img {
          border-radius: 14px;
        }
        .trendy-board .btn-auth {
          border-radius: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .trendy-board .btn-auth[type="submit"] {
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          border: none;
          box-shadow: 0 8px 16px rgba(0, 123, 255, 0.25);
          color: white;
        }
        .trendy-board .btn-auth[type="submit"]:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 123, 255, 0.35);
        }
        .trendy-board .btn-auth.secondary {
          background: #f1f5f9;
          color: #475569;
          border: 2px solid transparent;
        }
        .trendy-board .btn-auth.secondary:hover {
          background: #e2e8f0;
          color: #1e293b;
          transform: translateY(-2px);
        }
        .trendy-board .ck-editor__editable {
          border-radius: 0 0 16px 16px !important;
          border: 2px solid #cbd5e1 !important;
          border-top: none !important;
          transition: border-color 0.3s ease;
          min-height: 480px;
          font-size: 1.05rem;
          color: #334155 !important;
        }
        .trendy-board .ck-editor__editable.ck-focused {
          border-color: var(--primary, #007bff) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.05) !important;
        }
        .trendy-board .ck-toolbar {
          border-radius: 16px 16px 0 0 !important;
          border: 2px solid #cbd5e1 !important;
          background: #f8fafc !important;
          padding: 8px !important;
        }
        .trendy-board .board-header-actions {
          border-top: none !important;
          margin-top: 48px !important;
          padding-top: 0 !important;
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        /* 다크모드 대응 */
        @media (prefers-color-scheme: dark) {
          .trendy-board .read-container {
            background: rgba(30, 41, 59, 0.85);
            border-color: rgba(255, 255, 255, 0.1);
          }
          .trendy-board .board-form-label { color: #e2e8f0; }
          .trendy-board .form-control { background: #0f172a; color: #f8fafc; border-color: rgba(255,255,255,0.05); }
          .trendy-board .form-control:focus { background: #1e293b; }
          .trendy-board .preview-item { background: #0f172a; border-color: rgba(255,255,255,0.1); }
          .trendy-board .ck-editor__editable { color: #f8fafc !important; border-color: rgba(255,255,255,0.1) !important; background: #0f172a !important; }
          .trendy-board .ck-toolbar { background: #1e293b !important; border-color: rgba(255,255,255,0.1) !important; }
          .trendy-board .btn-auth.secondary { background: rgba(255,255,255,0.1); color: #f8fafc; }
          .trendy-board .btn-auth.secondary:hover { background: rgba(255,255,255,0.15); }
        }
      `}</style>
      <div className="read-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <header className="read-header" style={{ borderBottom: 'none', textAlign: 'center', paddingBottom: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 123, 255, 0.1)', padding: '10px 20px', borderRadius: '30px', marginBottom: '20px' }}>
            <Pencil size={18} style={{ color: 'var(--primary, #007bff)', marginRight: '8px' }} />
            <span style={{ color: 'var(--primary, #007bff)', fontWeight: 800, letterSpacing: '1px', fontSize: '0.9rem' }}>EDIT POST</span>
          </div>
          <h1 className="read-title">게시글 수정</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '12px', fontWeight: 500 }}>더 나은 내용으로 게시글을 수정해보세요.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: '100%', gap: '32px' }}>
          <div className="board-form-group" style={{ marginBottom: 0 }}>
            <label className="board-form-label"><Type size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}}/> 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="board-form-group" style={{ marginBottom: 0 }}>
            <label className="board-form-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span><FilePlus size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}}/> 내용</span>
              <span style={{ color: charCount > MAX_LENGTH ? '#ef4444' : '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                {charCount} / {MAX_LENGTH}
              </span>
            </label>
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

          <div className="board-form-group" style={{ marginBottom: 0 }}>
            <label className="board-form-label"><FilePlus size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}} /> 기존 첨부 파일 (삭제할 파일을 선택하세요)</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '16px' }}>
            <div className="board-form-group" style={{ marginBottom: 0 }}>
              <label className="board-form-label"><Camera size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}} /> 대표 이미지 변경</label>
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

            <div className="board-form-group" style={{ marginBottom: 0 }}>
              <label className="board-form-label"><ImageIcon size={18} style={{marginRight: '8px', color: 'var(--primary, #007bff)'}} /> 첨부 파일 추가</label>
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

          <div className="board-header-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-auth secondary" style={{ padding: '16px 32px', minWidth: '140px', fontSize: '1.05rem' }}>
              <ListIcon size={20} style={{marginRight: '10px'}} /> 취소
            </button>
            <button type="submit" className="btn-auth" style={{ padding: '16px 40px', minWidth: '180px', fontSize: '1.05rem' }}>
              <Save size={20} style={{marginRight: '10px'}} /> 게시글 수정하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;