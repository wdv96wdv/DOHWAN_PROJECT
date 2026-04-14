import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../assets/css/board.css";
import "../../assets/css/auth.css";
import noImage from '../../assets/img/no-image.png';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  User,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Search,
  MessageSquare
} from 'lucide-react';
import * as format from '../../utils/format';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';

const List = ({ list = [], pagination, currentFilters }) => {
  const isLogin = useAuthStore(state => state.isLogin);
  const navigate = useNavigate();
  const [pageList, setPageList] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchInput, setSearchInput] = useState(currentFilters?.keyword || '');

  const categories = ['전체', '자유', '정보', '코스추천', 'Q&A'];

  useEffect(() => {
    createPageList();
  }, [pagination]);

  useEffect(() => {
    setSearchInput(currentFilters?.keyword || '');
  }, [currentFilters?.keyword]);

  // Real-time Search Debounce logic
  useEffect(() => {
    if (searchInput === (currentFilters?.keyword || '')) return;

    const debounceTimer = setTimeout(() => {
      navigate(`/boards?page=1&type=${encodeURIComponent(currentFilters?.type || '전체')}&keyword=${encodeURIComponent(searchInput)}`);
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [searchInput, currentFilters?.type, navigate]);

  const createPageList = () => {
    const newPageList = [];
    if (pagination && pagination.start && pagination.end) {
      for (let i = pagination.start; i <= pagination.end; i++) {
        newPageList.push(i);
      }
    }
    setPageList(newPageList);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/boards?page=1&type=${encodeURIComponent(cat)}&keyword=${encodeURIComponent(searchInput)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/boards?page=1&type=${encodeURIComponent(currentFilters?.type || '전체')}&keyword=${encodeURIComponent(searchInput)}`);
  };

  const handleWriteClick = (e) => {
    if (!isLogin) {
      e.preventDefault();
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: '게시글을 작성하려면 로그인이 필요합니다.',
        confirmButtonColor: 'var(--primary)'
      });
    }
  };

  const getPageUrl = (page) => {
    return `/boards?page=${page}&size=${pagination.size}&type=${currentFilters?.type || '전체'}&keyword=${searchInput}`;
  };

  return (
    <div className="board-page premium-board">
      {/* Header Section */}
      <header className="board-index-header">
        <div className="header-content">
          <div className="title-area">
            <span className="subtitle">DORUNNING COMMUNITY</span>
            <h1 className="main-title">우리들의 달리기 이야기</h1>
            <p className="description">함께 뛰고 소통하며 더욱 즐거운 러닝 라이프를 만들어가세요.</p>
          </div>
          
          <div className="header-actions">
            <Link to="/boards/insert" className="premium-btn btn-write" onClick={handleWriteClick}>
              <Plus size={20} />
              <span>새 글 쓰기</span>
            </Link>
          </div>
        </div>

        {/* Categories & Search Toolbar */}
        <div className="board-toolbar glass">
          <div className="categories">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-item ${currentFilters?.type === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="toolbar-right">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="리스트 형태로 보기"
              >
                <ListIcon size={18} />
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="그리드 형태로 보기"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            
            <form className="search-box" onSubmit={handleSearchSubmit}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="검색어를 입력하세요..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className={`board-content-wrapper view-mode-${viewMode}`}>
        {viewMode === 'list' && (
          <div className="board-table-header">
            <div className="col-type">종류</div>
            <div className="col-thumb">이미지</div>
            <div className="col-info">보드 정보</div>
            <div className="col-writer">작성자</div>
            <div className="col-date">날짜</div>
          </div>
        )}

        <div className={`board-list-container ${viewMode}`}>
          {list.length === 0 ? (
            <div className="empty-state glass">
              <Search size={48} />
              <p>검색 결과가 없습니다.</p>
              <span className="sub-text">새로운 소식을 가장 먼저 전해보세요!</span>
            </div>
          ) : (
            list.map((board) => (
              <div key={board.id} className={`board-item-row glass ${viewMode === 'grid' ? 'grid-item' : ''}`}>
                <div className="item-type">
                  <span className={`type-badge ${board.type || '자유'}`}>
                    {board.type || '자유'}
                  </span>
                </div>
                
                <div className="item-thumb-wrapper">
                  <img
                    src={board.file?.filePath || noImage}
                    alt="thumb"
                    className="item-thumb"
                  />
                </div>

                <div className="item-info">
                  <Link to={`/boards/${board.id}`} className="item-title">
                    {board.title}
                    {board.commentCount > 0 && (
                      <span className="comment-count-inline">
                        ({board.commentCount})
                      </span>
                    )}
                  </Link>
                </div>
                
                <div className="item-writer">
                  <div className="avatar-mini">
                    <User size={14} />
                  </div>
                  <span>{board.writer}</span>
                </div>

                <div className="item-date">
                  <Clock size={14} />
                  <span>{format.formatDate(board.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <footer className="board-footer">
        <div className="pagination-area">
          <div className="pagination premium-pagination">
            <Link to={getPageUrl(pagination.first)} className="page-link">
              <ChevronsLeft size={18} />
            </Link>
            <Link to={getPageUrl(pagination.prev)} className="page-link">
              <ChevronLeft size={18} />
            </Link>

            <div className="page-numbers">
              {pageList.map((page) => (
                <Link
                  key={page}
                  to={getPageUrl(page)}
                  className={`page-number ${page === Number(pagination.page) ? 'active' : ''}`}
                >
                  {page}
                </Link>
              ))}
            </div>

            <Link to={getPageUrl(pagination.next)} className="page-link">
              <ChevronRight size={18} />
            </Link>
            <Link to={getPageUrl(pagination.last)} className="page-link">
              <ChevronsRight size={18} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default List;