import React from 'react'
import Insert from '../../components/Board/Insert'
import * as boards from '../../apis/boards'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const InsertContainer = () => {
  const navigate = useNavigate()

  // 게시글 등록 요청 핸들러
  const onInsert = async (data, headers) => {
    try{
      const response = await boards.insert(data, headers)
      await response.data

      // 성공 메시지 Swal
      await Swal.fire({
        icon: 'success',
        title: '게시글이 등록되었습니다.',
        showConfirmButton: false,
        timer: 1500
      })

      // 게시글 목록으로 이동
      navigate('/boards')
    } catch(error){
      console.log(error)

      // 실패 메시지 Swal
      Swal.fire({
        icon: 'error',
        title: '게시글 등록에 실패했습니다.'
      })
    }
  }

  return (
    <>
      <Insert onInsert={onInsert}/>
    </>
  )
}

export default InsertContainer
