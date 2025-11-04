import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../assets/css/common.module.css';

const CsvUploader = () => {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택해주세요!');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/run/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('CSV 업로드 성공!');
    } catch (err) {
      alert('업로드 실패');
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📂 CSV 업로드</h2>
      <input type="file" accept=".csv" onChange={handleChange} className={styles.formInput} />
      <div className={styles.btnBox}>
        <button onClick={handleUpload} className={styles.btn}>업로드</button>
      </div>
    </div>
  );
};

export default CsvUploader;