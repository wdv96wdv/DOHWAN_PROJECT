import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../../assets/css/Update.module.css';
import Swal from 'sweetalert2';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Checkbox from '@mui/material/Checkbox';
import noImage from '../../assets/img/no-image.png';

const Update = ({
  board,
  fileList,
  onUpdate,
  onDelete,
  onDownload,
  onDeleteFile,
  deleteCheckedFiles
}) => {
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [fileIdList, setFileIdList] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const MAX_LENGTH = 3000;

  useEffect(() => {
    if (board) {
      setTitle(board.title ?? '');
      setWriter(board.writer ?? '');
      setContent(board.content ?? '');
      setCharCount(getTextLength(board.content ?? ''));
    }
  }, [board]);

  const getTextLength = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: '수정하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '수정',
      cancelButtonText: '취소',
    }).then((res) => {
      if (res.isConfirmed) {
        const data = {
          id,
          title,
          writer,
          content,
          deleteFiles: fileIdList
        };
        const headers = { 'Content-Type': 'application/json' };
        onUpdate(data, headers);
      }
    });
  };

  const handleDelete = () => {
    onDelete(id);
  };

  const handleCheckedFileDelete = () => {
    if (fileIdList.length === 0) {
      return Swal.fire('선택된 파일이 없습니다.', '', 'info');
    }
    Swal.fire({
      title: `${fileIdList.length}개의 파일을 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    }).then((res) => {
      if (res.isConfirmed) {
        deleteCheckedFiles(fileIdList);
        setFileIdList([]);
      }
    });
  };

  const checkFileId = (id) => {
    setFileIdList((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>게시글 수정</h1>

      <form onSubmit={handleSubmit}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th>제목</th>
              <td>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.formInput}
                  placeholder="제목을 입력하세요"
                  maxLength={100}
                />
              </td>
            </tr>

            <tr>
              <th>작성자</th>
              <td>
                <input
                  type="text"
                  value={writer}
                  onChange={(e) => setWriter(e.target.value)}
                  className={styles.formInput}
                  placeholder="작성자를 입력하세요"
                  maxLength={100}
                />
              </td>
            </tr>

            <tr>
              <th colSpan={2}>내용</th>
            </tr>
            <tr>
              <td colSpan={2}>
                <CKEditor
                  editor={ClassicEditor}
                  data={content}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    const length = getTextLength(data);
                    if (length <= MAX_LENGTH) {
                      setContent(data);
                      setCharCount(length);
                    } else {
                      Swal.fire('최대 글자 수를 초과했습니다.', '', 'warning');
                    }
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '13px', marginTop: '4px' }}>
                  글자 수: {charCount} / {MAX_LENGTH}
                </div>
              </td>
            </tr>

            <tr>
              <th colSpan={2}>첨부 파일</th>
            </tr>
            <tr>
              <td colSpan={2}>
                {fileList.length > 0 && (
                  <div className={styles.fileList}>
                    {fileList.map((file) => (
                      <div key={file.id} className={styles.fileItem}>
                        <Checkbox
                          checked={fileIdList.includes(file.id)}
                          onChange={() => checkFileId(file.id)}
                        />
                        {file.type === 'MAIN' && <span className={styles.badge}>대표</span>}
                        <img
                          src={file?.filePath ? file.filePath : noImage}
                          alt={file?.originName}
                          className={styles.fileImage}
                        />
                        <div style={{ marginTop: '6px', fontSize: '13px' }}>
                          {file.originName}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '4px',
                            marginTop: '4px',
                          }}
                        >
                          <button
                            className={styles.btn}
                            type="button"
                            onClick={() => onDownload(file.id, file.originName)}
                          >
                            <DownloadIcon fontSize="small" />
                          </button>
                          <button
                            className={styles.btn}
                            type="button"
                            onClick={() => onDeleteFile(file.id)}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.btnBox}>
          <Link to="/boards" className={styles.btnGray}>목록</Link>
          <button type="button" className={styles.btnBlue} onClick={handleCheckedFileDelete}>
            선택 삭제
          </button>
          <button type="submit" className={styles.btnBlue}>수정</button>
          <button type="button" className={styles.btnGray} onClick={handleDelete}>삭제</button>
        </div>
      </form>
    </div>
  );
};

export default Update;