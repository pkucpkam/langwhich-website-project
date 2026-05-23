package com.langwhich.app.modules.folder.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.langwhich.app.modules.folder.entity.Folder;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {

    List<Folder> findByIsOfficialTrue();

    List<Folder> findByCreatorId(Long creatorId);

    Page<Folder> findAll(Pageable pageable);
}
