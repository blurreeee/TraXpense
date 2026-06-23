package com.arjav.TraXpense;

import com.arjav.TraXpense.util.EncryptionUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testEncryptedLoginRequestIsDecrypted() throws Exception {
        String originalJson = "{\"username\":\"nonexistent_user_test\",\"password\":\"password123\"}";
        String encryptedPayload = EncryptionUtil.encrypt(originalJson);
        String requestBody = "{\"payload\":\"" + encryptedPayload + "\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                // Since user does not exist, it should return 401 UNAUTHORIZED (but not 400 BAD REQUEST)
                // because the payload is decrypted successfully and validation passes.
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    public void testPlaintextLoginRequestFallsBackCorrectly() throws Exception {
        String requestBody = "{\"username\":\"nonexistent_user_test\",\"password\":\"password123\"}";

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                // Plaintext request without "payload" should also fall back correctly and get 401
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }
}
