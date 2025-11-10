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
import * as fileApi from '../../apis/files';

const Update = ({
  board,
  fileList,
  onUpdate,
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

  // 신규 파일 추가용 상태
  const [newMainFile, setNewMainFile] = useState(null);
  const [newMainPreview, setNewMainPreview] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);

  // 파일 검증 설정 (Insert와 동일 정책)
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  const validateFile = (file) => {
    if (!file) return false;
    const isImage = file.type?.startsWith('image/');
    const isUnderLimit = file.size <= MAX_SIZE_BYTES;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isAllowedExt = ALLOWED_EXTS.includes(ext);
    if (!isImage || !isAllowedExt) {
      Swal.fire('업로드 실패', '이미지 파일만 업로드할 수 있습니다. (jpg, jpeg, png, gif, webp)', 'error');
      return false;
    }
    if (!isUnderLimit) {
      Swal.fire('업로드 실패', '이미지 크기는 5MB 이하여야 합니다.', 'error');
      return false;
    }
    return true;
  };

  const handleNewMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !validateFile(file)) {
      e.target.value = '';
      setNewMainFile(null);
      setNewMainPreview(null);
      return;
    }
    setNewMainFile(file || null);
    if (file) setNewMainPreview(URL.createObjectURL(file));
    // 기존 대표 이미지가 있으면 자동으로 삭제 대상에 추가
    const currentMain = (fileList || []).find((f) => (f.type || '').toUpperCase() === 'MAIN');
    if (currentMain && !fileIdList.includes(currentMain.id)) {
      setFileIdList((prev) => [...prev, currentMain.id]);
      // 사용자 안내: 대표 이미지 교체 시 기존 대표는 삭제됨
      Swal.fire({
        icon: 'info',
        title: '대표 이미지 교체 안내',
        text: '새 대표 이미지를 선택하면 기존 대표 이미지는 저장 시 삭제됩니다.',
        confirmButtonText: '확인'
      });
    }
  };

  const handleNewFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = [];
    for (const f of selectedFiles) {
      if (validateFile(f)) validFiles.push(f);
    }
    if (validFiles.length !== selectedFiles.length) {
      const dt = new DataTransfer();
      validFiles.forEach((f) => dt.items.add(f));
      e.target.files = dt.files;
    }
    setNewFiles(validFiles);
    setNewFilePreviews(validFiles.map((f) => URL.createObjectURL(f)));
  };

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
    // 업로드 전 최종 검증(우회 방지)
    if (newMainFile && !validateFile(newMainFile)) return;
    for (const f of newFiles) {
      if (!validateFile(f)) return;
    }

    Swal.fire({
      title: '수정하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '수정',
      cancelButtonText: '취소',
    }).then(async (res) => {
      if (res.isConfirmed) {
        // 선택된 파일이 있으면 추가 확인
        if (fileIdList.length > 0) {
          const delConfirm = await Swal.fire({
            title: `${fileIdList.length}개의 선택 파일을 삭제하고 수정하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제 후 수정',
            cancelButtonText: '취소',
          });
          if (!delConfirm.isConfirmed) {
            return; // 사용자가 취소한 경우 수정 중단
          }
          try {
            await deleteCheckedFiles(fileIdList);
            setFileIdList([]);
          } catch (err) {
            console.warn('선택 파일 삭제 중 오류', err);
            // 삭제 오류가 나면 수정 중단
            return;
          }
        }

        // 2) 신규 파일이 있다면 Supabase에 업로드 후 URL/메타 구성
        let addedMainFile = null;
        if (newMainFile) {
          const uploadedMainFile = await fileApi.uploadFileToSupabase(newMainFile, 'MAIN');
          addedMainFile = {
            url: uploadedMainFile.fileUrl,
            name: newMainFile.name,
            originName: newMainFile.name,
            size: newMainFile.size,
          };
        }

        const addedFiles = [];
        for (const f of newFiles) {
          const uploadedFile = await fileApi.uploadFileToSupabase(f, 'SUB');
          addedFiles.push({
            url: uploadedFile.fileUrl,
            name: f.name,
            originName: f.name,
            size: f.size,
          });
        }

        // 3) 본문/파일 변경을 서버에 반영
        const data = {
          id,
          title,
          writer,
          content,
          deleteFiles: fileIdList,
          // 서버 DTO(Boards)와 동일 키 사용: mainFile, files
          ...(addedMainFile ? { mainFile: addedMainFile } : {}),
          ...(addedFiles.length ? { files: addedFiles } : {}),
        };
        const headers = { 'Content-Type': 'application/json' };
        onUpdate(data, headers);
      }
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
                {/* 신규 파일 추가 */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ marginBottom: '8px', textAlign: 'left', fontWeight: 600 }}>메인 이미지 교체</div>
                  <input type="file" accept="image/*" onChange={handleNewMainFileChange} />
                  {fileList.some((f) => (f.type || '').toUpperCase() === 'MAIN') && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#666', textAlign: 'left' }}>
                      대표 이미지를 교체하면 기존 대표 이미지는 저장 시 삭제됩니다.
                    </div>
                  )}
                  {newMainPreview && (
                    <div className={styles.fileList}>
                      <img src={newMainPreview} alt="미리보기" className={styles.fileImage} />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ marginBottom: '8px', textAlign: 'left', fontWeight: 600 }}>첨부 파일 추가</div>
                  <input type="file" multiple accept="image/*" onChange={handleNewFilesChange} />
                  {newFilePreviews.length > 0 && (
                    <div className={styles.fileList}>
                      {newFilePreviews.map((src, idx) => (
                        <img key={idx} src={src} alt={`첨부${idx}`} className={styles.fileImage} />
                      ))}
                    </div>
                  )}
                </div>
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
        </div>
      </form>
    </div>
  );
};

export default Update;