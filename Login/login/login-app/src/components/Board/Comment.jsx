import React, { useState } from 'react';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import useAuthStore from '../../store/useAuthStore';
import { Send, Edit2, Trash2, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

const Comment = ({ comment, onUpdate, onDelete }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleUpdate = () => {
    if (!editedContent.trim()) return;
    onUpdate(comment.id, { content: editedContent });
    setIsEditing(false);
  };

  const isOwner = userInfo && userInfo.no === comment.userNo;

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-writer">{comment.writer}</span>
        <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
      </div>

      {isEditing ? (
        <div style={{ marginTop: '12px' }}>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="form-control"
            style={{ minHeight: '80px', marginBottom: '8px' }}
            maxLength={200}
          />
          <div className="comment-actions">
            <button onClick={handleUpdate} className="btn-auth" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>SAVE</button>
            <button onClick={() => setIsEditing(false)} className="btn-auth secondary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>CANCEL</button>
          </div>
        </div>
      ) : (
        <p className="comment-content">{comment.content}</p>
      )}

      {isOwner && !isEditing && (
        <div className="comment-actions">
          <button onClick={() => setIsEditing(true)} className="btn-icon"><Edit2 size={14} /></button>
          <button onClick={() => onDelete(comment.id, comment.userNo)} className="btn-icon delete"><Trash2 size={14} /></button>
        </div>
      )}
    </div>
  );
};

const CommentList = ({ comments, onCreate, onUpdate, onDelete }) => {
  const [newComment, setNewComment] = useState('');
  const isLogin = useAuthStore(state => state.isLogin);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onCreate({ content: newComment.trim() });
    setNewComment('');
  };

  return (
    <div>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontFamily: 'Orbitron', fontSize: '1.1rem' }}>
        <MessageSquare size={20} /> COMMENTS ({comments?.length || 0})
      </h3>

      {isLogin ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '40px', position: 'relative' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 작성해주세요."
            className="form-control"
            style={{ paddingRight: '60px', minHeight: '100px' }}
            maxLength={200}
          />
          <button type="submit" className="btn-auth" style={{ position: 'absolute', bottom: '12px', right: '12px', width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', background: 'hsla(0,0%,50%,0.03)', borderRadius: '12px', marginBottom: '40px', border: '1px dashed var(--glass-border)' }}>
          Please login to leave a comment.
        </div>
      )}

      <div className="comment-list">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <Comment key={comment.id} comment={comment} onUpdate={onUpdate} onDelete={onDelete} />
          ))
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px' }}>No comments yet.</div>
        )}
      </div>
    </div>
  );
};

export default CommentList;
