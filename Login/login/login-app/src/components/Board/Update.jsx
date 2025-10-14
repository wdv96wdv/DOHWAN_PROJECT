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
  const API_URL = 'https://dohwan-project.onrender.com'; // 운영 서버 주소

  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [fileIdList, setFileIdList] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // 새로 추가된 파일 목록

  useEffect(() => {
    if (board) {
      setTitle(board.title ?? '');
      setWriter(board.writer ?? '');
      setContent(board.content ?? '');
    }
  }, [board]);

  const onSubmit = async () => {
    // 새 파일이 있다면 Supabase에 업로드 후 정보 배열 생성
    let newFilesInfo = [];
    if (newFiles.length > 0) {
      for (let file of newFiles) {
        const fileUrl = await fileApi.uploadFileToSupabase(file, 'SUB');
        newFilesInfo.push({
          url: fileUrl,
          name: file.name,
          originName: file.name,
          size: file.size,
        });
      }
    }

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
          newFiles: newFilesInfo, // 새로 추가된 파일들
          deleteFiles: fileIdList // 삭제할 파일들
        };
        const headers = { 'Content-Type': 'application/json' };
        onUpdate(data, headers);
      }
    });
  };

  const handleDelete = () => {
    Swal.fire({
      title: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    }).then((res) => {
      if (res.isConfirmed) onDelete(id);
    });
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles(selectedFiles); // 새로 추가된 파일을 상태에 추가
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>게시글 수정</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.formInput}
        placeholder="제목"
      />
      <input
        type="text"
        value={writer}
        onChange={(e) => setWriter(e.target.value)}
        className={styles.formInput}
        placeholder="작성자"
      />

      <div style={{ marginBottom: '12px' }}>
        <CKEditor
          editor={ClassicEditor}
          data={content ?? ''}
          onChange={(e, editor) => setContent(editor.getData())}
        />
      </div>

      {/* 파일 목록 */}
      {fileList.length > 0 && (
        <div className={styles.fileList}>
          {fileList.map((file) => (
            <div key={file.id} className={styles.fileItem}>
              <Checkbox
                checked={fileIdList.includes(file.id)}
                onChange={() => checkFileId(file.id)}
              />
              {file.type == 'MAIN' && <span className={styles.badge}>대표</span>}
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
                  onClick={() => onDownload(file.id, file.originName)}
                >
                  <DownloadIcon fontSize="small" />
                </button>
                <button
                  className={styles.btn}
                  onClick={() => onDeleteFile(file.id)}
                >
                  <DeleteForeverIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 새 파일 추가 */}
      <div className={styles.fileInput}>
        <input type="file" multiple onChange={handleFileChange} />
      </div>

      <div className={styles.btnBox}>
        <Link to="/boards" className={styles.btn}>목록</Link>
        <button className={styles.btn} onClick={handleCheckedFileDelete}>
          선택 삭제
        </button>
        <button className={styles.btn} onClick={onSubmit}>수정</button>
        <button className={styles.btn} onClick={handleDelete}>삭제</button>
      </div>
    </div>
  );
};

export default Update;
