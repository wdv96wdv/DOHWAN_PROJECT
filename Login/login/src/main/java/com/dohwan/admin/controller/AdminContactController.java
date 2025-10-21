package com.dohwan.admin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.dohwan.contact.entity.ContactEntity;
import com.dohwan.contact.service.ContactService;

@RestController
@RequestMapping("/admin/contact")
public class AdminContactController {

    @Autowired
    private ContactService contactService;

    // 전체 문의 조회 (관리자 전용)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<ContactEntity>> getAllContacts() {
        return ResponseEntity.ok(contactService.findAll());
    }

    // 특정 문의 삭제
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteContact(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.ok("삭제 완료");
    }
}
