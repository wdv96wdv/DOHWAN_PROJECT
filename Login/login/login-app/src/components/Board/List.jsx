import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/list.module.css';
import noImage from '../../assets/img/no-image.png';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import * as format from '../../utils/format';

const List = ({ list, pagination }) => {
  const [pageList, setPageList] = useState([]);

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
      <h1 className={styles.title}>게시글 제목</h1>
      <Link to="/boards/insert" className={styles.btn}>
        글쓰기
      </Link>

      <table className={styles.table}>
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
                    src={board.file ? `/api/files/img/${board.file.id}` : noImage}
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
