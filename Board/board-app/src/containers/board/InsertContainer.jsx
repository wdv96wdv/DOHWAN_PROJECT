import React from 'react'
import Insert from '../../components/board/Insert'
import * as boards from '../../apis/boards'
import { useNavigate } from 'react-router-dom'

const InsertContainer = () => {

  const navigate = useNavigate()
// 게시글 등록 요청 핸들러

const onInsert = async (data, headers) => {
  try{
    const response = await boards.insert(data, headers)
    const msg = await response.data
    console.log(msg);
    alert('게시글이 등록 되었습니다.')
    //게시글 목록으로 이동
    navigate('/boards')
  } catch(error){
    console.log(error)
    alert('게시글 등록이 실패하였습니다.')
  }
}

  return (
    <>
      <Insert onInsert={onInsert}/>
    </>
  )
}

export default InsertContainer