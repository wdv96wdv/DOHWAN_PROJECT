import React from 'react';
import { Link, useParams } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CommentList from './Comment';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import { ArrowLeft, Edit3, Trash2, Download, User, Calendar, FileText, Clock, FileBadge } from 'lucide-react';

const Read = ({
  board = {},
  fileList = [],
  onDownload,
  commentList = [],
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onDelete,
}) => {
  const { id } = useParams();
  const userInfo = useAuthStore(state => state.userInfo);
  const user_no = userInfo?.no;

  if (!board || !board.title) {
    return <div style={{ padding: '100px', textAlign: 'center' }}>Loading post...</div>;
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '삭제하시겠습니까?',
      text: "삭제하면 되돌릴 수 없습니다!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: '네, 삭제할래요!'
    })
    if (result.isConfirmed) {
      onDelete(id);
    }
  }

  return (
    <div className="board-page trendy-read">
      <style>{`
        .trendy-read .read-container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
          padding: 56px;
          max-width: 900px;
          margin: 0 auto;
        }
        .trendy-read .read-header {
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 24px;
          margin-bottom: 32px;
          text-align: center;
        }
        .trendy-read .read-title {
          font-size: 2.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
          line-height: 1.3;
        }
        .trendy-read .read-meta {
          display: flex;
          justify-content: center;
          gap: 16px;
          align-items: center;
        }
        .trendy-read .meta-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .trendy-read .meta-badge.writer {
          background: rgba(0, 123, 255, 0.05);
          color: var(--primary, #007bff);
          border-color: rgba(0, 123, 255, 0.1);
        }
        .trendy-read .read-content {
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          border: 1px solid #f1f5f9;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
          min-height: 400px;
        }
        .trendy-read .ck-editor__editable_inline {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding: 0 !important;
          font-size: 1.1rem;
          line-height: 1.8;
          color: #334155;
        }
        .trendy-read .attachment-section {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          margin-top: 40px;
          border: 1px solid #e2e8f0;
        }
        .trendy-read .attachment-title {
          font-weight: 700;
          color: #475569;
          font-size: 1rem;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .trendy-read .preview-item {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #f1f5f9;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .trendy-read .preview-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .trendy-read .preview-img {
          border-radius: 12px;
          object-fit: contain;
          background: #f8fafc;
          width: 100%;
        }
        .trendy-read .btn-download {
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 12px;
          padding: 8px 0;
          font-weight: 700;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .trendy-read .btn-download:hover {
          background: var(--primary, #007bff);
          color: white;
        }
        .trendy-read .action-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 2px solid #f1f5f9;
        }
        .trendy-read .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.3s ease;
          text-decoration: none;
          cursor: pointer;
          border: none;
        }
        .trendy-read .btn-action.back {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .trendy-read .btn-action.back:hover {
          background: #e2e8f0;
          color: #1e293b;
          transform: translateX(-4px);
        }
        .trendy-read .btn-action.edit {
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
        }
        .trendy-read .btn-action.edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 123, 255, 0.35);
        }
        .trendy-read .btn-action.delete {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #ffe4e6;
        }
        .trendy-read .btn-action.delete:hover {
          background: #ffe4e6;
          color: #be123c;
          transform: translateY(-2px);
        }
        /* 다크모드 대응 */
        @media (prefers-color-scheme: dark) {
          .trendy-read .read-container { background: rgba(30, 41, 59, 0.85); border-color: rgba(255,255,255,0.1); }
          .trendy-read .read-title { background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%); -webkit-background-clip: text; }
          .trendy-read .read-header { border-bottom-color: rgba(255,255,255,0.05); }
          .trendy-read .meta-badge { background: #0f172a; border-color: rgba(255,255,255,0.05); color: #cbd5e1; }
          .trendy-read .meta-badge.writer { background: rgba(0,123,255,0.1); }
          .trendy-read .read-content { background: #0f172a; border-color: rgba(255,255,255,0.05); }
          .trendy-read .ck-editor__editable_inline { color: #f8fafc; }
          .trendy-read .attachment-section { background: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.05); }
          .trendy-read .attachment-title { color: #cbd5e1; }
          .trendy-read .preview-item { background: #1e293b; border-color: rgba(255,255,255,0.05); }
          .trendy-read .preview-img { background: #0f172a; }
          .trendy-read .btn-download { background: #334155; color: #f8fafc; }
          .trendy-read .action-footer { border-top-color: rgba(255,255,255,0.05); }
          .trendy-read .btn-action.back { background: rgba(255,255,255,0.05); border-color: transparent; color: #f8fafc; }
          .trendy-read .btn-action.back:hover { background: rgba(255,255,255,0.1); }
          .trendy-read .btn-action.delete { background: rgba(225,29,72,0.1); border-color: rgba(225,29,72,0.2); color: #fda4af; }
          .trendy-read .btn-action.delete:hover { background: rgba(225,29,72,0.2); color: #fecdd3; }
        }
      `}</style>
      <div className="read-container">
        <header className="read-header">
          <h1 className="read-title">{board.title}</h1>
          <div className="read-meta">
            <span className="meta-badge writer"><User size={16} /> {board.writer}</span>
            <span className="meta-badge"><Clock size={16} /> {new Date(board.createdAt).toLocaleDateString()}</span>
          </div>
        </header>

        <div className="read-content">
          <CKEditor
            editor={ClassicEditor}
            data={board.content ?? ''}
            disabled={true}
            config={{ toolbar: [] }}
          />
        </div>

        {fileList.length > 0 && (
          <div className="attachment-section">
            <h4 className="attachment-title">
              <FileBadge size={20} color="var(--primary, #007bff)" /> 첨부 파일 ({fileList.length}개)
            </h4>
            <div className="file-preview-grid">
              {fileList.map((file) => (
                <div key={file.id} className="preview-item">
                  <img src={file.filePath} alt="file" className="preview-img" style={{ height: '120px', marginBottom: '16px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '12px', textAlign: 'center' }}>
                    {file.originName}
                  </div>
                  <button
                    className="btn-download"
                    onClick={() => onDownload(file.id, file.originName)}
                  >
                    <Download size={14} /> DOWNLOAD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="action-footer">
          <Link to="/boards" className="btn-action back">
            <ArrowLeft size={18} /> 목록으로
          </Link>

          {user_no && user_no === board.userNo && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to={`/boards/update/${id}`} className="btn-action edit">
                <Edit3 size={18} /> 수정하기
              </Link>
              <button type="button" className="btn-action delete" onClick={handleDelete}>
                <Trash2 size={18} /> 삭제하기
              </button>
            </div>
          )}
        </div>

        <div className="comment-section">
          <CommentList
            comments={commentList}
            onCreate={onCreateComment}
            onUpdate={onUpdateComment}
            onDelete={onDeleteComment}
          />
        </div>
      </div>
    </div>
  );
};

export default Read;