import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../../assets/css/Read.module.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import noImage from '../../assets/img/no-image.png';
import CommentList from './Comment';

const Read = ({
  board = {},
  fileList = [],
  onDownload,
  commentList = [],
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  if (!board || !board.title) {
    return <div>게시글 정보를 불러오는 중입니다...</div>;
  }

  const { id } = useParams();

  const getUserNoFromJWT = () => {
    const token = localStorage.getItem("jwt");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.no;
    } catch {
      return null;
    }
  };

  const user_no = getUserNoFromJWT();

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

      <CommentList
        comments={commentList}
        onCreate={onCreateComment}
        onUpdate={onUpdateComment}
        onDelete={onDeleteComment}
      />
    </div>
  );
};

export default Read;