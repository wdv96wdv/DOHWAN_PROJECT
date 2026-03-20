package com.dohwan.board.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dohwan.board.dto.Boards;
import com.dohwan.board.dto.Boards.FileInfo;
import com.dohwan.board.dto.Files;
import com.dohwan.board.entity.BoardEntity;
import com.dohwan.board.repository.BoardRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class BoardServiceImpl implements BoardService {

    @Autowired
    private BoardRepository boardRepository;
    @Autowired
    private FileService fileService;

    // Helper to map Entity to Domain
    private Boards toDomain(BoardEntity entity) {
        if (entity == null) return null;
        Boards dto = new Boards();
        dto.setNo(entity.getNo());
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setWriter(entity.getWriter());
        dto.setContent(entity.getContent());
        if (entity.getCreatedAt() != null) {
            dto.setCreatedAt(java.sql.Timestamp.valueOf(entity.getCreatedAt()));
        }
        if (entity.getUpdatedAt() != null) {
            dto.setUpdatedAt(java.sql.Timestamp.valueOf(entity.getUpdatedAt()));
        }
        dto.setUserNo(entity.getUserNo());
        
        // 썸네일(MAIN 파일) 로드
        try {
            Files search = new Files();
            search.setPTable("boards");
            search.setPNo(entity.getNo());
            Files mainFile = fileService.selectByType(search);
            dto.setFile(mainFile);
        } catch (Exception e) {
            log.warn("이미지 로드 실패: " + e.getMessage());
        }

        return dto;
    }

    private BoardEntity toEntity(Boards dto) {
        if (dto == null) return null;
        BoardEntity entity = new BoardEntity();
        entity.setNo(dto.getNo());
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setTitle(dto.getTitle());
        entity.setWriter(dto.getWriter());
        entity.setContent(dto.getContent());
        entity.setUserNo(dto.getUserNo());
        return entity;
    }

    @Override
    public List<Boards> list() {
        return boardRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Boards select(int no) {
        return boardRepository.findById((long) no)
                .map(this::toDomain)
                .orElse(null);
    }

    @Override
    public Boards selectById(String id) {
        return boardRepository.findByIdentifier(id)
                .map(this::toDomain)
                .orElse(null);
    }

    @Override
    @Transactional
    public boolean insert(Boards boards) {
        int result = 0;
        try {
            BoardEntity entity = toEntity(boards);
            BoardEntity saved = boardRepository.save(entity);
            boards.setNo(saved.getNo());
            boards.setId(saved.getId());
            log.info("게시글 등록 성공, no={}", boards.getNo());

            // 파일 업로드
            int uploadResult = upload(boards);
            log.info("파일 업로드 결과: {}", uploadResult);
            result = 1 + uploadResult;

        } catch (Exception e) {
            log.error("게시글 등록 실패", e);
        }
        return result > 0;
    }

    public int upload(Boards board) {
        int result = 0;
        String pTable = "boards";
        Long pNo = board.getNo();

        if (pNo == null) {
            log.warn("board.getNo()가 null입니다. 게시글 insert가 정상적으로 이루어졌는지 확인하세요.");
            return 0;
        }

        List<Files> uploadFileList = new ArrayList<>();

        try {
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
                        mainFileInfo.getSize()
                );
                mainFile.setType(Files.FileType.MAIN);
                uploadFileList.add(mainFile);
            }

            // sub files 처리
            List<FileInfo> fileInfos = board.getFiles();
            if (fileInfos != null && !fileInfos.isEmpty()) {
                for (FileInfo info : fileInfos) {
                    if (info.getUrl() == null || info.getUrl().isEmpty()) continue;

                    Files file = new Files();
                    file.setPTable(pTable);
                    file.setPNo(pNo);
                    file.setData(
                            info.getUrl(),
                            info.getName(),
                            info.getOriginName(),
                            info.getSize()
                    );
                    file.setType(Files.FileType.SUB);
                    uploadFileList.add(file);
                }
            }

            log.info("업로드할 파일 리스트: {}", uploadFileList);

            // 실제 업로드
            if (!uploadFileList.isEmpty()) {
                result = fileService.upload(uploadFileList);
                log.info("fileService.upload() 결과: {}", result);
            } else {
                log.info("업로드할 파일이 없습니다.");
            }

        } catch (Exception e) {
            log.error("파일 업로드 중 예외 발생", e);
        }

        return result;
    }

    @Override
    @Transactional
    public boolean update(Boards boards) {
        return boardRepository.findById(boards.getNo()).map(entity -> {
            if (boards.getTitle() != null) entity.setTitle(boards.getTitle());
            if (boards.getWriter() != null) entity.setWriter(boards.getWriter());
            if (boards.getContent() != null) entity.setContent(boards.getContent());
            boardRepository.save(entity);
            upload(boards);
            return true;
        }).orElse(false);
    }

    @Override
    @Transactional
    public boolean updateById(Boards boards) {
        return boardRepository.findByIdentifier(boards.getId()).map(entity -> {
            if (boards.getTitle() != null) entity.setTitle(boards.getTitle());
            if (boards.getWriter() != null) entity.setWriter(boards.getWriter());
            if (boards.getContent() != null) entity.setContent(boards.getContent());
            boardRepository.save(entity);
            boards.setNo(entity.getNo());
            upload(boards);
            return true;
        }).orElse(false);
    }

    @Override
    @Transactional
    public boolean delete(int no) {
        try {
            boardRepository.deleteById((long) no);
            
            Files file = new Files();
            file.setPTable("boards");
            file.setPNo((long) no);
            int deleteCount = fileService.deleteByParent(file);
            log.info(deleteCount + "개의 파일이 삭제 되었습니다.");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deleteById(String id) {
        return boardRepository.findByIdentifier(id).map(board -> {
            Long no = board.getNo();
            Files file = new Files();
            file.setPTable("boards");
            file.setPNo(no);
            int deleteCount = fileService.deleteByParent(file);
            log.info(deleteCount + "개의 파일이 삭제 되었습니다.");
            boardRepository.deleteByIdentifier(id);
            return true;
        }).orElse(false);
    }

    @Override
    public Page<Boards> page(int page, int size) {
        // Spring Data JPA pagination is 0-indexed, while PageHelper was 1-indexed.
        int zeroBasedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroBasedPage, size);
        return boardRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDomain);
    }
}
