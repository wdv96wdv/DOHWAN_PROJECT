import React, { useState, useEffect } from 'react';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import useAuthStore from '../../store/useAuthStore';
import { Send, Edit2, Trash2, MessageSquare, Reply, ChevronDown, ChevronUp, MoreHorizontal, CornerDownRight } from 'lucide-react';
import Swal from 'sweetalert2';

// Avatar color generator hash function
const getAvatarColor = (name) => {
  const colors = ['var(--primary)', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({ name, url, size = 36 }) => {
  if (url) {
    return (
      <img src={url} alt={name || 'profile'} className="comment-avatar" style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        boxShadow: '0 2px 8px hsla(0,0%,0%,0.1)'
      }} />
    );
  }

  const bgColor = getAvatarColor(name || '?');
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="comment-avatar" style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: bgColor, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45,
      fontWeight: '700', flexShrink: 0, boxShadow: `0 2px 8px ${bgColor}44`
    }}>
      {initial}
    </div>
  );
};

const Comment = ({ comment, onUpdate, onDelete, onCreateReply, isReply = false, avatars = {} }) => {
  const userInfo = useAuthStore(state => state.userInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const isLogin = useAuthStore(state => state.isLogin);

  const handleUpdate = () => {
    if (!editedContent.trim()) return;
    onUpdate(comment.id, { content: editedContent });
    setIsEditing(false);
  };

  const handleReplyClick = () => {
    if (!isReplying && isReply) {
      setReplyContent(`@${comment.writer} `);
    } else if (!isReplying) {
      setReplyContent('');
    }
    setIsReplying(!isReplying);
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onCreateReply(comment.id, { content: replyContent.trim() });
    setReplyContent('');
    setIsReplying(false);
    setShowReplies(true);
  };

  const isOwner = userInfo && userInfo.no === comment.userNo;

  const renderContent = (text) => {
    const mentionMatch = text.match(/^(@\S+)\s+(.*)/s);
    if (mentionMatch) {
      return (
        <span>
          <span className="mention-text">{mentionMatch[1]}</span>
          {mentionMatch[2]}
        </span>
      );
    }
    return text;
  };

  return (
    <div className={`comment-group ${isReply ? 'reply-group' : 'root-group'}`}>
      <div className="comment-main">
        {isReply && <div className="reply-indicator"><CornerDownRight size={16} /></div>}
        <Avatar name={comment.writer} url={avatars[comment.userNo]} size={isReply ? 34 : 42} />

        <div className="comment-body">
          <div className="comment-header">
            <span className="comment-writer">{comment.writer}</span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          {isEditing ? (
            <div className="comment-edit-form">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="premium-textarea mini"
                maxLength={200}
              />
              <div className="comment-actions edit">
                <button onClick={handleUpdate} className="text-btn primary">저장</button>
                <button onClick={() => setIsEditing(false)} className="text-btn">취소</button>
              </div>
            </div>
          ) : (
            <div className="comment-content">
              {renderContent(comment.content)}
            </div>
          )}

          {!isEditing && (
            <div className="comment-actions">
              {isLogin && <button onClick={handleReplyClick} className="action-btn">답글</button>}
              {isOwner && (
                <>
                  <button onClick={() => setIsEditing(true)} className="action-btn">수정</button>
                  <button onClick={() => onDelete(comment.id, comment.userNo)} className="action-btn delete">삭제</button>
                </>
              )}
            </div>
          )}

          {isReplying && (
            <form onSubmit={handleReply} className="comment-reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`${comment.writer}님에게 답글 남기기...`}
                className="premium-textarea mini"
                maxLength={200}
                autoFocus
              />
              <button type="submit" className="mini-send-btn">
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
      
      {!isReply && comment.allReplies && comment.allReplies.length > 0 && (
        <div className="replies-container">
          <button 
            className="replies-toggle" 
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>답글 {comment.allReplies.length}개 {showReplies ? '숨기기' : '보기'}</span>
          </button>
          
          {showReplies && (
            <div className="replies-list">
              {comment.allReplies.map(reply => (
                <Comment 
                  key={reply.id} 
                  comment={reply} 
                  onUpdate={onUpdate} 
                  onDelete={onDelete} 
                  onCreateReply={onCreateReply}
                  isReply={true}
                  avatars={avatars}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentList = ({ comments, onCreate, onUpdate, onDelete }) => {
  const [newComment, setNewComment] = useState('');
  const isLogin = useAuthStore(state => state.isLogin);
  const userInfo = useAuthStore(state => state.userInfo);
  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    const fetchAvatars = async () => {
      if (!comments || comments.length === 0) return;
      const uniqueUserNos = [...new Set(comments.map(c => c.userNo))];
      try {
        const { default: supabase } = await import('../../utils/supabaseClient');
        const { data, error } = await supabase
          .from('users')
          .select('no, avatar_url')
          .in('no', uniqueUserNos);
          
        if (!error && data) {
          const map = {};
          data.forEach(p => { if (p.avatar_url) map[p.no] = p.avatar_url; });
          setAvatars(map);
        }
      } catch(e) {
        console.warn('Failed to load profile avatars', e);
      }
    };
    if (comments?.length > 0) {
      fetchAvatars();
    }
  }, [comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onCreate({ content: newComment.trim() });
    setNewComment('');
  };

  const handleCreateReply = (parentId, data) => {
    onCreate({ ...data, parentId });
  };

  const buildFlatCommentTree = (commentsList) => {
    if (!commentsList) return [];
    const listMap = {};
    commentsList.forEach(c => {
      listMap[c.id] = { ...c, allReplies: [] };
    });

    const roots = [];
    const getRootId = (parentId) => {
      let currentParentId = parentId;
      while (currentParentId && listMap[currentParentId] && listMap[currentParentId].parentId) {
        currentParentId = listMap[currentParentId].parentId;
      }
      return currentParentId;
    }

    commentsList.forEach(c => {
      if (c.parentId && listMap[c.parentId]) {
        const rootId = getRootId(c.parentId);
        if (listMap[rootId]) {
          listMap[rootId].allReplies.push(listMap[c.id]);
        }
      } else {
        roots.push(listMap[c.id]);
      }
    });
    return roots;
  };

  const commentRoots = buildFlatCommentTree(comments);

  return (
    <div className="premium-comments-section">
      <h3 className="section-title">
        <MessageSquare size={18} /> 
        <span>댓글 이야기</span> 
        <span className="count">{(comments?.length || 0)}</span>
      </h3>

      {isLogin ? (
        <form onSubmit={handleSubmit} className="root-comment-form">
          <Avatar name={userInfo?.name} url={userInfo?.avatarUrl} size={42} />
          <div className="form-input-wrapper">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻한 응원이나 의견을 남겨주세요."
              className="premium-textarea"
              maxLength={200}
            />
            <button type="submit" className="premium-send-btn" disabled={!newComment.trim()}>
              <Send size={18} />
              <span>등록하기</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>댓글을 작성하려면 로그인이 필요합니다.</p>
        </div>
      )}

      <div className="comment-list">
        {commentRoots && commentRoots.length > 0 ? (
          commentRoots.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              onUpdate={onUpdate} 
              onDelete={onDelete} 
              onCreateReply={handleCreateReply}
              avatars={avatars}
            />
          ))
        ) : (
          <div className="empty-comments">
            <MessageSquare size={40} />
            <p>아직 등록된 댓글이 없습니다. 첫 번째 이야기를 들려주세요!</p>
          </div>
        )}
      </div>

      <style>{`
        .premium-comments-section {
          margin-top: 60px;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .section-title span.count {
          font-size: 0.8rem;
          color: var(--text-muted);
          background: hsla(0, 0%, 50%, 0.1);
          padding: 2px 8px;
          border-radius: 10px;
        }
        .root-comment-form {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }
        .form-input-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }
        .premium-textarea {
          width: 100%;
          min-height: 100px;
          padding: 16px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: hsla(0, 0%, 50%, 0.02);
          transition: all 0.2s ease;
          resize: none;
          font-family: inherit;
          font-size: 1rem;
        }
        .premium-textarea:focus {
          border-color: var(--primary);
          background: white;
          box-shadow: 0 4px 12px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1);
          outline: none;
        }
        .premium-send-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: var(--primary);
          color: white;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .premium-send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .premium-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .login-prompt {
          padding: 32px;
          text-align: center;
          border-radius: var(--radius-md);
          background: hsla(0, 0%, 50%, 0.03);
          border: 1px dashed var(--border-color);
          margin-bottom: 48px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .comment-group {
          margin-bottom: 24px;
        }
        .comment-main {
          display: flex;
          gap: 14px;
          position: relative;
        }
        .reply-indicator {
          color: var(--border-color);
          margin-right: -4px;
          margin-top: 4px;
        }
        .comment-body {
          flex: 1;
          background: hsla(0, 0%, 50%, 0.02);
          padding: 16px;
          border-radius: var(--radius-md);
        }
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .comment-writer {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        .comment-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .comment-content {
          line-height: 1.6;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-all;
        }
        .mention-text {
          color: var(--primary);
          font-weight: 600;
          margin-right: 4px;
        }
        .comment-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .action-btn {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          color: var(--primary);
        }
        .action-btn.delete:hover {
          color: #ef4444;
        }
        .replies-container {
          margin-left: 56px;
          margin-top: 8px;
        }
        .replies-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          padding: 4px 0;
        }
        .replies-list {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .empty-comments {
          padding: 60px;
          text-align: center;
          color: var(--text-muted);
          opacity: 0.5;
        }
        .empty-comments svg { margin-bottom: 16px; }
        .comment-reply-form {
          margin-top: 16px;
          position: relative;
        }
        .premium-textarea.mini {
          min-height: 60px;
          font-size: 0.9rem;
          padding-right: 40px;
        }
        .mini-send-btn {
          position: absolute;
          right: 8px;
          bottom: 8px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .text-btn {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .text-btn.primary { color: var(--primary); }
      `}</style>
    </div>
  );
};

export default CommentList;

