package com.langwhich.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private CorsProperties cors = new CorsProperties();

    @Getter
    @Setter
    public static class CorsProperties {
        private String allowedOrigins = "http://localhost:3000";
    }
}
