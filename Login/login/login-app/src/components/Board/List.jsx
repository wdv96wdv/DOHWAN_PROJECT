import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/List.module.css';
import noImage from '../../assets/img/no-image.png';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import * as format from '../../utils/format';
import '../../assets/css/common.module.css'
import Swal from "sweetalert2";

const List = ({ list = [], pagination }) => {

  // 로그인 여부 확인 함수
  const isLoggedIn = () => {
    const token = localStorage.getItem("jwt");
    return !!token; // token이 있으면 true, 없으면 false
  };

  const [pageList, setPageList] = useState([]);
  const API_URL = 'https://dohwan-project.onrender.com'; // 운영 서버 주소

  // 페이지 번호 리스트 생성
  const createPageList = () => {
    let newPageList = [];
    for (let i = pagination.start; i <= pagination.end; i++) {
      newPageList.push(i);
    }
    setPageList(newPageList);
  };

  useEffect(() => {
    createPageList();
  }, [pagination]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🏃‍♀️ 러닝 커뮤니티</h1>
      {isLoggedIn() ? (
        <Link to="/boards/insert" className={styles.btn}>
          글쓰기
        </Link>
      ) : (
        <button
          className={styles.btn}
          // 버튼 클릭 이벤트
          onClick={() => {
            Swal.fire({
              icon: "info", // info, warning, success 등 선택 가능
              title: "로그인 필요",
              text: "글쓰기는 로그인 후 이용 가능합니다.",
              confirmButtonText: "확인"
            });
          }}
        >
          글쓰기
        </button>
      )}

      <table className={styles.table}>
        {window.innerWidth > 768 && (
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '45%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
        )}
        <thead>
          <tr>
            <th>번호</th>
            <th>썸네일</th>
            <th>제목</th>
            <th>작성자</th>
            <th>등록일자</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan={5} align="center">
                조회된 게시글이 없습니다.
              </td>
            </tr>
          ) : (
            list.map((board) => (
              <tr key={board.no}>
                <td>{board.no}</td>
                <td>
                  <img
                    src={board.file?.filePath || noImage}
                    alt={board.file?.originName || 'no-image'}
                    className={styles.boardImg}
                  />
                </td>
                <td>
                  <Link to={`/boards/${board.id}`} className={styles.link}>
                    {board.title}
                  </Link>
                </td>
                <td>{board.writer}</td>
                <td>{format.formatDate(board.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <Link to={`/boards?page=${pagination.first}`} className={styles['btn-page']}>
          <KeyboardDoubleArrowLeftIcon />
        </Link>
        <Link to={`/boards?page=${pagination.prev}`} className={styles['btn-page']}>
          <KeyboardArrowLeftIcon />
        </Link>

        {pageList.map((page) => (
          <Link
            key={page}
            to={`/boards?page=${page}&size=${pagination.size}`}
            className={`${styles['btn-page']} ${page === Number(pagination.page) ? styles.active : ''}`}
          >
            {page}
          </Link>
        ))}

        <Link to={`/boards?page=${pagination.next}`} className={styles['btn-page']}>
          <KeyboardArrowRightIcon />
        </Link>
        <Link to={`/boards?page=${pagination.last}`} className={styles['btn-page']}>
          <KeyboardDoubleArrowRightIcon />
        </Link>
      </div>
    </div>
  );
};

export default List;
