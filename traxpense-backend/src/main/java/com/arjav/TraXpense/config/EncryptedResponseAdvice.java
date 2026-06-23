package com.arjav.TraXpense.config;

import com.arjav.TraXpense.util.EncryptionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class EncryptedResponseAdvice implements ResponseBodyAdvice<Object> {

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {

        if (response instanceof ServletServerHttpResponse) {
            int status = ((ServletServerHttpResponse) response).getServletResponse().getStatus();
            
            // Only encrypt successful responses (2xx)
            if (status >= 200 && status < 300) {
                // If it's already a map with our payload, skip to prevent double encryption
                if (body instanceof Map && ((Map<?, ?>) body).containsKey("payload")) {
                    return body;
                }
                
                try {
                    String jsonString = objectMapper.writeValueAsString(body);
                    String encrypted = EncryptionUtil.encrypt(jsonString);
                    
                    Map<String, String> wrappedResponse = new HashMap<>();
                    wrappedResponse.put("payload", encrypted);
                    return wrappedResponse;
                } catch (Exception e) {
                    throw new RuntimeException("Failed to encrypt response", e);
                }
            }
        }
        
        return body;
    }
}
