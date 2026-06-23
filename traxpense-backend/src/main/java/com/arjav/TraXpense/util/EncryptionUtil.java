package com.arjav.TraXpense.util;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class EncryptionUtil {
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
    private static final String KEY = "TraXpenseSecretKey12345678901234"; // 32 chars for AES-256

    public static String encrypt(String input) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY.getBytes("UTF-8"), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(input.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting payload", e);
        }
    }

    public static String decrypt(String encryptedInput) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY.getBytes("UTF-8"), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedInput));
            return new String(decryptedBytes, "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting payload", e);
        }
    }
}
