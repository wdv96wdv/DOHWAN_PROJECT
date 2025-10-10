import React from 'react'
import Update from '../../components/board/Update'
import * as boards from  '../../apis/boards'
import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import * as files from '../../apis/files'
import Swal from 'sweetalert2'

const UpdateContainer = () => {

  const {id} = useParams()

  const [board, setBoard] = useState({});
  const [fileList, setFileList] = useState([])
  const navigate = useNavigate();
   
  const getBoard = async () => {
    const response = await boards.select(id)
    const data = await response.data
    setBoard(data.board);
    setFileList(data.fileList);
  }

  const onDownload = async (id, fileName) => {
    const response = await files.download(id)
    const url = window.URL.createObjectURL(new Blob([response.data] ))
    const link = document.createElement('a')
    link.href = url 
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const onUpdate = async (data, headers) =>{
    try{
      const response = await boards.update(data, headers)
      await response.data
      await Swal.fire({
        icon: 'success',
        title: '게시글이 수정되었습니다.',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/boards')
    }catch(error){
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: '게시글 수정에 실패했습니다.'
      });
    }
  }

  useEffect(() => {
    getBoard()
  },[])

  const onDelete = async (id) =>{
    try{
      const result = await Swal.fire({
        title: '정말로 삭제하시겠습니까?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      })

      if(result.isConfirmed){
        const response = await boards.remove(id)
        await response.data
        await Swal.fire({
          icon: 'success',
          title: '게시물이 삭제되었습니다.',
          showConfirmButton: false,
          timer: 1500
        });
        navigate('/boards')
      }
    }catch(error){
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: '게시물 삭제가 취소되었습니다.'
      });
    }
  }

  const onDeleteFile = async (fileId) => {
    try {
      await files.remove(fileId)
      const boardResponse = await boards.select(id)
      const data = boardResponse.data
      setFileList(data.fileList)
    }catch(error){
      console.log(error)
      Swal.fire({
        icon: 'error',
        title: '파일 삭제 중 오류가 발생했습니다.'
      });
    }
  }

  const deleteCheckedFiles = async (idList) => {
    if(idList.length === 0){
      Swal.fire({
        icon: 'info',
        title: '선택된 파일이 없습니다.'
      });
      return
    }

    const result = await Swal.fire({
      title: `선택한 ${idList.length}개의 파일을 삭제하시겠습니까?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if(result.isConfirmed){
      try{
        const fileIdList = idList.join(",")
        await files.removeFiles(fileIdList)
        const boardResponse = await boards.select(id)
        const data = boardResponse.data
        setFileList(data.fileList)
        Swal.fire({
          icon: 'success',
          title: '선택 파일이 삭제되었습니다.',
          showConfirmButton: false,
          timer: 1500
        });
      }catch(error){
        console.log(error)
        Swal.fire({
          icon: 'error',
          title: '파일 삭제 중 오류가 발생했습니다.'
        });
      }
    }
  }

  return (
    <>
      <Update 
        board={board}
        fileList={fileList}
        onUpdate={onUpdate} 
        onDelete={onDelete}
        onDownload={onDownload}
        onDeleteFile={onDeleteFile}
        deleteCheckedFiles={deleteCheckedFiles}
      />
    </>
  )
}

export default UpdateContainer
