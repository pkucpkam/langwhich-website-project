package com.langwhich.app.modules.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.langwhich.app.modules.user.entity.Role;

public record AuthResponse(
    @JsonProperty("access_token")
    String accessToken,

    @JsonProperty("refresh_token")
    String refreshToken,

    @JsonProperty("token_type")
    String tokenType,

    @JsonProperty("expires_in")
    long expiresIn,

    UserInfo user
) {
    public record UserInfo(
        Long id,
        String username,
        String email,
        Role role
    ) {}

    public static AuthResponse of(
        String accessToken,
        String refreshToken,
        long expiresIn,
        UserInfo user
    ) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, user);
    }
}
