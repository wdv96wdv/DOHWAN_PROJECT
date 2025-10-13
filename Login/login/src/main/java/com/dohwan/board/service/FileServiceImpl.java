// 로컬
package com.dohwan.board.service;

import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dohwan.board.domain.Files;
import com.dohwan.board.mapper.FileMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class FileServiceImpl implements FileService {

    @Autowired
    FileMapper fileMapper;

    @Value("${upload.path}")
    private String uploadPath; // 업로드 경로

    @Override
    public List<Files> list() {
        return fileMapper.list();
    }

    @Override
    public PageInfo<Files> page(int page, int size) {
        PageHelper.startPage(page, size);
        List<Files> list = fileMapper.list();
        PageInfo<Files> pageInfo = new PageInfo<>(list);
        return pageInfo;
    }

    @Override
    public Files select(int no) {
        return fileMapper.select(no);
    }

    @Override
    public Files selectById(String id) {
        return fileMapper.selectById(id);
    }

    @Override
    public boolean insert(Files file) {
        return fileMapper.insert(file) > 0;
    }

    @Override
    public boolean update(Files file) {
        return fileMapper.update(file) > 0;
    }

    @Override
    public boolean updateById(Files file) {
        return fileMapper.updateById(file) > 0;
    }

    // 파일 시스템의 파일 삭제
    public boolean delete(Files file) {
        if (file == null) {
            log.info("파일이 없습니다.");
            return false;
        }

        String filePath = file.getFilePath();
        File deleteFile = new File(filePath);

        if (!deleteFile.exists()) {
            log.error("파일이 존재하지 않습니다.");
            return false;
        }

        // 파일 삭제
        boolean deleted = deleteFile.delete();
        if (deleted) {
            log.info("파일이 삭제 되었습니다.");
            log.info("- " + filePath);
        }
        return true;
    }

    @Override
    public boolean delete(int no) {
        Files file = fileMapper.select(no); // 파일정보 조회
        delete(file); // 1 파일 삭제
        return fileMapper.delete(no) > 0; // 2 db 데이터 삭제
    }

    @Override
    public boolean deleteById(String id) {
        Files file = fileMapper.selectById(id); // 파일정보 조회
        delete(file); // 1 파일 삭제
        return fileMapper.deleteById(id) > 0; // 2 db 데이터 삭제
    }

    @Override
    public boolean upload(Files file) throws Exception {
        boolean result = false;
       String fileUrl = file.getData();

        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;  // 파일 URL이 없다면 처리하지 않음
        }
        // 파일 정보를 DB에 저장 (파일 URL만 저장)
        file.setFilePath(fileUrl);  // 파일 경로 (URL)
        
        // DB에 파일 정보 등록
        result = fileMapper.insert(file) > 0;
        return result;
    }

    //     // 업로드 경로 확인 및 폴더 자동 생성
    //     File uploadDir = new File(uploadPath);
    //     if (!uploadDir.exists()) {
    //         boolean created = uploadDir.mkdirs(); // 여러 경로 한 번에 생성
    //         if (!created) {
    //             log.error("업로드 폴더 생성 실패: {}", uploadPath);
    //             throw new RuntimeException("업로드 폴더 생성 실패");
    //         } else {
    //             log.info("업로드 폴더 생성 완료: {}", uploadPath);
    //         }
    //     }

    //     // 1 파일 시스템 등록 (파일 복사)
    //     // - 파일 정보 : 원본파일명, 파일 용량 파일 데이터
    //     // 파일명, 파일경로

    //     String originName = multipartFile.getOriginalFilename();
    //     long fileSize = multipartFile.getSize();
    //     byte[] fileDate = multipartFile.getBytes();
    //     String fileName = UUID.randomUUID().toString() + "_" + originName;
    //     String filePath = uploadPath + "/" + fileName;
    //     File uploadFile = new File(filePath);
    //     FileCopyUtils.copy(fileDate, uploadFile); // 파일 복사(업로드)

    //     // 2 db에 등록
    //     file.setOriginName(originName);
    //     file.setFileName(fileName);
    //     file.setFilePath(filePath);
    //     file.setFileSize(fileSize);

    //     result = fileMapper.insert(file) > 0;
    //     return result;
    // }

    @Override
    public int upload(List<Files> fileList) throws Exception {
        int result = 0;
        if (fileList == null || fileList.isEmpty())
            return result;

        for (Files files : fileList) {
            result += (upload(files) ? 1 : 0);
        }
        return result;
    }

    @Override
    public boolean download(String id, HttpServletResponse response) throws Exception {
        Files file = fileMapper.selectById(id);

        // 파일이 없으면
        if (file == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return false;
        }

        // 파일 입력
        String fileName = file.getOriginName(); // 파일명 (다운로드시-원본파일명)
        String filePath = file.getFilePath(); // 파일 경로
        File downloadFile = new File(filePath);
        FileInputStream fis = new FileInputStream(downloadFile);

        // 파일 출력
        ServletOutputStream sos = response.getOutputStream();

        // 파일 다운로드를 위한 응답 헤더 세팅
        // - Content-Type : application/octet-stream
        // - Content-Disposition : attachment, filename="파일명.확장자"
        fileName = URLEncoder.encode(fileName, "UTF-8");
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.setHeader("Content-Disposition",
                "attachment; filename\"" + fileName + " \"");

        // 다운로드
        boolean result = FileCopyUtils.copy(fis, sos) > 0;
        fis.close();
        sos.close();
        return result;

    }

    @Override
    public List<Files> listByParent(Files file) {
        return fileMapper.listByParent(file);
    }

    @Override
    public int deleteByParent(Files file) {
        List<Files> fileList = fileMapper.listByParent(file);

        // 파일 삭제
        for (Files deleteFile : fileList) {
            delete(deleteFile);
        }
        // db 삭제
        return fileMapper.deleteByParent(file);
    }

    // noList : "1,2,3"
    @Override
    public int deleteFiles(String noList) {
        if (noList == null || noList.isEmpty())
            return 0;

        // 파일 삭제
        int count = 0;
        String[] nos = noList.split(",");
        for (String noStr : nos) {
            int no = Integer.parseInt(noStr);
            count += (delete(no) ? 1 : 0);
        }
        log.info("파일" + count + "개를 삭제 하였습니다.");
        return count;

    }

    @Override
    public int deleteFilesById(String IDList) {
        if (IDList == null || IDList.isEmpty())
            return 0;

        // 파일 삭제
        int count = 0;
        String[] ids = IDList.split(",");
        for (String id : ids) {
            count += (deleteById(id) ? 1 : 0);
        }
        log.info("파일" + count + "개를 삭제 하였습니다.");
        return count;

    }

    @Override
    public int deleteFileList(List<Long> noList) {
        if (noList == null || noList.isEmpty())
            return 0;

        // 파일 삭제
        int count = 0;
        for (Long no : noList) {
            count += (delete(no.intValue()) ? 1 : 0);
        }
        log.info("파일" + count + "개를 삭제 하였습니다.");
        return count;
    }

    @Override
    public int deleteFileListById(List<String> idList) {
        if (idList == null || idList.isEmpty())
            return 0;

        // 파일 삭제
        int count = 0;
        for (String id : idList) {
            count += (deleteById(id) ? 1 : 0);
        }
        log.info("파일" + count + "개를 삭제 하였습니다.");
        return count;
    }

    @Override
    public Files selectByType(Files file) {
        return fileMapper.selectByType(file);
    }

    @Override
    public List<Files> listByType(Files file) {
        return fileMapper.listByType(file);
    }
}


// 운영