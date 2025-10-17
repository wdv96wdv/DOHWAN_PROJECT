import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

import Update from '../../components/Board/Update'
import * as boards from '../../apis/boards'
import * as files from '../../apis/files'

const UpdateContainer = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [board, setBoard] = useState({})
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    getBoard()
  }, [])

  const getBoard = async () => {
    try {
      const response = await boards.select(id)
      const data = await response.data
      setBoard(data.board)
      setFileList(data.fileList)
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: '게시글 조회 중 오류가 발생했습니다.' })
    }
  }

  const onDownload = async (fileId, fileName) => {
    try {
      const file = fileList.find(f => f.id === fileId)
      if (!file || !file.filePath) throw new Error('파일 정보가 없습니다.')

      const url = new URL(file.filePath)
      const pathIndex = url.pathname.indexOf('/upload/') + '/upload/'.length
      const relativePath = url.pathname.substring(pathIndex)

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
      Swal.fire({ icon: 'error', title: '파일 다운로드 실패', text: err.message })
    }
  }

  const onUpdate = async (data, headers) => {
    try {
      await boards.update(data, headers)
      Swal.fire({ icon: 'success', title: '게시글이 수정되었습니다.', timer: 1500, showConfirmButton: false })
      navigate('/boards')
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: '게시글 수정에 실패했습니다.' })
    }
  }

  const onDelete = async (boardId) => {
    const result = await Swal.fire({
      title: '정말로 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    })
    if (!result.isConfirmed) return

    try {
      await boards.remove(boardId)
      Swal.fire({ icon: 'success', title: '게시물이 삭제되었습니다.', timer: 1500, showConfirmButton: false })
      navigate('/boards')
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: '게시물 삭제 중 오류가 발생했습니다.' })
    }
  }

  const onDeleteFile = async (fileId) => {
    const file = fileList.find(f => f.id === fileId)
    if (!file) return Swal.fire({ icon: 'info', title: '파일 정보가 없습니다.' })

    const result = await Swal.fire({
      title: '정말 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    })
    if (!result.isConfirmed) return

    try {
      // Supabase 삭제 시 실패해도 UI 진행
      try {
        await files.deleteFileFromSupabase(file.filePath)
      } catch (err) {
        console.warn('Supabase 삭제 실패', err)
      }

      // DB 삭제 시 실패해도 UI 진행
      try {
        await files.remove(fileId)
      } catch (err) {
        console.warn('DB 삭제 실패', err)
      }

      setFileList(prev => prev.filter(f => f.id !== fileId))
      Swal.fire({ icon: 'success', title: '파일이 삭제되었습니다.', timer: 1500, showConfirmButton: false })
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: '파일 삭제 중 오류가 발생했습니다.' })
    }
  }

  const deleteCheckedFiles = async (idList) => {
    if (!idList || idList.length === 0) return Swal.fire({ icon: 'info', title: '선택된 파일이 없습니다.' })

    const result = await Swal.fire({
      title: `선택한 ${idList.length}개의 파일을 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    })
    if (!result.isConfirmed) return

    try {
      const deletePromises = fileList
        .filter(f => idList.includes(f.id))
        .map(async f => {
          try { await files.deleteFileFromSupabase(f.filePath) } catch(e) { console.warn('Supabase 삭제 실패', e) }
          try { await files.remove(f.id) } catch(e) { console.warn('DB 삭제 실패', e) }
        })
      await Promise.all(deletePromises)

      setFileList(prev => prev.filter(f => !idList.includes(f.id)))
      Swal.fire({ icon: 'success', title: '선택 파일이 삭제되었습니다.', timer: 1500, showConfirmButton: false })
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: '파일 삭제 중 오류가 발생했습니다.' })
    }
  }

  return (
    <Update
      board={board}
      fileList={fileList}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onDownload={onDownload}
      onDeleteFile={onDeleteFile}
      deleteCheckedFiles={deleteCheckedFiles}
    />
  )
}

export default UpdateContainer
