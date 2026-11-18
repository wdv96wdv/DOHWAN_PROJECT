// src/components/Record/RecordList.jsx
import React, { useState, useMemo } from "react";
import RecordCard from "./RecordCard";
import { 
  FolderOpen, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import "../../assets/css/record.css";

export default function RecordList({ records, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Filtering & Sorting
  const processedRecords = useMemo(() => {
    if (!records) return [];

    let list = [...records];

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => {
        const nameMatch = r.running_name?.toLowerCase().includes(q);
        const noteMatch = r.note?.toLowerCase().includes(q);
        return nameMatch || noteMatch;
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "distance") {
        return (Number(b.distance_km) || 0) - (Number(a.distance_km) || 0);
      }
      if (sortBy === "pace") {
        const paceA = Number(a.pace_min_per_km) || 9999;
        const paceB = Number(b.pace_min_per_km) || 9999;
        return paceA - paceB;
      }
      // default: latest date
      const dateA = new Date(a.record_date || 0).getTime();
      const dateB = new Date(b.record_date || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [records, search, sortBy]);

  // Pagination calculation
  const totalItems = processedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, safeCurrentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  if (!records || records.length === 0) {
    return (
      <div className="record-empty-state">
        <FolderOpen size={48} className="record-empty-icon" />
        <h3>아직 저장된 러닝 기록이 없습니다.</h3>
        <p>상단의 활동 기록 양식이나 나이키 런 스크린샷으로 첫 번째 러닝을 기록해 보세요!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="record-toolbar">
        <div className="record-search-box">
          <Search size={16} className="record-search-icon" />
          <input
            type="text"
            className="record-search-input"
            placeholder="활동명 또는 메모 검색..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} style={{ color: '#64748b' }} />
            <select
              className="record-sort-select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="latest">최신순</option>
              <option value="distance">거리 높은순</option>
              <option value="pace">페이스 빠른순</option>
            </select>
          </div>

          <select
            className="record-sort-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            title="페이지당 표시 개수"
          >
            <option value={5}>5개씩 보기</option>
            <option value={10}>10개씩 보기</option>
            <option value={20}>20개씩 보기</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      {processedRecords.length === 0 ? (
        <div className="record-empty-state" style={{ padding: '50px 20px' }}>
          <Search size={36} className="record-empty-icon" />
          <h3>검색 조건과 일치하는 기록이 없습니다.</h3>
          <p>검색어를 다시 확인해 보세요.</p>
        </div>
      ) : (
        <>
          <div className="records-container">
            {paginatedRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="record-pagination">
              <span className="record-page-info">
                총 {totalItems}개 중 {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, totalItems)}
              </span>

              <div className="record-page-btns">
                <button
                  type="button"
                  className="record-page-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  title="첫 페이지"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  className="record-page-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  title="이전 페이지"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="record-page-dots">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        className={`record-page-btn num ${p === safeCurrentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  type="button"
                  className="record-page-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  title="다음 페이지"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  className="record-page-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  title="마지막 페이지"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
