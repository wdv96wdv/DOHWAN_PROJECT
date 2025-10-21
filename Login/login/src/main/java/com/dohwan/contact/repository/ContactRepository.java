package com.dohwan.contact.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dohwan.contact.entity.ContactEntity;

public interface ContactRepository extends JpaRepository<ContactEntity, Long> {}
