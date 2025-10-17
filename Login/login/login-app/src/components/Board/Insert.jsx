import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/Insert.module.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import * as fileApi from '../../apis/files';

const Insert = ({ onInsert }) => {
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    setMainFile(file);
    if (file) setMainPreview(URL.createObjectURL(file));
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setFilePreviews(selectedFiles.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title || !writer || !content) {
      return Swal.fire('입력 누락', '제목, 작성자, 내용을 입력해주세요.', 'warning');
    }

    setSubmitting(true);

    // 파일 업로드
    let mainFileInfo = null;
    if (mainFile) {
      const mainFileUrl = await fileApi.uploadFileToSupabase(mainFile, 'MAIN');
      mainFileInfo = {
        url: mainFileUrl,
        name: mainFile.name,
        originName: mainFile.name,
        size: mainFile.size,
      };
    }

    let filesInfo = [];
    for (let file of files) {
      const fileUrl = await fileApi.uploadFileToSupabase(file, 'SUB');
      filesInfo.push({
        url: fileUrl,
        name: file.name,
        originName: file.name,
        size: file.size,
      });
    }

    const data = { title, writer, content, mainFile: mainFileInfo, files: filesInfo };
    const headers = { 'Content-Type': 'multipart/form-data' };

    Swal.fire({
      title: '게시글 등록',
      text: '게시글을 등록하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '등록',
      cancelButtonText: '취소',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await onInsert(data, headers);
          Swal.fire('등록 완료!', '', 'success');
        } catch (err) {
          Swal.fire('등록 실패', '', 'error');
        } finally {
          setSubmitting(false);
        }
      } else {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>게시글 등록</h1>

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
                  onChange={(event, editor) => setContent(editor.getData())}
                />
              </td>
            </tr>

            <tr>
              <th>메인 이미지</th>
              <td>
                <input type="file" onChange={handleMainFileChange} />
                {mainPreview && (
                  <div className={styles.fileList}>
                    <img
                      src={mainPreview}
                      alt="미리보기"
                      className={styles.fileImage}
                    />
                  </div>
                )}
              </td>
            </tr>

            <tr>
              <th>첨부 파일</th>
              <td>
                <input type="file" multiple onChange={handleFilesChange} />
                {filePreviews.length > 0 && (
                  <div className={styles.fileList}>
                    {filePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt={`첨부${idx}`} className={styles.fileImage} />
                    ))}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.btnBox}>
          <Link to="/boards" className={styles.btnGray}>목록</Link>
          <button type="submit" className={styles.btnBlue} disabled={submitting}>
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Insert;
