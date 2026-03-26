import React from 'react'
import Insert from '../../components/Board/Insert'
import * as boards from '../../apis/boards'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const InsertContainer = () => {
  const navigate = useNavigate()

  // 게시글 등록 요청 핸들러
  const onInsert = async (data, headers) => {
    const response = await boards.insert(data, headers)
    return response.data
  }

  return (
    <>
      <Insert onInsert={onInsert}/>
    </>
  )
}

export default InsertContainer
