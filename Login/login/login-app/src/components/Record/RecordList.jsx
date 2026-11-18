// src/components/Record/RecordList.jsx
import React, { useState, useMemo } from "react";
import RecordCard from "./RecordCard";
import { FolderOpen, Search, ArrowUpDown } from "lucide-react";
import "../../assets/css/record.css";

export default function RecordList({ records, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");

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
        // Lower pace number is faster (e.g. 500 < 530)
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} style={{ color: '#64748b' }} />
          <select
            className="record-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="distance">거리 높은순</option>
            <option value="pace">페이스 빠른순</option>
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
        <div className="records-container">
          {processedRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
