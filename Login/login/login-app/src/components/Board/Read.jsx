import React from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../../assets/css/Read.module.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const Read = ({ board, fileList, onDownload }) => {
  const { id } = useParams();
  const API_URL = 'https://dohwan-project.onrender.com'; // 운영 서버 주소

  // 대표 파일 찾기 (메인 파일 또는 썸네일)
  const mainFile = fileList?.find(
    (f) => f.type?.toUpperCase() === 'MAIN' || f.type?.toUpperCase() === 'THUMBNAIL'
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>게시글 조회</h1>

      {/* 제목 */}
      <div>
        <label>제목</label>
        <input type="text" value={board.title ?? ''} className={styles.formInput} readOnly />
      </div>

      {/* 작성자 */}
      <div>
        <label>작성자</label>
        <input type="text" value={board.writer ?? ''} className={styles.formInput} readOnly />
      </div>

      {/* 대표 썸네일 */}
      {mainFile && (
        <div className={styles.thumbnailBox}>
          <span className={styles.badge}>대표 이미지</span>
          <img
            src={mainFile.filePath ? `${API_URL}/files/img/${mainFile.filePath}` : noImage} // filePath 사용
            alt={mainFile.originName}
            className={styles.mainImage}
          />
        </div>
      )}

      {/* 본문 */}
      <div style={{ marginTop: '12px' }}>
        <CKEditor
          editor={ClassicEditor}
          data={board.content ?? ''}
          disabled={true}
          config={{ toolbar: [] }}
        />
      </div>

      {/* 첨부파일 리스트 */}
      {fileList && fileList.length > 0 && (
        <div className={styles.fileList}>
          {fileList.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <div style={{ position: 'relative', width: '100%' }}>
                {file.type?.toUpperCase() === 'MAIN' && (
                  <span className={styles.badge}>대표</span>
                )}
                <img
                  src={file.filePath ? `${API_URL}/files/img/${file.filePath}` : noImage} // filePath 사용
                  alt={file.originName}
                  className={styles.fileImg}
                />
              </div>
              <span>{file.originName} ({file.fileSize})</span>
              <button className={styles.btn} onClick={() => onDownload(file.id, file.originName)}>
                다운로드
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 버튼 영역 */}
      <div className={styles.btnBox}>
        <Link to="/boards" className={styles.btn}>목록</Link>
        <Link to={`/boards/update/${id}`} className={styles.btn}>수정</Link>
      </div>
    </div>
  );
};

export default Read;
