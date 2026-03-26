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
  Search,
  Map,
  Activity,
  Calendar,
  Users,
  User
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
    <div className="board-page trendy-list">
      <style>{`
        .trendy-list .board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.4);
        }
        .trendy-list .page-title-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(0, 123, 255, 0.1);
          padding: 8px 16px;
          border-radius: 20px;
          color: var(--primary, #007bff);
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .trendy-list header h1 {
          font-size: 2.8rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .trendy-list .btn-write {
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          border: none;
          box-shadow: 0 8px 16px rgba(0, 123, 255, 0.25);
          color: white;
          border-radius: 20px;
          padding: 14px 28px;
          font-weight: 700;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
        .trendy-list .btn-write:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 123, 255, 0.35);
        }
        .trendy-list .board-table-container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          padding: 0;
        }
        .trendy-list .board-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .trendy-list .board-table th {
          background: #f8fafc;
          padding: 20px 24px;
          font-weight: 700;
          color: #64748b;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #f1f5f9;
        }
        .trendy-list .board-table td {
          padding: 20px 24px;
          vertical-align: middle;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.3s ease;
        }
        .trendy-list .board-table tr {
          transition: all 0.2s ease;
        }
        .trendy-list .board-table tbody tr:hover {
          background: #f8fafc;
          transform: scale(1.002);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          position: relative;
          z-index: 10;
        }
        .trendy-list .board-table tbody tr:hover td {
          border-bottom-color: transparent;
        }
        .trendy-list .board-thumb {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          transition: transform 0.3s ease;
        }
        .trendy-list .board-table tr:hover .board-thumb {
          transform: scale(1.05);
        }
        .trendy-list .board-link {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          text-decoration: none;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .trendy-list .board-link:hover {
          color: var(--primary, #007bff);
        }
        .trendy-list .writer-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
        }
        .trendy-list .comment-count {
          background: #ffe4e6;
          color: #e11d48;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .trendy-list .pagination {
          margin-top: 48px;
          gap: 12px;
        }
        .trendy-list .page-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: none;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: #475569;
          font-weight: 600;
        }
        .trendy-list .page-btn:hover {
          background: #f8fafc;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          color: var(--primary, #007bff);
        }
        .trendy-list .page-btn.active {
          background: linear-gradient(135deg, var(--primary, #007bff) 0%, #8a2be2 100%);
          color: white;
          box-shadow: 0 8px 16px rgba(0, 123, 255, 0.25);
        }
        /* 다크모드 대응 */
        @media (prefers-color-scheme: dark) {
          .trendy-list .board-table-container { background: rgba(30, 41, 59, 0.6); border-color: rgba(255,255,255,0.1); }
          .trendy-list header h1 { background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%); -webkit-background-clip: text; }
          .trendy-list .board-table th { background: #0f172a; color: #94a3b8; border-color: #1e293b; }
          .trendy-list .board-table td { border-color: #1e293b; }
          .trendy-list .board-table tbody tr:hover { background: #1e293b; }
          .trendy-list .board-link { color: #f1f5f9; }
          .trendy-list .writer-badge { background: #0f172a; color: #cbd5e1; }
          .trendy-list .page-btn { background: #1e293b; color: #cbd5e1; }
          .trendy-list .page-btn:hover { background: #0f172a; }
        }
      `}</style>

      <header className="board-header">
        <div>
          <div className="page-title-badge"><Users size={16} style={{ marginRight: '6px' }} /> COMMUNITY</div>
          <h1>COMMUNITY</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '8px', fontWeight: 500 }}>코스 추천부터 일상까지, 자유롭게 소통하세요.</p>
        </div>
        <Link to="/boards/insert" className="btn-write" onClick={handleWriteClick}>
          <Pencil size={18} style={{ marginRight: '8px' }} /> CREATE POST
        </Link>
      </header>

      <div className="board-table-container">
        <table className="board-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>NO</th>
              <th style={{ width: '120px', textAlign: 'center' }}>THUMBNAIL</th>
              <th>SUBJECT</th>
              <th style={{ width: '160px', textAlign: 'center' }}>WRITER</th>
              <th style={{ width: '140px', textAlign: 'center' }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '100px 0', textAlign: 'center', opacity: 0.5 }}>
                  <Search size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
                  No posts found.
                </td>
              </tr>
            ) : (
              list.map((board, index) => (
                <tr key={board.id}>
                  <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                    {index + 1 + (pagination.page - 1) * pagination.size}
                  </td>
                  <td style={{ textAlign: 'center' }}>
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
                          <MessageSquare size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                          {board.commentCount}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="writer-badge">
                      <User size={14} />
                      {board.writer}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
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