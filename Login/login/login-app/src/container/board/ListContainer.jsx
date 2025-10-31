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
  
  //게시글 목록 데이터 (재시도 포함)
  const getList = async () => {
    const maxAttempts = 3;
    const baseDelayMs = 300;
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
    console.log(`newPage: ${newPage}`);
    console.log(`newSize: ${newSize}`);
    setPage(newPage);
    setSize(newSize);
  }

  // ❓
  useEffect(() => {
    getList();
  }, [page, size]);
  // 의존성배열 [page, size]
  // : page, size 바뀔 때마다 재실행

  useEffect(() => {
    updatePage()
  },[location.search]);
  // URL 쿼리스트링이 바뀔때마다 재실행 

  return (
  <>
    <List list={list} pagination={pagination} />
  </>
  )
}

export default ListContainer