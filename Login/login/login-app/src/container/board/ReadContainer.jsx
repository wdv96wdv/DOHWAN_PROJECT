import React, { useContext, useEffect, useState } from 'react'
import Read from '../../components/Board/Read'
import { useParams, useNavigate } from 'react-router-dom' // useNavigate 추가
import * as boards from '../../apis/boards'
import * as files from '../../apis/files'
import * as comments from '../../apis/comments'
import Swal from 'sweetalert2'
import useAuthStore from '../../store/useAuthStore'

const ReadContainer = () => {
  const { id } = useParams()
  const navigate = useNavigate() // useNavigate 인스턴스 생성
  const userInfo = useAuthStore(state => state.userInfo)

  const [board, setBoard] = useState({})
  const [fileList, setFileList] = useState([])
  const [commentList, setCommentList] = useState([])

  const getBoard = async () => {
    const response = await boards.select(id)
    const data = await response.data
    setBoard(data.board)
    setFileList(data.fileList)
  }

  const getComments = async () => {
    try {
      const response = await comments.list(id)
      const data = await response.data
      setCommentList(data || [])
    } catch (err) {
      console.error('댓글 목록 조회 실패:', err)
      setCommentList([])
    }
  }

  const onDownload = async (id, fileName) => {
    try {
      const file = fileList.find(f => f.id === id)
      if (!file || !file.filePath) throw new Error('파일 정보가 없습니다.')

      // URL에서 버킷 경로만 추출
      const url = new URL(file.filePath)
      const pathIndex = url.pathname.indexOf('/upload/') + '/upload/'.length
      const relativePath = url.pathname.substring(pathIndex) // MAIN/1760469488679-IMG_5582

      const blobData = await files.downloadFileFromSupabase(relativePath)

      const downloadUrl = window.URL.createObjectURL(blobData)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

    } catch (err) {
      console.error(err)
      alert('파일 다운로드 실패: ' + err.message)
    }
  }

  const onCreateComment = async (data) => {
    try {
      const newData = { ...data, userNo: userInfo.no, writer: userInfo.name };
      await comments.create(id, newData)
      await getComments() // 댓글 목록 다시 불러오기
      Swal.fire({ icon: 'success', title: '댓글이 등록되었습니다.', timer: 1500, showConfirmButton: false })
    } catch (err) {
      console.error('댓글 작성 실패:', err)
      Swal.fire({ icon: 'error', title: '댓글 작성에 실패했습니다.' })
    }
  }

  const onUpdateComment = async (commentId, data) => {
    try {
      const newData = { ...data, userNo: userInfo.no };
      await comments.update(id, commentId, newData)
      await getComments()
      Swal.fire({ icon: 'success', title: '댓글이 수정되었습니다.', timer: 1500, showConfirmButton: false })
    } catch (err) {
      console.error('댓글 수정 실패:', err)
      Swal.fire({ icon: 'error', title: '댓글 수정에 실패했습니다.' })
    }
  }

  const onDeleteComment = async (commentId, userNo) => {
    const result = await Swal.fire({
      title: '댓글을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    })
    if (!result.isConfirmed) return

    try {
      await comments.remove(id, commentId, { userNo })
      await getComments()
      Swal.fire({ icon: 'success', title: '댓글이 삭제되었습니다.', timer: 1500, showConfirmButton: false })
    } catch (err) {
      console.error('댓글 삭제 실패:', err)
      Swal.fire({ icon: 'error', title: '댓글 삭제 중 오류 발생:', text: err.message })
    }
  }

  // 게시글 삭제
  const onDelete = async (boardId) => {
    try {
      const response = await boards.remove(boardId);
      if (response.status >= 200 && response.status < 300) { // 2xx 상태 코드 확인
        Swal.fire({ icon: 'success', title: '게시글이 삭제되었습니다.', timer: 1500, showConfirmButton: false });
        navigate('/boards'); // 목록으로 이동
      } else {
        Swal.fire({ icon: 'error', title: `게시글 삭제에 실패했습니다. (상태 코드: ${response.status})` });
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류 발생:', error);
      Swal.fire({ icon: 'error', title: '게시글 삭제 중 오류가 발생했습니다.', text: error.message });
    }
  };

  useEffect(() => {
    getBoard()
    getComments()
  }, [id])

  return (
    <Read
      board={board}
      fileList={fileList}
      commentList={commentList}
      onDownload={onDownload}
      onCreateComment={onCreateComment}
      onUpdateComment={onUpdateComment}
      onDeleteComment={onDeleteComment}
      onDelete={onDelete} // onDelete prop 추가
    />
  )
}

export default ReadContainer