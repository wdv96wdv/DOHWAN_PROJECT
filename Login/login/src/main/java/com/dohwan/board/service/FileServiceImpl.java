package com.dohwan.board.service;

import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileCopyUtils;

import com.dohwan.board.dto.Files;
import com.dohwan.board.entity.FileEntity;
import com.dohwan.board.repository.FileRepository;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FileServiceImpl implements FileService {

    @Autowired
    private FileRepository fileRepository;

    @Value("${upload.path:}")
    private String uploadPath;

    private Files toDomain(FileEntity entity) {
        if (entity == null) return null;
        Files dto = new Files();
        dto.setNo(entity.getNo());
        dto.setId(entity.getId());
        dto.setPTable(entity.getPTable());
        dto.setPNo(entity.getPNo());
        dto.setFileName(entity.getFileName());
        dto.setOriginName(entity.getOriginName());
        dto.setFilePath(entity.getFilePath());
        dto.setFileSize(entity.getFileSize());
        dto.setSeq(entity.getSeq());
        dto.setType(entity.getType());
        if (entity.getCreatedAt() != null) {
            dto.setCreatedAt(java.sql.Timestamp.valueOf(entity.getCreatedAt()));
        }
        if (entity.getUpdatedAt() != null) {
            dto.setUpdatedAt(java.sql.Timestamp.valueOf(entity.getUpdatedAt()));
        }
        dto.setData(entity.getFilePath(), entity.getFileName(), entity.getOriginName(), entity.getFileSize());
        return dto;
    }

    private FileEntity toEntity(Files dto) {
        if (dto == null) return null;
        FileEntity entity = new FileEntity();
        entity.setNo(dto.getNo());
        if (dto.getId() != null) entity.setId(dto.getId());
        entity.setPTable(dto.getPTable());
        entity.setPNo(dto.getPNo());
        entity.setFileName(dto.getFileName());
        entity.setOriginName(dto.getOriginName());
        entity.setFilePath(dto.getFilePath());
        entity.setFileSize(dto.getFileSize());
        entity.setSeq(dto.getSeq());
        entity.setType(dto.getType());
        return entity;
    }

    @Override
    public List<Files> list() {
        return fileRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<Files> page(int page, int size) {
        int zeroBasedPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroBasedPage, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return fileRepository.findAll(pageable).map(this::toDomain);
    }

    @Override
    public Files select(int no) {
        return fileRepository.findById((long) no).map(this::toDomain).orElse(null);
    }

    @Override
    public Files selectById(String id) {
        return fileRepository.findByIdentifier(id)
                .map(this::toDomain)
                .orElse(null);
    }

    @Override
    @Transactional
    public boolean insert(Files file) {
        if (file == null) return false;
        fileRepository.save(toEntity(file));
        return true;
    }

    @Override
    @Transactional
    public boolean update(Files file) {
        return fileRepository.findById(file.getNo()).map(entity -> {
            if (file.getType() != null) entity.setType(file.getType());
            if (file.getSeq() != null) entity.setSeq(file.getSeq());
            if (file.getPTable() != null) entity.setPTable(file.getPTable());
            if (file.getPNo() != null) entity.setPNo(file.getPNo());
            if (file.getFileName() != null) entity.setFileName(file.getFileName());
            if (file.getOriginName() != null) entity.setOriginName(file.getOriginName());
            if (file.getFilePath() != null) entity.setFilePath(file.getFilePath());
            if (file.getFileSize() != null) entity.setFileSize(file.getFileSize());
            fileRepository.save(entity);
            return true;
        }).orElse(false);
    }

    @Override
    @Transactional
    public boolean updateById(Files file) {
        return fileRepository.findByIdentifier(file.getId()).map(entity -> {
            if (file.getType() != null) entity.setType(file.getType());
            if (file.getSeq() != null) entity.setSeq(file.getSeq());
            if (file.getPTable() != null) entity.setPTable(file.getPTable());
            if (file.getPNo() != null) entity.setPNo(file.getPNo());
            if (file.getFileName() != null) entity.setFileName(file.getFileName());
            if (file.getOriginName() != null) entity.setOriginName(file.getOriginName());
            if (file.getFilePath() != null) entity.setFilePath(file.getFilePath());
            if (file.getFileSize() != null) entity.setFileSize(file.getFileSize());
            fileRepository.save(entity);
            return true;
        }).orElse(false);
    }

    public boolean delete(Files file) {
        if (file == null || file.getFilePath() == null) {
            log.info("파일이 없거나 파일 경로가 없습니다.");
            return false;
        }

        String filePath = file.getFilePath();
        File deleteFile = new File(filePath);

        if (!deleteFile.exists()) {
            log.error("파일이 존재하지 않습니다.");
            return false;
        }

        boolean deleted = deleteFile.delete();
        if (deleted) {
            log.info("파일이 삭제 되었습니다.");
            log.info("- " + filePath);
        }
        return true;
    }

    @Override
    @Transactional
    public boolean delete(int no) {
        Files file = select(no);
        if(file != null) delete(file);
        fileRepository.deleteById((long) no);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteById(String id) {
        Files file = selectById(id);
        if (file != null) {
            delete(file);
            fileRepository.deleteByIdentifier(id);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean upload(Files file) throws Exception {
        if (file == null) return false;
        String fileUrl = file.getData();

        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        file.setFilePath(fileUrl);
        file.setFileName(file.getFileName());
        file.setOriginName(file.getOriginName());
        file.setFileSize(file.getFileSize());

        fileRepository.save(toEntity(file));
        return true;
    }

    @Override
    @Transactional
    public int upload(List<Files> fileList) throws Exception {
        int result = 0;
        if (fileList == null || fileList.isEmpty()) return result;

        for (Files f : fileList) {
            result += (upload(f) ? 1 : 0);
        }
        return result;
    }

    @Override
    public boolean download(String id, HttpServletResponse response) throws Exception {
        Files file = selectById(id);
        if (file == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return false;
        }

        String fileName = file.getOriginName();
        String filePath = file.getFilePath();
        File downloadFile = new File(filePath);

        if (!downloadFile.exists()) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return false;
        }

        String contentType = java.nio.file.Files.probeContentType(downloadFile.toPath());
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        fileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setContentType(contentType);
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        try (FileInputStream fis = new FileInputStream(downloadFile);
             ServletOutputStream sos = response.getOutputStream()) {
            FileCopyUtils.copy(fis, sos);
            sos.flush();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return false;
        }
    }

    @Override
    public List<Files> listByParent(Files file) {
        return fileRepository.findByParent(file.getPTable(), file.getPNo()).stream()
                .map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int deleteByParent(Files file) {
        List<Files> fileList = listByParent(file);
        for (Files deleteFile : fileList) {
            delete(deleteFile);
        }
        fileRepository.deleteByParent(file.getPTable(), file.getPNo());
        return fileList.size();
    }

    @Override
    @Transactional
    public int deleteFiles(String noList) {
        if (noList == null || noList.isEmpty()) return 0;
        int count = 0;
        String[] nos = noList.split(",");
        for (String noStr : nos) {
            int no = Integer.parseInt(noStr);
            count += (delete(no) ? 1 : 0);
        }
        return count;
    }

    @Override
    @Transactional
    public int deleteFilesById(String IDList) {
        if (IDList == null || IDList.isEmpty()) return 0;
        int count = 0;
        String[] ids = IDList.split(",");
        for (String id : ids) {
            count += (deleteById(id) ? 1 : 0);
        }
        return count;
    }

    @Override
    @Transactional
    public int deleteFileList(List<Long> noList) {
        if (noList == null || noList.isEmpty()) return 0;
        int count = 0;
        for (Long no : noList) {
            count += (delete(no.intValue()) ? 1 : 0);
        }
        return count;
    }

    @Override
    @Transactional
    public int deleteFileListById(List<String> idList) {
        if (idList == null || idList.isEmpty()) return 0;
        int count = 0;
        for (String id : idList) {
            count += (deleteById(id) ? 1 : 0);
        }
        return count;
    }

    @Override
    public Files selectByType(Files file) {
        List<FileEntity> res = fileRepository.findByParentAndType(file.getPTable(), file.getPNo(), file.getType());
        if (!res.isEmpty()) {
            return toDomain(res.get(0));
        }
        return null;
    }

    @Override
    public List<Files> listByType(Files file) {
        return fileRepository.findByParentAndType(file.getPTable(), file.getPNo(), file.getType()).stream()
                .map(this::toDomain).collect(Collectors.toList());
    }
}
