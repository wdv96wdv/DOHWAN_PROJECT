import { useEffect ,useState } from 'react';
import * as boards from '../../apis/boards';
import List from '../../components/Board/List';
import { useLoaderData, useLocation } from 'react-router-dom';

const ListContainer = () => {

  // state
  const [pagination, setPagination] = useState([]);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [type, setType] = useState('전체');  // 카테고리
  const [keyword, setKeyword] = useState(''); // 검색어
  
  //게시글 목록 데이터 (재시도 포함)
  const getList = async () => {
    const maxAttempts = 3;
    const baseDelayMs = 300;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await boards.list(page, size, type, keyword);
        const resData = response.data.data;
        const list = resData.list || [];
        const pagination = resData.pagination || {};
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
      }
    }
  }

  // URL 가져오는 방법
  const location = useLocation();

  //페이지 번호 클릭 -> URL page 파라미터 변경
  const updatePage = () => {
    const query = new URLSearchParams(location.search);
    const newPage = query.get('page') ?? 1;
    const newSize = query.get('size') ?? 10;
    const newType = query.get('type') ?? '전체';
    const newKeyword = query.get('keyword') ?? '';
    
    setPage(Number(newPage));
    setSize(Number(newSize));
    setType(newType);
    setKeyword(newKeyword);
  }

  useEffect(() => {
    getList();
  }, [page, size, type, keyword]);

  useEffect(() => {
    updatePage()
  },[location.search]);

  return (
  <>
    <List list={list} pagination={pagination} currentFilters={{ type, keyword }} />
  </>
  )
}

export default ListContainer