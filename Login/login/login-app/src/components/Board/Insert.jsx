import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/Insert.module.css';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
import supabase from '../../utils/supabaseClient'; // Supabase 클라이언트 임포트

const Insert = ({ onInsert }) => {
  const [title, setTitle] = useState('');
  const [writer, setWriter] = useState('');
  const [content, setContent] = useState('');
  const [mainFile, setMainFile] = useState(null);
  const [files, setFiles] = useState(null);

  // 입력 핸들러
  const changeTitle = (e) => setTitle(e.target.value);
  const changeWriter = (e) => setWriter(e.target.value);
  const changeMainFile = (e) => setMainFile(e.target.files[0]);
  const changeFiles = (e) => setFiles(e.target.files);

  // 게시글 등록 시 이미지 업로드
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
    if (mainFile) formData.append('mainFile', mainFile);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    }

    // 파일 업로드 후 URL 가져오기
    let fileUrl = '';
    if (mainFile) {
      const fileName = `${mainFile.name}_${Date.now()}`;
      const { data, error } = await supabase
        .storage
        .from('upload') // 'upload'는 Supabase Storage 버킷 이름
        .upload(fileName, mainFile, {
          cacheControl: '3600', // 캐시 제어
          upsert: true, // 파일이 이미 있으면 덮어쓰기
        });

      if (error) {
        Swal.fire({
          icon: 'error',
          title: '파일 업로드 실패',
          text: error.message,
        });
        return;
      }

      // 업로드된 파일의 공개 URL
      const publicUrl = supabase
        .storage
        .from('upload')
        .getPublicUrl(fileName).publicURL;

      fileUrl = publicUrl; // URL을 사용
    }

    // formData에 fileUrl 추가
    formData.append('fileUrl', fileUrl);

    const headers = { 'Content-Type': 'multipart/form-data' };

    // 등록 확인
    Swal.fire({
      title: '게시글을 등록하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '등록',
      cancelButtonText: '취소',
    }).then((res) => {
      if (res.isConfirmed) {
        onInsert(formData, headers); // 백엔드에 파일과 함께 데이터 전달
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
