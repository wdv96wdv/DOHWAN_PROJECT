import { useEffect ,useState } from 'react';
import * as boards from '../../apis/boards';
import List from '../../components/board/List';
import { useLoaderData, useLocation } from 'react-router-dom';

const ListContainer = () => {

  // state
  const [pagination, setPagination] = useState([]);
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  
  //게시글 목록 데이터
  const getList = async () => {
    const response = await boards.list(page, size);
    const data = await response.data;
    const list = data.list;
    const pagination = data.pagination;

    console.dir(data);
    console.dir(data.list);
    console.dir(data.pagination);

    setList(list);
    setPagination(pagination);
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