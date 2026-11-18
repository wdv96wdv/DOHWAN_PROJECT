import React, { useContext, useEffect, useState } from 'react'
import Read from '../../components/Board/Read'
import { useParams, useNavigate } from 'react-router-dom' // useNavigate ì¶”ê?
import * as boards from '../../apis/boards'
import * as files from '../../apis/files'
import * as comments from '../../apis/comments'
import Swal from 'sweetalert2'
import useAuthStore from '../../store/useAuthStore'

import { Helmet } from 'react-helmet-async'

const ReadContainer = () => {
  const { id } = useParams()
  const navigate = useNavigate() // useNavigate ?¸ìŠ¤?´ìŠ¤ ?ì„±
  const userInfo = useAuthStore(state => state.userInfo)

  const [board, setBoard] = useState({})
  const [fileList, setFileList] = useState([])
  const [commentList, setCommentList] = useState([])

  const getBoard = async () => {
    const response = await boards.select(id)
    const resData = response.data.data
    setBoard(resData.board)
    setFileList(resData.fileList)

    // ?€?´í? ê°•ì œ ?…ë°?´íŠ¸
    if (resData.board && resData.board.title) {
      document.title = `Dorunning | ì»¤ë??ˆí‹° | ${resData.board.title}`;
    }
  }

  const getComments = async () => {
    try {
      const response = await comments.list(id)
      const resData = response.data.data
      setCommentList(resData || [])
    } catch (err) {
      console.error('?“ê? ëª©ë¡ ì¡°íšŒ ?¤íŒ¨:', err)
      setCommentList([])
    }
  }

  const onDownload = async (id, fileName) => {
    try {
      const file = fileList.find(f => f.id === id)
      if (!file || !file.filePath) throw new Error('?Œì¼ ?•ë³´ê°€ ?†ìŠµ?ˆë‹¤.')

      // URL?ì„œ ë²„í‚· ê²½ë¡œë§?ì¶”ì¶œ
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
      alert('?Œì¼ ?¤ìš´ë¡œë“œ ?¤íŒ¨: ' + err.message)
    }
  }

  const onCreateComment = async (data) => {
    try {
      const newData = { ...data, userNo: userInfo.no, writer: userInfo.name };
      await comments.create(id, newData)
      await getComments() // ?“ê? ëª©ë¡ ?¤ì‹œ ë¶ˆëŸ¬?¤ê¸°
    } catch (err) {
      console.error('?“ê? ?‘ì„± ?¤íŒ¨:', err)
      Swal.fire({ icon: 'error', title: '?“ê? ?‘ì„±???¤íŒ¨?ˆìŠµ?ˆë‹¤.' })
    }
  }

  const onUpdateComment = async (commentId, data) => {
    try {
      const newData = { ...data, userNo: userInfo.no };
      await comments.update(id, commentId, newData)
      await getComments()
    } catch (err) {
      console.error('?“ê? ?˜ì • ?¤íŒ¨:', err)
      Swal.fire({ icon: 'error', title: '?“ê? ?˜ì •???¤íŒ¨?ˆìŠµ?ˆë‹¤.' })
    }
  }

  const onDeleteComment = async (commentId, userNo) => {
    const result = await Swal.fire({
      title: '?“ê????? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '?? œ',
      cancelButtonText: 'ì·¨ì†Œ'
    })
    if (!result.isConfirmed) return

    try {
      await comments.remove(id, commentId, { userNo })
      await getComments()
    } catch (err) {
      console.error('?“ê? ?? œ ?¤íŒ¨:', err)
      Swal.fire({ icon: 'error', title: '?“ê? ?? œ ì¤??¤ë¥˜ ë°œìƒ:', text: err.message })
    }
  }

  // ê²Œì‹œê¸€ ?? œ
  const onDelete = async (boardId) => {
    try {
      const response = await boards.remove(boardId);
      if (response.status >= 200 && response.status < 300) { // 2xx ?íƒœ ì½”ë“œ ?•ì¸
        Swal.fire({ icon: 'success', title: 'ê²Œì‹œê¸€???? œ?˜ì—ˆ?µë‹ˆ??', timer: 1500, showConfirmButton: false });
        navigate('/boards'); // ëª©ë¡?¼ë¡œ ?´ë™
      } else {
        Swal.fire({ icon: 'error', title: `ê²Œì‹œê¸€ ?? œ???¤íŒ¨?ˆìŠµ?ˆë‹¤. (?íƒœ ì½”ë“œ: ${response.status})` });
      }
    } catch (error) {
      console.error('ê²Œì‹œê¸€ ?? œ ì¤??¤ë¥˜ ë°œìƒ:', error);
      Swal.fire({ icon: 'error', title: 'ê²Œì‹œê¸€ ?? œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.', text: error.message });
    }
  };

  useEffect(() => {
    getBoard()
    getComments()
  }, [id])

  return (
    <>
      <Helmet>
        <title>Dorunning | ì»¤ë??ˆí‹° | {board.title || '?ì„¸ë³´ê¸°'}</title>
        <meta name="description" content={`${board.writer || '?‘ì„±??}?˜ì˜ ê²Œì‹œê¸€: ${board.title}`} />
        <meta property="og:title" content={`Dorunning | ì»¤ë??ˆí‹° | ${board.title || '?ì„¸ë³´ê¸°'}`} />
        <meta property="og:description" content={board.content ? board.content.substring(0, 100).replace(/<[^>]*>?/gm, '') : 'Dorunning ì»¤ë??ˆí‹° ê²Œì‹œê¸€?…ë‹ˆ??'} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://www.dorunning.app/boards/${id}`} />
      </Helmet>
      <Read
        board={board}
        fileList={fileList}
        commentList={commentList}
        onDownload={onDownload}
        onCreateComment={onCreateComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
        onDelete={onDelete} // onDelete prop ì¶”ê?
      />
    </>
  )
}

export default ReadContainer