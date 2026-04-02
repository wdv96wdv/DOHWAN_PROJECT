import React, { useState } from 'react';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import useAuthStore from '../../store/useAuthStore';
import { Send, Edit2, Trash2, MessageSquare, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';

// === Premium Styles injected safely inside this component context ===
const premiumStyles = `
  .premium-avatar {
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
  }
  .premium-avatar:hover {
    transform: scale(1.05);
  }
  .premium-action-btn {
    background: none;
    border: none;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 12px;
    transition: all 0.2s ease;
    opacity: 0.6;
    color: inherit;
    white-space: nowrap;
  }
  .premium-action-btn:hover {
    opacity: 1;
    background: hsla(0,0%,50%,0.1);
  }
  .premium-action-btn.delete:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    opacity: 1;
  }
  .premium-textarea {
    width: 100%;
    resize: none;
    border: 1px solid var(--glass-border);
    background: hsla(0,0%,50%,0.04);
    border-radius: 20px;
    padding: 12px 16px;
    font-family: inherit;
    font-size: 0.95rem;
    color: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
    box-sizing: border-box;
  }
  .premium-textarea:focus {
    background: hsla(0,0%,50%,0.01);
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
  .premium-send-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  }
  .premium-send-btn:hover {
    transform: translateY(-1px) scale(1.05);
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  }
  .premium-send-btn:active {
    transform: translateY(1px) scale(0.95);
  }
  .premium-pill-btn {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
  }
  .premium-pill-primary {
    background: #3b82f6;
    color: white;
  }
  .premium-pill-primary:hover {
    background: #2563eb;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }
  .premium-pill-secondary {
    background: transparent;
    color: inherit;
    opacity: 0.7;
  }
  .premium-pill-secondary:hover {
    background: hsla(0,0%,50%,0.1);
    opacity: 1;
  }
  .premium-toggle-btn {
    color: #3b82f6;
    background: hsla(217, 91%, 60%, 0.1);
    padding: 6px 16px;
    border-radius: 20px;
    border: none;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }
  .premium-toggle-btn:hover {
    background: hsla(217, 91%, 60%, 0.15);
  }
`;

// Avatar color generator hash function
const getAvatarColor = (name) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Avatar = ({ name, url, size = 36 }) => {
  if (url) {
    return (
      <img src={url} alt={name || 'profile'} className="premium-avatar" style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0
      }} />
    );
  }

  const bgColor = getAvatarColor(name || '?');
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <div className="premium-avatar" style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: bgColor, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45,
      fontWeight: '600', flexShrink: 0
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
          <span style={{ color: '#3b82f6', fontWeight: '500', marginRight: '4px' }}>{mentionMatch[1]}</span>
          {mentionMatch[2]}
        </span>
      );
    }
    return text;
  };

  return (
    <div style={{ marginBottom: isReply ? 0 : '16px' }}>
      <div 
        style={{ 
          marginLeft: isReply ? '46px' : '0', 
          padding: isReply ? '10px 0' : '16px 0',
          borderBottom: isReply ? 'none' : '1px solid hsla(0,0%,50%,0.1)',
          display: 'flex',
          gap: '14px',
          alignItems: 'flex-start'
        }}
      >
        <Avatar name={comment.writer} url={avatars[comment.userNo]} size={isReply ? 32 : 40} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: isReply ? '0.85rem' : '0.95rem', opacity: 0.9 }}>{comment.writer}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.5, letterSpacing: '0.2px' }}>
              {new Date(comment.createdAt).toLocaleString(undefined, {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'
              })}
            </span>
          </div>

          {isEditing ? (
            <div style={{ marginTop: '8px' }}>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="premium-textarea"
                style={{ minHeight: '80px', marginBottom: '8px' }}
                maxLength={200}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleUpdate} className="premium-pill-btn premium-pill-primary">저장</button>
                <button onClick={() => setIsEditing(false)} className="premium-pill-btn premium-pill-secondary">취소</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.95rem', opacity: 0.85, lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '4px', wordBreak: 'break-word' }}>
              {renderContent(comment.content)}
            </div>
          )}

          {!isEditing && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {isLogin && <button onClick={handleReplyClick} className="premium-action-btn">답글</button>}
              {isOwner && (
                <>
                  <button onClick={() => setIsEditing(true)} className="premium-action-btn">수정</button>
                  <button onClick={() => onDelete(comment.id, comment.userNo)} className="premium-action-btn delete">삭제</button>
                </>
              )}
            </div>
          )}

          {isReplying && (
            <form onSubmit={handleReply} style={{ marginTop: '12px', position: 'relative', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Avatar name={userInfo?.name} url={userInfo?.avatarUrl} size={32} />
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`${comment.writer}님에게 답글 달기...`}
                  className="premium-textarea"
                  style={{ minHeight: '80px', paddingRight: '50px' }}
                  maxLength={200}
                  autoFocus
                />
                <button type="submit" className="premium-send-btn">
                  <Send size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Flattened Nested Replies */}
      {!isReply && comment.allReplies && comment.allReplies.length > 0 && (
        <div style={{ marginTop: '8px', marginBottom: '16px' }}>
          <div style={{ marginLeft: '60px', marginBottom: showReplies ? '12px' : '0' }}>
            <button 
              className="premium-toggle-btn" 
              onClick={() => setShowReplies(!showReplies)}
            >
              {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              답글 {comment.allReplies.length}개 {showReplies ? '숨기기' : '보기'}
            </button>
          </div>
          
          {showReplies && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

  React.useEffect(() => {
    const fetchAvatars = async () => {
      if (!comments || comments.length === 0) return;
      const uniqueUserNos = [...new Set(comments.map(c => c.userNo))];
      try {
        const { default: supabase } = await import('../../utils/supabaseClient');
        const { data, error } = await supabase
          .from('profiles')
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
    <>
      <style>{premiumStyles}</style>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', fontFamily: 'Orbitron', fontSize: '1.2rem', letterSpacing: '1px' }}>
          <MessageSquare size={20} color="#3b82f6" /> 
          <span style={{ fontWeight: '600' }}>COMMENTS</span> 
          <span style={{ opacity: 0.5, fontSize: '1rem' }}>({comments?.length || 0})</span>
        </h3>

        {isLogin ? (
          <form onSubmit={handleSubmit} style={{ marginBottom: '48px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <Avatar name={userInfo?.name} url={userInfo?.avatarUrl} size={44} />
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해주세요."
                className="premium-textarea"
                style={{ minHeight: '100px', paddingRight: '50px', fontSize: '1rem' }}
                maxLength={200}
              />
              <button type="submit" className="premium-send-btn" style={{ bottom: '12px', right: '12px', width: '40px', height: '40px' }}>
                <Send size={18} />
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--glass-bg, hsla(0,0%,50%,0.03))', borderRadius: '20px', marginBottom: '48px', border: '1px dashed var(--glass-border)', opacity: 0.7 }}>
            <p style={{ fontWeight: '500', marginBottom: '8px' }}>응원의 한 마디를 남겨주세요!</p>
            <p style={{ fontSize: '0.85rem' }}>댓글을 작성하려면 로그인이 필요합니다.</p>
          </div>
        )}

        <div className="comment-list" style={{ display: 'flex', flexDirection: 'column' }}>
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
            <div style={{ textAlign: 'center', opacity: 0.4, padding: '60px 20px', background: 'var(--glass-bg, transparent)', borderRadius: '20px' }}>
              <MessageSquare size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <p>아직 등록된 댓글이 없습니다.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>첫 댓글을 남겨보세요!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentList;
