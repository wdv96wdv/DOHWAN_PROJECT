import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import noImage from '../../assets/img/no-image.png';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Pencil, 
  MessageSquare,
  Search
} from 'lucide-react';
import * as format from '../../utils/format';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';

const List = ({ list = [], pagination }) => {
  const isLogin = useAuthStore(state => state.isLogin);
  const [pageList, setPageList] = useState([]);

  useEffect(() => {
    createPageList();
  }, [pagination]);

  const createPageList = () => {
    const newPageList = [];
    for (let i = pagination.start; i <= pagination.end; i++) {
      newPageList.push(i);
    }
    setPageList(newPageList);
  };

  const handleWriteClick = (e) => {
    if (!isLogin) {
      e.preventDefault();
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to write a post.',
        confirmButtonColor: 'var(--primary)'
      });
    }
  };

  return (
    <div className="board-page">
      <header className="board-header">
        <h1>COMMUNITY</h1>
        <Link to="/boards/insert" className="btn-auth" onClick={handleWriteClick} style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
          <Pencil size={16} style={{marginRight: '8px'}} /> WRITE
        </Link>
      </header>

      <div className="board-table-container">
        <table className="board-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>NO</th>
              <th style={{ width: '100px' }}>THUMB</th>
              <th>SUBJECT</th>
              <th style={{ width: '150px' }}>WRITER</th>
              <th style={{ width: '150px', textAlign: 'right' }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '100px 0', textAlign: 'center', opacity: 0.5 }}>
                  <Search size={48} style={{margin: '0 auto 16px', display: 'block'}} />
                  No posts found.
                </td>
              </tr>
            ) : (
              list.map((board, index) => (
                <tr key={board.id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {index + 1 + (pagination.page - 1) * pagination.size}
                  </td>
                  <td>
                    <img
                      src={board.file?.filePath || noImage}
                      alt="thumb"
                      className="board-thumb"
                    />
                  </td>
                  <td>
                    <Link to={`/boards/${board.id}`} className="board-link">
                      {board.title}
                      {board.commentCount > 0 && (
                        <span className="comment-count">
                          <MessageSquare size={12} style={{marginRight: '4px', verticalAlign: 'middle'}} />
                          {board.commentCount}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{board.writer}</div>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {format.formatDate(board.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <Link to={`/boards?page=${pagination.first}`} className="page-btn">
          <ChevronsLeft size={18} />
        </Link>
        <Link to={`/boards?page=${pagination.prev}`} className="page-btn">
          <ChevronLeft size={18} />
        </Link>

        {pageList.map((page) => (
          <Link
            key={page}
            to={`/boards?page=${page}&size=${pagination.size}`}
            className={`page-btn ${page === Number(pagination.page) ? 'active' : ''}`}
          >
            {page}
          </Link>
        ))}

        <Link to={`/boards?page=${pagination.next}`} className="page-btn">
          <ChevronRight size={18} />
        </Link>
        <Link to={`/boards?page=${pagination.last}`} className="page-btn">
          <ChevronsRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default List;