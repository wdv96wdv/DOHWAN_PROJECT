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
  MessageSquare,
  X
} from 'lucide-react';
import * as format from '../../utils/format';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';

import Skeleton from '../Common/Skeleton';

const List = ({ list = [], pagination, currentFilters }) => {
  const isLogin = useAuthStore(state => state.isLogin);
  const navigate = useNavigate();
  const [pageList, setPageList] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [searchInput, setSearchInput] = useState(currentFilters?.keyword || '');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeRunners: 0, popularKeywords: [] });

  const categories = ['전체', '자유', '정보', '코스추천', 'Q&A'];

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (list.length > 0 || (pagination && pagination.totalCount === 0)) {
        setLoading(false);
        // Extract keywords from current list categories
        if (list.length > 0) {
            const counts = {};
            list.forEach(item => {
                const type = item.type || '자유';
                counts[type] = (counts[type] || 0) + 1;
            });
            const topKeywords = Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([name]) => `#${name}`);
            
            setStats(prev => ({ ...prev, popularKeywords: topKeywords.length > 0 ? topKeywords : ['#러닝', '#마라톤'] }));
        }
    } else {
        setLoading(true);
    }
  }, [list, pagination]);

  useEffect(() => {
    // Fetch real active runners from DB
    fetch(`${API_BASE_URL}/records/stats`)
      .then(res => res.json())
      .then(data => {
         if (data.data) {
            setStats(prev => ({ ...prev, activeRunners: data.data.activeRunners }));
         }
      })
      .catch(err => console.error("Failed to fetch community stats:", err));
  }, []);

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
    }, 500);

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
        confirmButtonColor: 'var(--primary)',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)'
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
            <h1 className="main-title">COMMUNITY</h1>
            <p className="description">전국의 러너들과 소중한 러닝 경험을 공유하세요.</p>
          </div>

          <div className="header-actions">
            <Link to="/boards/insert" className="premium-btn btn-write" onClick={handleWriteClick}>
              <Plus size={20} />
              <span>새 글 작성</span>
            </Link>
          </div>
        </div>

        {/* Community Stats Quick View */}
        <div className="community-stats-bar glass" style={{ marginBottom: '30px' }}>
            <div className="stat-item">
                <span className="stat-label">오늘의 새 글</span>
                <span className="stat-value">{pagination?.totalCount > 10 ? '12+' : pagination?.totalCount || 0}</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">활발한 러너</span>
                <span className="stat-value">{stats.activeRunners.toLocaleString()}명</span>
            </div>
            <div className="stat-item">
                <span className="stat-label">인기 키워드</span>
                <span className="stat-value">{stats.popularKeywords.join(' ')}</span>
            </div>
        </div>

        {/* Categories & Search Toolbar */}
        <div className="board-toolbar glass">
          <div className="categories-segmented">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-segment ${currentFilters?.type === cat ? 'active' : ''}`}
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
              >
                <ListIcon size={18} />
              </button>
              <button
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <form className="search-box-premium" onSubmit={handleSearchSubmit}>
              <div className="search-input-inner">
                <Search size={18} className={`search-icon ${searchInput ? 'active' : ''}`} />
                <input
                  type="text"
                  placeholder="무엇을 찾으시나요?"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button 
                    type="button" 
                    className="search-clear-btn"
                    onClick={() => setSearchInput('')}
                  >
                    <X size={14} />
                  </button>
                )}
                {!searchInput && <span className="search-shortcut">/</span>}
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <div className={`board-content-wrapper view-mode-${viewMode}`}>
        {viewMode === 'list' && !loading && list.length > 0 && (
          <div className="board-table-header">
            <div className="col-type">종류</div>
            <div className="col-thumb">이미지</div>
            <div className="col-info">제목</div>
            <div className="col-writer">작성자</div>
            <div className="col-date">날짜</div>
          </div>
        )}

        <div className={`board-list-container ${viewMode}`}>
          {loading ? (
             // Loading Skeletons
             Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`board-item-row glass ${viewMode === 'grid' ? 'grid-item' : ''}`} style={{ padding: '20px' }}>
                   <Skeleton type="list" />
                </div>
             ))
          ) : list.length === 0 ? (
            <div className="empty-state glass">
              <Search size={48} />
              <p>원하는 검색 결과가 없습니다.</p>
              <span className="sub-text">첫 번째 소식을 남겨보시는 건 어떨까요?</span>
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
                    loading="lazy"
                  />
                </div>

                <div className="item-info">
                  <Link to={`/boards/${board.id}`} className="item-title">
                    {board.title}
                    {board.commentCount > 0 && (
                      <span className="comment-count-inline">
                        <MessageSquare size={12} style={{ margin: '0 4px 0 8px' }} />
                        {board.commentCount}
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
      {!loading && list.length > 0 && (
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
      )}
    </div>
  );
};

export default List;