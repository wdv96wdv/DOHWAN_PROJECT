import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../assets/css/List.module.css';
import noImage from '../../assets/img/no-image.png';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import * as format from '../../utils/format';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

const List = ({ list = [], pagination }) => {
  const [pageList, setPageList] = useState([]);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    setIsWide(window.innerWidth > 768);
    createPageList();
  }, [pagination]);

  const isLoggedIn = () => {
    // 1. localStorage의 userInfo나 isLogin 확인 (가장 확실)
    const isLogin = localStorage.getItem('isLogin');
    if (isLogin === 'true') {
      return true;
    }

    // 2. 쿠키에서 JWT 가져오기
    const cookieToken = Cookies.get('jwt');
    if (cookieToken) {
      return true;
    }

    // 3. localStorage에서 JWT 가져오기 (기존 방식)
    const localToken = localStorage.getItem('jwt');
    return !!localToken;
  };

  const createPageList = () => {
    const newPageList = [];
    for (let i = pagination.start; i <= pagination.end; i++) {
      newPageList.push(i);
    }
    setPageList(newPageList);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🏃‍♀️ 러닝 커뮤니티</h1>

      {isLoggedIn() ? (
        <Link to="/boards/insert" className={styles.btn}>글쓰기</Link>
      ) : (
        <button
          className={styles.btn}
          onClick={() => {
            Swal.fire({
              icon: 'info',
              title: '로그인 필요',
              text: '글쓰기는 로그인 후 이용 가능합니다.',
              confirmButtonText: '확인',
            });
          }}
        >
          글쓰기
        </button>
      )}

      <table className={styles.table}>
        {isWide && (
          <colgroup>
            <col style={{ width: '3%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '12%' }} />
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
              <td colSpan={5} align="center">조회된 게시글이 없습니다.</td>
            </tr>
          ) : (
            list.map((board, index) => (
              <tr key={board.id}>
                <td>{index + 1}</td>
                <td>
                  <img
                    src={board.file?.filePath || noImage}
                    alt={board.file?.originName || 'no-image'}
                    className={styles.boardImg}
                  />
                </td>
                <td>
                  <Link to={`/boards/${board.id}`} className={styles.link}>
                    {truncateText(board.title, 30)}
                    {board.commentCount > 0 && (
                      <span style={{ marginLeft: '4px', color: '#888' }}>
                        ({board.commentCount})
                      </span>
                    )}
                  </Link>
                </td>
                <td>{truncateText(board.writer, 10)}</td>
                <td>{format.formatDate(board.createdAt)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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