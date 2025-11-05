
import React, { useState, useContext } from 'react';
import styles from '../../assets/css/common.module.css';
import { LoginContext } from '../../contexts/LoginContextProvider';

const Comment = ({ comment, onUpdate, onDelete }) => {
  const { userInfo } = useContext(LoginContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleUpdate = () => {
    onUpdate(comment.id, { content: editedContent });
    setIsEditing(false);
  };

  const isOwner = userInfo && userInfo.no === comment.userNo;

  return (
    <div className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <strong>{comment.writer}</strong>
        <span>{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      {isEditing ? (
        <div className={styles.commentEdit}>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className={styles.formTextarea}
            maxLength={200} // 글자수 제한
          />
          <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
            {editedContent.length}/200
          </div>
          <button
            onClick={() => {
              if (!editedContent.trim()) return alert("댓글 내용을 입력해주세요.");
              if (editedContent.length > 200) return alert("댓글은 200자 이하로 작성해야 합니다.");
              handleUpdate();
            }}
            className={styles.btn}
          >
            저장
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`${styles.btn} ${styles.btnGray}`}
          >
            취소
          </button>
        </div>
      ) : (
        <p className={styles.commentContent}>{comment.content}</p>
      )}
      {isOwner && !isEditing && (
        <div className={styles.commentActions}>
          <button onClick={() => setIsEditing(true)} className={styles.btn}>수정</button>
          <button onClick={() => onDelete(comment.id, comment.userNo)} className={`${styles.btn} ${styles.btnGray}`}>삭제</button>
        </div>
      )}
    </div>
  );
};

const CommentList = ({ comments, onCreate, onUpdate, onDelete }) => {
  const [newComment, setNewComment] = useState('');
  const { isLogin } = useContext(LoginContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (trimmed.length > 200) {
      return alert("댓글은 200자 이하로 작성해야 합니다.");
    }
    onCreate({ content: trimmed });
    setNewComment('');
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.subtitle}>댓글</h2>
      {isLogin && (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            className={styles.formTextarea}
            maxLength={200}
          />
          <div style={{ fontSize: '0.8rem', color: '#666', textAlign: 'right' }}>
            {newComment.length}/200
          </div>
          <button type="submit" className={styles.btn}>등록</button>
        </form>
      )}
      <div className={styles.commentList}>
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <Comment key={comment.id} comment={comment} onUpdate={onUpdate} onDelete={onDelete} />
          ))
        ) : (
          <p>작성된 댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
