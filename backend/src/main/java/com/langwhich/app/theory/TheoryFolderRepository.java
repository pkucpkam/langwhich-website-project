package com.langwhich.app.theory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TheoryFolderRepository extends JpaRepository<TheoryFolder, Long> {
    Optional<TheoryFolder> findByName(String name);
}
