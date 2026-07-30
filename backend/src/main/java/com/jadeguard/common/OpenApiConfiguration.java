package com.jadeguard.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI jadeGuardOpenApi() {
        return new OpenAPI().info(new Info()
                .title("JadeGuard API")
                .version("v1")
                .description("Transaction monitoring and fraud alert case management API"));
    }
}
