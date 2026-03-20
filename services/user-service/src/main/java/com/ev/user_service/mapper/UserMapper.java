package com.ev.user_service.mapper;

import org.mapstruct.*;
import com.ev.user_service.dto.request.UserRequest;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User userRequesttoUser(UserRequest userRequest);
    @Mapping(source = "url", target = "url")
    UserRespond usertoUserRespond(User user);
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "birthday", ignore = true)
    void updateUserFromRequest(UserRequest request, @MappingTarget User user);
}
