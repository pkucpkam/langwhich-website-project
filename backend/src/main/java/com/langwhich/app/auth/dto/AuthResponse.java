package com.langwhich.app.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.langwhich.app.user.Role;

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
