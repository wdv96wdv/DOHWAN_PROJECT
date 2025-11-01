import { useEffect, useState, useCallback, useRef } from 'react';
import * as boards from '../../apis/boards';
import List from '../../components/Board/List';
import { useLocation } from 'react-router-dom';

const ListContainer = () => {

  // state
  const [pagination, setPagination] = useState([]);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const loadingRef = useRef(false); // 중복 요청 방지를 위한 ref
  
  const location = useLocation();

  //게시글 목록 데이터 (재시도 포함) - useCallback으로 메모이제이션
  const getList = useCallback(async () => {
    if (loadingRef.current) return; // 이미 로딩 중이면 중복 요청 방지
    
    loadingRef.current = true;
    const maxAttempts = 3;
    const baseDelayMs = 300;
    
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await boards.list(page, size);
          const data = await response.data;
          const list = data.list || [];
          const pagination = data.pagination || {};
          setList(list);
          setPagination(pagination);
          break;
        } catch (err) {
          console.warn(`보드 목록 조회 실패(${attempt}/${maxAttempts})`, err);
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
            continue;
          }
          setList([]);
          setPagination({});
        }
      }
    } finally {
      loadingRef.current = false;
    }
  }, [page, size]);

  //페이지 번호 클릭 -> URL page 파라미터 변경
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const newPage = parseInt(query.get('page')) || 1;
    const newSize = parseInt(query.get('size')) || 10;
    
    // 값이 실제로 변경되었을 때만 state 업데이트 (불필요한 재렌더링 방지)
    if (newPage !== page || newSize !== size) {
      setPage(newPage);
      setSize(newSize);
    }
  }, [location.search, page, size]);

  // page나 size가 변경될 때마다 데이터 로드
  useEffect(() => {
    getList();
  }, [getList]); 

  return (
  <>
    <List list={list} pagination={pagination} />
  </>
  )
}

export default ListContainer