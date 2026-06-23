package com.arjav.TraXpense;

import com.arjav.TraXpense.util.EncryptionUtil;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class EncryptionUtilTest {

    @Test
    public void testEncryptDecrypt() {
        String original = "{\"username\":\"testencrypt\",\"password\":\"Password123!\"}";
        String encrypted = EncryptionUtil.encrypt(original);
        String decrypted = EncryptionUtil.decrypt(encrypted);
        assertEquals(original, decrypted);
    }
}
