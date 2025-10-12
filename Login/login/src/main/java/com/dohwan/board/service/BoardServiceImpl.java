package com.dohwan.board.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.dohwan.board.domain.Boards;
import com.dohwan.board.domain.Files;
import com.dohwan.board.mapper.BoardMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BoardServiceImpl implements BoardService {

    @Autowired private BoardMapper boardMapper;
    @Autowired private FileService fileService;

    @Override
    public List<Boards> list() {
        return boardMapper.list();
    }


    @Override
    public Boards select(int no) {
        return boardMapper.select(no);
    }


    @Override
    public Boards selectById(String id) {
        return boardMapper.selectById(id);
    }


    @Override
    public boolean insert(Boards boards) {
        // 게시글 등록
        int result = boardMapper.insert(boards);
        // 파일 업로드
        result += upload(boards);
        return result > 0;
    }
    /**
     * 파일 업로드
     * @param boards
     * @return
     */
    public int upload(Boards board){
        int result = 0;
        String pTable = "boards";
        Long pNo = board.getNo();

        List<Files> uploadFileList = new ArrayList<>();

        MultipartFile mainFile = board.getMainFile();
        if( mainFile != null && !mainFile.isEmpty()){
            Files mainFileInfo = new Files();
            mainFileInfo.setPTable(pTable);
            mainFileInfo.setPNo(pNo);
            mainFileInfo.setData(mainFile);
            mainFileInfo.setType(Files.FileType.MAIN);
            uploadFileList.add(mainFileInfo);
        }
        
        List<MultipartFile> files = board.getFiles();
        if( files != null && !files.isEmpty()){
            for(MultipartFile multipartFile : files){
                if(multipartFile.isEmpty())
                continue;
                Files fileInfo = new Files();
                fileInfo.setPNo(pNo);
                fileInfo.setPTable(pTable);
                fileInfo.setData(multipartFile);
                fileInfo.setType(Files.FileType.SUB);
                uploadFileList.add(fileInfo);
            }
        }
        try {
            result += fileService.upload(uploadFileList);
            
        } catch (Exception e) {
            log.error("게시글 파일 업로드가 실패 하였습니다.");
            e.printStackTrace();
        }
        return result;
    }


    @Override
    public boolean update(Boards boards) {
        // 게시글 수정
        int result = boardMapper.update(boards);
        // 파입 업로드
        result += upload(boards);
        return result > 0;
    }


    @Override
    public boolean updateById(Boards boards) {
        // 게시글 수정
        int result = boardMapper.updateById(boards);
        // 파일 업로드
        Boards oldBoards = boardMapper.selectById(boards.getId());
        boards.setNo(oldBoards.getNo());
        result += upload(boards);
        return result > 0;
    }


    @Override
    public boolean delete(int no) {
        // 게시글 삭제
        int result = boardMapper.delete(no);
        // 종속된 첨부파일 삭제
        Files file = new Files();
        file.setPTable("boards");
        file.setPNo(Long.valueOf(no));
        int deleteCount = fileService.deleteByParent(file);
        log.info(deleteCount + "개의 파일이 삭제 되었습니다.");
        return result > 0;
    }


    @Override
    public boolean deleteById(String id) {
        // 1.삭제 전에 게시글 조회
        Boards board = boardMapper.selectById(id);
        if(board == null){
            // 게시글이 없으면 false 반환
            return false;
        }
        Long no = board.getNo();
        // 2. 종속된 첨부파일 삭제
        Files file = new Files();
        file.setPTable("boards");
        file.setPNo(Long.valueOf(no));
        int deleteCount = fileService.deleteByParent(file);
        log.info(deleteCount + "개의 파일이 삭제 되었습니다.");

         // 게시글 삭제
        int result = boardMapper.deleteById(id);

        return result > 0;
    }

    @Override
    public PageInfo<Boards> page(int page, int size) {
        PageHelper.startPage(page, size);
        List<Boards> list = boardMapper.list();
        return new PageInfo<>(list);
    }
}
