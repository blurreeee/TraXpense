package com.arjav.TraXpense.config;

import com.arjav.TraXpense.util.EncryptionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.RequestBodyAdviceAdapter;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@ControllerAdvice
public class DecryptedRequestAdvice extends RequestBodyAdviceAdapter {

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public boolean supports(MethodParameter methodParameter, Type targetType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public HttpInputMessage beforeBodyRead(HttpInputMessage inputMessage, MethodParameter parameter, Type targetType,
                                           Class<? extends HttpMessageConverter<?>> converterType) throws IOException {

        InputStream inputStream = inputMessage.getBody();
        if (inputStream == null) {
            return inputMessage;
        }
        byte[] bodyBytes = inputStream.readAllBytes();
        if (bodyBytes.length == 0) {
            return inputMessage;
        }

        try {
            Map<?, ?> map = objectMapper.readValue(bodyBytes, Map.class);
            if (map != null && map.containsKey("payload") && map.get("payload") instanceof String) {
                String encryptedData = (String) map.get("payload");
                String decryptedData = EncryptionUtil.decrypt(encryptedData);

                return new HttpInputMessage() {
                    @Override
                    public InputStream getBody() throws IOException {
                        return new ByteArrayInputStream(decryptedData.getBytes(StandardCharsets.UTF_8));
                    }

                    @Override
                    public org.springframework.http.HttpHeaders getHeaders() {
                        return inputMessage.getHeaders();
                    }
                };
            }
        } catch (Exception e) {
            // Ignore mapping/parsing/decryption errors, fallback to returning original body
        }

        return new HttpInputMessage() {
            @Override
            public InputStream getBody() throws IOException {
                return new ByteArrayInputStream(bodyBytes);
            }

            @Override
            public org.springframework.http.HttpHeaders getHeaders() {
                return inputMessage.getHeaders();
            }
        };
    }
}
