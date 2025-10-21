package com.dohwan.contact.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dohwan.contact.entity.ContactEntity;
import com.dohwan.contact.service.ContactService;
import lombok.extern.slf4j.Slf4j;     


@Slf4j
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping
    public ResponseEntity<ContactEntity> saveContact(@RequestBody ContactEntity contact) {
        return ResponseEntity.ok(contactService.save(contact));
    }
}