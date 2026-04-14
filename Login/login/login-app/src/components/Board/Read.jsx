import React from 'react';
import { Link, useParams } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CommentList from './Comment';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import { ArrowLeft, Edit3, Trash2, Download, User, Calendar, FileText, Clock, FileBadge, Share2, MessageSquare } from 'lucide-react';

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
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>게시글을 불러오는 중입니다...</p>
      </div>
    );
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '삭제하시겠습니까?',
      text: "삭제된 게시글은 다시 복구할 수 없습니다.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      background: 'var(--bg)',
      color: 'var(--text-primary)'
    })
    if (result.isConfirmed) {
      onDelete(id);
    }
  }

  return (
    <div className="board-page premium-read">
      <div className="read-container glass">
        {/* Top Navigation */}
        <nav className="read-nav">
          <Link to="/boards" className="back-link">
            <ArrowLeft size={18} />
            <span>목록으로 돌아가기</span>
          </Link>
          <div className="nav-actions">
            <button className="icon-btn" title="공유하기"><Share2 size={18} /></button>
          </div>
        </nav>

        {/* Post Header */}
        <header className="read-post-header">
          <div className="post-category">{board.type || '커뮤니티'}</div>
          <h1 className="read-title">{board.title}</h1>
          <div className="read-meta-info">
            <div className="meta-group">
              <div className="meta-item">
                <div className="avatar-mini"><User size={14} /></div>
                <span className="writer-name">{board.writer}</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>{new Date(board.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            {user_no && user_no === board.userNo && (
              <div className="owner-actions">
                <Link to={`/boards/update/${id}`} className="meta-action-btn edit" title="수정">
                  <Edit3 size={16} />
                  <span>수정</span>
                </Link>
                <button onClick={handleDelete} className="meta-action-btn delete" title="삭제">
                  <Trash2 size={16} />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Post Body */}
        <div className="read-post-body">
          <div className="content-viewer">
            {/* Main Post Image (if exists) */}
            {fileList.find(f => f.type === 'MAIN') && (
              <div className="main-post-image" style={{ marginBottom: '32px', textAlign: 'center' }}>
                <img 
                  src={fileList.find(f => f.type === 'MAIN').filePath} 
                  alt="Main Post" 
                  style={{ 
                    borderRadius: 'var(--radius-xl)', 
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            )}
            <CKEditor
              editor={ClassicEditor}
              data={board.content ?? ''}
              disabled={true}
              config={{ toolbar: [] }}
            />
          </div>

          {fileList.length > 0 && (
            <div className="attachment-section premium-attachments">
              <h4 className="section-title">
                <FileBadge size={18} /> 첨부된 파일 <span className="count">{fileList.length}</span>
              </h4>
              <div className="file-preview-grid">
                {fileList.map((file) => (
                  <div key={file.id} className="preview-item glass" onClick={() => onDownload(file.id, file.originName)}>
                    <div className="preview-media">
                      <img src={file.filePath} alt="attachment" />
                    </div>
                    <div className="action-overlay">
                      <Download size={24} />
                      <span>DOWNLOAD</span>
                    </div>
                    <div className="preview-info">
                      <span className="file-name">{file.originName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Post Footer */}
        <footer className="read-post-footer">
          <div className="comment-area-header">
            <h3 className="section-title"><MessageSquare size={18} /> 댓글 이야기</h3>
          </div>
          <div className="comment-wrapper">
            <CommentList
              comments={commentList}
              onCreate={onCreateComment}
              onUpdate={onUpdateComment}
              onDelete={onDeleteComment}
            />
          </div>
        </footer>
      </div>

      <style>{`
        .premium-read {
          padding-top: 40px;
          padding-bottom: 100px;
        }
        .premium-read .read-container {
          max-width: 900px;
          margin: 40px auto;
          border: none;
          padding: 60px;
          border-radius: var(--radius-xl);
          background: var(--bg);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08), 0 10px 30px -10px rgba(0,0,0,0.04);
        }
        .read-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }
        .back-link:hover { color: var(--primary); }
        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsla(0, 0%, 50%, 0.05);
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .icon-btn:hover {
          background: var(--primary);
          color: white;
          transform: rotate(15deg);
        }
        .read-post-header {
          margin-bottom: 48px;
        }
        .post-category {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .read-title {
          font-size: 2.8rem !important;
          line-height: 1.2 !important;
          margin-bottom: 32px !important;
          font-weight: 900 !important;
          color: var(--text-primary);
        }
        .read-meta-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 0;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
        }
        .meta-group {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
        }
        .writer-name {
          font-weight: 700;
          color: var(--text-primary);
        }
        .avatar-mini {
          width: 28px;
          height: 28px;
          background: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .owner-actions {
          display: flex;
          gap: 12px;
        }
        .meta-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 30px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .meta-action-btn.edit {
          color: var(--primary);
          background: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1);
        }
        .meta-action-btn.delete {
          color: #ef4444;
          background: #fef2f2;
        }
        .meta-action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .read-post-body {
          margin-bottom: 80px;
          min-height: 300px;
        }
        .content-viewer {
          padding: 40px 0;
          font-size: 1.15rem;
          line-height: 1.8;
          color: var(--text-secondary);
        }
        .premium-attachments {
          margin-top: 80px;
          padding: 48px;
          background: hsla(0, 0%, 50%, 0.03);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
        }
        .read-post-footer {
          margin-top: 100px;
        }
        .comment-area-header {
          margin-bottom: 48px;
          padding-bottom: 24px;
          border-bottom: 2px solid var(--border-color);
        }
        @media (max-width: 768px) {
          .premium-read .read-container { padding: 30px; }
          .read-title { font-size: 2.2rem !important; }
          .read-meta-info { flex-direction: column; align-items: flex-start; gap: 24px; }
          .meta-group { flex-direction: column; align-items: flex-start; gap: 12px; }
          .owner-actions { width: 100%; justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
};

export default Read;