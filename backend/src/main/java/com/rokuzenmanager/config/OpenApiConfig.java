package com.rokuzenmanager.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI apiInfo(){
        return new OpenAPI()
            .info(new Info()
                .title("Velora API")
                .description("API de gestão de agendamentos, clientes e relatórios")
                .version("v1.0.0")
            );
    }

}