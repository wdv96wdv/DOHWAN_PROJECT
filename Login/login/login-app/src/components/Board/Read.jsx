import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../../assets/css/Read.module.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import noImage from '../../assets/img/no-image.png';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const Read = ({ board = {}, fileList = [], commentList = [], onDownload, onCreateComment, onUpdateComment, onDeleteComment }) => {
  if (!board || !board.title) {
    return <div>게시글 정보를 불러오는 중입니다...</div>;
  }

  const { id } = useParams();

  const getUserNoFromJWT = () => {
    // 1. localStorage의 userInfo에서 no 가져오기 (가장 확실)
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        if (userInfo && userInfo.no) {
          return userInfo.no;
        }
      } catch (e) {
        console.error("userInfo 파싱 실패:", e);
      }
    }

    // 2. 쿠키에서 JWT 가져오기
    let token = Cookies.get("jwt");
    if (!token) {
      // 3. localStorage에서 JWT 가져오기 (기존 방식)
      token = localStorage.getItem("jwt");
    }

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.no;
    } catch {
      return null;
    }
  };

  const user_no = getUserNoFromJWT();

  const getUserInfo = () => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      try {
        return JSON.parse(savedUserInfo);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const mainFile = fileList?.find(
    (f) => f.type?.toUpperCase() === 'MAIN' || f.type?.toUpperCase() === 'THUMBNAIL'
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>게시글 조회</h1>

      <form>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th>제목</th>
              <td>
                <input
                  type="text"
                  value={board.title ?? ''}
                  className={styles.formInput}
                  readOnly
                />
              </td>
            </tr>

            <tr>
              <th>작성자</th>
              <td>
                <input
                  type="text"
                  value={board.writer ?? ''}
                  className={styles.formInput}
                  readOnly
                />
              </td>
            </tr>

            <tr>
              <th colSpan={2}>대표 이미지</th>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className={styles.thumbnailBox}>
                  {mainFile ? (
                    <>
                      <span className={styles.badge}>대표 이미지</span>
                      <img
                        src={mainFile.filePath}
                        alt={mainFile.originName}
                        className={styles.mainImage}
                      />
                    </>
                  ) : (
                    <div style={{ height: '200px', background: '#f5f5f5', textAlign: 'center', lineHeight: '200px', color: '#aaa' }}>
                      이미지 없음
                    </div>
                  )}
                </div>
              </td>
            </tr>

            <tr>
              <th colSpan={2}>내용</th>
            </tr>
            <tr>
              <td colSpan={2}>
                <div className={styles.contentBox}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={board.content ?? ''}
                    disabled={true}
                    config={{ toolbar: [] }}
                  />
                </div>
              </td>
            </tr>

            {fileList.length > 0 && (
              <>
                <tr>
                  <th colSpan={2}>첨부파일</th>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <div className={styles.fileList}>
                      {fileList.map((file) => (
                        <div key={file.id} className={styles.fileItem}>
                          <div style={{ position: 'relative', width: '100%' }}>
                            {file.type?.toUpperCase() === 'MAIN' && (
                              <span className={styles.badge}>대표</span>
                            )}
                            <img
                              src={file?.filePath ? file.filePath : noImage}
                              alt={file?.originName}
                              className={styles.fileImage}
                            />
                          </div>
                          <span>{file.originName} ({file.fileSize})</span>
                          <button
                            type="button"
                            className={styles.btn}
                            onClick={() => onDownload(file.id, file.originName)}
                          >
                            다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>

        <div className={styles.btnBox}>
          <Link to="/boards" className={styles.btn}>목록</Link>
          {user_no && user_no === board.userNo && (
            <Link to={`/boards/update/${id}`} className={styles.btn}>수정</Link>
          )}
        </div>
      </form>

      {/* 댓글 영역 */}
      <CommentSection
        commentList={commentList}
        userNo={user_no}
        userInfo={getUserInfo()}
        onCreateComment={onCreateComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
      />
    </div>
  );
};

// 댓글 섹션 컴포넌트
const CommentSection = ({ commentList = [], userNo, userInfo, onCreateComment, onUpdateComment, onDeleteComment }) => {
  const [commentContent, setCommentContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const getUserInfo = () => {
    const savedUserInfo = localStorage.getItem("userInfo");
    if (savedUserInfo) {
      try {
        return JSON.parse(savedUserInfo);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const info = userInfo || getUserInfo();

  const handleSubmitComment = () => {
    if (!commentContent.trim()) {
      Swal.fire({ icon: 'warning', title: '댓글 내용을 입력해주세요.' });
      return;
    }
    if (!userNo) {
      Swal.fire({ icon: 'warning', title: '로그인 후 댓글을 작성할 수 있습니다.' });
      return;
    }

    onCreateComment({
      userNo: userNo,
      writer: info?.name || info?.username || '익명',
      content: commentContent
    });
    setCommentContent('');
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleUpdateComment = (commentId) => {
    if (!editContent.trim()) {
      Swal.fire({ icon: 'warning', title: '댓글 내용을 입력해주세요.' });
      return;
    }

    onUpdateComment(commentId, {
      userNo: userNo,
      content: editContent
    });
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className={styles.commentSection}>
      <h2 className={styles.commentTitle}>댓글 ({commentList.length})</h2>

      {/* 댓글 작성 폼 */}
      {userNo ? (
        <div className={styles.commentForm}>
          <textarea
            className={styles.commentInput}
            placeholder="댓글을 입력하세요..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
          />
          <button className={styles.commentSubmitBtn} onClick={handleSubmitComment}>
            댓글 등록
          </button>
        </div>
      ) : (
        <div className={styles.commentLoginMsg}>
          로그인 후 댓글을 작성할 수 있습니다.
        </div>
      )}

      {/* 댓글 목록 */}
      <div className={styles.commentList}>
        {commentList.length === 0 ? (
          <div className={styles.noComments}>댓글이 없습니다.</div>
        ) : (
          commentList.map((comment) => (
            <div key={comment.id || comment.no} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <span className={styles.commentWriter}>{comment.writer}</span>
                <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
              </div>
              
              {editingId === comment.id ? (
                <div className={styles.commentEditBox}>
                  <textarea
                    className={styles.commentInput}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={2}
                  />
                  <div className={styles.commentEditActions}>
                    <button
                      className={styles.commentEditBtn}
                      onClick={() => handleUpdateComment(comment.id)}
                    >
                      저장
                    </button>
                    <button
                      className={styles.commentCancelBtn}
                      onClick={handleCancelEdit}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.commentContent}>{comment.content}</div>
                  {userNo && userNo === comment.userNo && (
                    <div className={styles.commentActions}>
                      <button
                        className={styles.commentActionBtn}
                        onClick={() => handleStartEdit(comment)}
                      >
                        수정
                      </button>
                      <button
                        className={styles.commentActionBtn}
                        onClick={() => onDeleteComment(comment.id, userNo)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Read;