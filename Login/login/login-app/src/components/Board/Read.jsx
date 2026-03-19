import React from 'react';
import { Link, useParams } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import CommentList from './Comment';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import { ArrowLeft, Edit3, Trash2, Download, User, Calendar, FileText } from 'lucide-react';

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
    return <div style={{padding: '100px', textAlign: 'center'}}>Loading post...</div>;
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete this post?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete it!'
    })
    if (result.isConfirmed) {
      onDelete(id);
    }
  }

  return (
    <div className="board-page">
      <div className="read-container">
        <header className="read-header">
          <h1 className="read-title">{board.title}</h1>
          <div className="read-meta">
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><User size={16} /> {board.writer}</span>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Calendar size={16} /> {new Date(board.createdAt).toLocaleDateString()}</span>
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
          <div style={{ marginTop: '48px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-muted)' }}>
              <FileText size={18} /> ATTACHMENTS
            </h4>
            <div className="file-preview-grid">
              {fileList.map((file) => (
                <div key={file.id} className="preview-item" style={{ height: 'auto', display: 'flex', flexDirection: 'column', background: 'hsla(0,0%,50%,0.05)', padding: '12px' }}>
                  <img src={file.filePath} alt="file" className="preview-img" style={{ height: '100px', borderRadius: '4px', marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '8px' }}>{file.originName}</div>
                  <button
                    className="btn-auth"
                    style={{ padding: '6px', fontSize: '0.7rem' }}
                    onClick={() => onDownload(file.id, file.originName)}
                  >
                    <Download size={12} style={{marginRight: '4px'}} /> DOWNLOAD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="board-header" style={{ marginTop: '48px', borderTop: '1px solid var(--glass-border)', paddingTop: '32px' }}>
          <Link to="/boards" className="btn-auth secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} style={{marginRight: '8px'}} /> BACK TO LIST
          </Link>
          
          {user_no && user_no === board.userNo && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to={`/boards/update/${id}`} className="btn-auth" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                <Edit3 size={16} style={{marginRight: '8px'}} /> EDIT
              </Link>
              <button type="button" className="btn-auth danger" onClick={handleDelete} style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                <Trash2 size={16} style={{marginRight: '8px'}} /> DELETE
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