import CryptoJS from 'crypto-js';

const KEY = "TraXpenseSecretKey12345678901234";

export function decryptPayload(encryptedString) {
  try {
    const key = CryptoJS.enc.Utf8.parse(KEY);
    const decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to decrypt payload:", err);
    throw new Error("Failed to decrypt response");
  }
}

export function encryptPayload(data) {
  try {
    const key = CryptoJS.enc.Utf8.parse(KEY);
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  } catch (err) {
    console.error("Failed to encrypt payload:", err);
    throw new Error("Failed to encrypt request");
  }
}

