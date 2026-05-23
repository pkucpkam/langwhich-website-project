package com.langwhich.app.modules.folder.mapper;

import com.langwhich.app.modules.folder.entity.Folder;
import com.langwhich.app.modules.folder.dto.request.FolderRequest;
import com.langwhich.app.modules.folder.dto.response.FolderResponse;
import com.langwhich.app.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FolderMapper {

    @Mapping(target = "creatorId", source = "folder.creator.id")
    @Mapping(target = "creatorUsername", source = "folder", qualifiedByName = "getCreatorUsername")
    @Mapping(target = "lessonCount", source = "lessonCount")
    @Mapping(target = "isOfficial", source = "folder.official")
    FolderResponse toResponse(Folder folder, int lessonCount);

    @Named("getCreatorUsername")
    default String getCreatorUsername(Folder folder) {
        return folder.isOfficial() ? "Trang web" : (folder.getCreator() != null ? folder.getCreator().getDisplayUsername() : null);
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isOfficial", constant = "false")
    @Mapping(target = "creator", source = "creator")
    Folder toEntity(FolderRequest request, User creator);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isOfficial", constant = "true")
    @Mapping(target = "creator", source = "creator")
    Folder toOfficialEntity(FolderRequest request, User creator);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "official", ignore = true)
    @Mapping(target = "creator", ignore = true)
    void updateEntity(FolderRequest request, @MappingTarget Folder folder);
}
