package com.dohwan.contact.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dohwan.contact.entity.ContactEntity;
import com.dohwan.contact.repository.ContactRepository;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    public ContactEntity save(ContactEntity contact) {
        return contactRepository.save(contact);
    }

    public List<ContactEntity> findAll() {
        return contactRepository.findAll();
    }

    public void delete(Long id) {
        contactRepository.deleteById(id);
    }
}
