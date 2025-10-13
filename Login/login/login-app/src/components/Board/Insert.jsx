import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/Insert.module.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import { uploadFile } from '../../utils/supabaseClient'; // Supabase 업로드 함수
import * as fileApi from '../../apis/files';

const Insert = ({ onInsert }) => {
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [files, setFiles] = useState(null);

  const changeTitle = (e) => setTitle(e.target.value);
  const changeWriter = (e) => setWriter(e.target.value);
  const changeMainFile = (e) => setMainFile(e.target.files[0]);
  const changeFiles = (e) => setFiles(e.target.files);

  // CKEditor 업로드 플러그인
  function uploadPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return customUploadAdapter(loader);
    };
  }

  const customUploadAdapter = (loader) => {
    return {
      upload() {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file) => {
            try {
              // SUB 폴더에 업로드
              const uploadResponse = await uploadFile(file, 'SUB');
              
              // 업로드 성공하면 Supabase URL 반환
              const fileUrl = `https://ismclnqslxnlsfmqjytc.supabase.co/storage/v1/object/public/SUB/${uploadResponse.path}`;
              resolve({ default: fileUrl });
            } catch (err) {
              console.error('CKEditor 업로드 실패:', err);
              reject(err);
            }
          });
        });
      },
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!title || !writer || !content) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ 입력 누락',
        text: '제목, 작성자, 내용을 모두 입력해주세요.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('writer', writer);
    formData.append('content', content);

    // -----------------------------
    // 1. 메인 파일 업로드 (MAIN)
    // -----------------------------
    if (mainFile) {
      try {
        const mainFileData = await uploadFile(mainFile, 'MAIN'); // Supabase Storage에 업로드
        console.log('메인 파일 업로드 성공:', mainFileData);

        // DB에 저장할 경로를 formData에 넣기
        formData.append('mainFile', mainFileData.path); 
      } catch (error) {
        console.error('메인 파일 업로드 실패:', error);
        return;
      }
    }

    // -----------------------------
    // 2. 첨부 파일 업로드 (SUB)
    // -----------------------------
    if (files) {
      for (let i = 0; i < files.length; i++) {
        try {
          const fileData = await uploadFile(files[i], 'SUB');
          console.log(`첨부파일 ${i} 업로드 성공:`, fileData);

          // DB에 저장할 경로를 formData에 넣기
          formData.append('files', fileData.path);
        } catch (error) {
          console.error(`첨부 파일 ${i} 업로드 실패:`, error);
          return;
        }
      }
    }

    const headers = { 'Content-Type': 'multipart/form-data' };

    // -----------------------------
    // 3. 게시글 등록
    // -----------------------------
    Swal.fire({
      title: '게시글을 등록하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '등록',
      cancelButtonText: '취소',
    }).then((res) => {
      if (res.isConfirmed) {
        onInsert(formData, headers); // 백엔드로 게시글 전송
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
                    toolbar: {
                      items: [
                        'undo', 'redo',
                        '|', 'heading',
                        '|', 'bold', 'italic', 'link',
                        '|', 'bulletedList', 'numberedList', 'blockQuote',
                        '|', 'uploadImage', 'mediaEmbed',
                      ],
                      shouldNotGroupWhenFull: false,
                    },
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
              </td>
            </tr>

            <tr>
              <th>첨부 파일</th>
              <td>
                <input type="file" multiple onChange={changeFiles} />
              </td>
            </tr>
          </tbody>
        </table>

        <div className={styles.btnBox}>
          <Link to="/boards" className={styles.btnGray}>목록</Link>
          <button type="submit" className={styles.btnBlue}>등록</button>
          <Link to="/boards" className={styles.btnGray}>취소</Link>
        </div>
      </form>
    </div>
  );
};

export default Insert;
