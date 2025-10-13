package com.dohwan.board.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dohwan.board.domain.Boards;
import com.dohwan.board.domain.Boards.FileInfo;
import com.dohwan.board.domain.Files;
import com.dohwan.board.mapper.BoardMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BoardServiceImpl implements BoardService {

    @Autowired
    private BoardMapper boardMapper;
    @Autowired
    private FileService fileService;

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
        // 파일 URL만 전달하므로, 파일 관련 로직 수정
        result += upload(boards);
        return result > 0;
    }

    /**
     * 파일 업로드 (파일 URL만 저장)
     * 
     * @param boards
     * @return
     */
    public int upload(Boards board) {
        int result = 0;
        String pTable = "boards";
        Long pNo = board.getNo();

        List<Files> uploadFileList = new ArrayList<>();
        
        
        // mainFile 처리
        FileInfo mainFileInfo = board.getMainFile();
        if (mainFileInfo != null && mainFileInfo.getUrl() != null && !mainFileInfo.getUrl().isEmpty()) {
            Files mainFile = new Files();
            mainFile.setPTable(pTable);
            mainFile.setPNo(pNo);
            mainFile.setData(
                    mainFileInfo.getUrl(),
                    mainFileInfo.getName(),
                    mainFileInfo.getOriginName(),
                    mainFileInfo.getSize());
            mainFile.setType(Files.FileType.MAIN);
            uploadFileList.add(mainFile);
        }

        // files 처리
        List<FileInfo> fileInfos = board.getFiles();
        if (fileInfos != null && !fileInfos.isEmpty()) {
            for (FileInfo info : fileInfos) {
                if (info.getUrl() == null || info.getUrl().isEmpty())
                    continue;
                Files file = new Files();
                file.setPNo(pNo);
                file.setPTable(pTable);
                file.setData(
                        info.getUrl(),
                        info.getName(),
                        info.getOriginName(),
                        info.getSize());
                file.setType(Files.FileType.SUB);
                uploadFileList.add(file);
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
        if (board == null) {
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
