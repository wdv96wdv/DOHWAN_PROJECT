import React, { useEffect, useState } from 'react'
import Read from '../../components/Board/Read'
import { useParams } from 'react-router-dom'
import * as boards from '../../apis/boards'
import * as files from '../../apis/files'

const ReadContainer = () => {
  const { id } = useParams()

  const [board, setBoard] = useState({})
  const [fileList, setFileList] = useState([])

  const getBoard = async () => {
    const response = await boards.select(id)
    const data = await response.data
    setBoard(data.board)
    setFileList(data.fileList)
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
  useEffect(() => {
    getBoard()
  }, [])

  return (
    <Read
      board={board}
      fileList={fileList}
      onDownload={onDownload}
    />
  )
}

export default ReadContainer
