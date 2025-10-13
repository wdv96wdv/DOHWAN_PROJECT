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

  const API_URL = "https://dohwan-project.onrender.com";  // 서버 URL

  // 입력 핸들러
  const changeTitle = (e) => setTitle(e.target.value);
  const changeWriter = (e) => setWriter(e.target.value);

  const changeMainFile = (e) => {
    const file = e.target.files[0];
    setMainFile(file);
    if (file) setMainPreview(URL.createObjectURL(file)); // 미리보기 생성
  };

  const changeFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setFilePreviews(selectedFiles.map(f => URL.createObjectURL(f))); // 파일 미리보기
  };

  // CKEditor 업로드 플러그인
  function uploadPlugin(editor, pNo = 0) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return customUploadAdapter(loader, pNo);
    };
  }

  const customUploadAdapter = (loader, pNo) => {
    return {
      upload() {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file) => {
            try {
              // Supabase로 파일 업로드
              const fileUrl = await fileApi.uploadFileToSupabase(file, 'SUB'); // 'SUB'는 파일 종류

              resolve({
                default: fileUrl,  // 업로드된 파일의 URL을 CKEditor에 반환
              });
            } catch (err) {
              console.error('CKEditor 업로드 실패', err);
              reject(err);
            }
          });
        });
      },
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // 필수 입력 체크
    if (!title || !writer || !content) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ 입력 누락',
        text: '제목, 작성자, 내용을 모두 입력해주세요.',
      });
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('writer', writer);
    formData.append('content', content);

    // 메인 파일은 'MAIN' 폴더에 업로드
    if (mainFile) {
      const mainFileUrl = await fileApi.uploadFileToSupabase(mainFile, 'MAIN'); // 'MAIN' 폴더에 업로드
      formData.append('mainFileUrl', mainFileUrl);
    }

    // 첨부 파일들
    if (files.length > 0) {
      for (let file of files) {
        const fileUrl = await fileApi.uploadFileToSupabase(file, 'SUB'); // 'SUB' 폴더에 업로드
        formData.append('files', fileUrl);
      }
    }

    const headers = { 'Content-Type': 'multipart/form-data' };

    Swal.fire({
      title: '게시글을 등록하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '등록',
      cancelButtonText: '취소',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const newPost = await onInsert(formData, headers); 
          Swal.fire('등록 완료!', '', 'success');
        } catch (err) {
          console.error(err);
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
      <h1 className={styles.title}>🏃‍♀️ 새 게시글 작성</h1>

      <form onSubmit={onSubmit}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <th>제목</th>
              <td>
                <input
                  type="text"
                  value={title}
                  onChange={changeTitle}
                  placeholder="제목을 입력하세요"
                  className={styles.formInput}
                />
              </td>
            </tr>

            <tr>
              <th>작성자</th>
              <td>
                <input
                  type="text"
                  value={writer}
                  onChange={changeWriter}
                  placeholder="작성자를 입력하세요"
                  className={styles.formInput}
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
                  config={{
                    placeholder: '내용을 입력하세요.',
                    toolbar: [
                      'undo', 'redo', '|', 'heading', '|', 'bold', 'italic', 'link',
                      '|', 'bulletedList', 'numberedList', 'blockQuote', '|', 'uploadImage', 'mediaEmbed'
                    ],
                    alignment: { options: ['left', 'center', 'right', 'justify'] },
                    extraPlugins: [uploadPlugin],
                  }}
                  data={content}
                  onChange={(event, editor) => setContent(editor.getData())}
                />
              </td>
            </tr>

            <tr>
              <th>메인 파일</th>
              <td>
                <input type="file" onChange={changeMainFile} />
                {mainPreview && <img src={mainPreview} alt="미리보기" style={{ maxWidth: '150px', marginTop: '10px' }} />}
              </td>
            </tr>

            <tr>
              <th>첨부 파일</th>
              <td>
                <input type="file" multiple onChange={changeFiles} />
                {filePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {filePreviews.map((src, idx) => (
                      <img key={idx} src={src} alt={`첨부${idx}`} style={{ maxWidth: '100px' }} />
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
          <Link to="/boards" className={styles.btnGray}>취소</Link>
        </div>
      </form>
    </div>
  );
};

export default Insert;
