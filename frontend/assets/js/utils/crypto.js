/**
 * Web Crypto API Wrappers for CredTrust Wallet
 */

const CryptoUtils = {
    // Generate AES-GCM Key for Wallet Encryption
    async generateWalletKey(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits", "deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        return { key, salt };
    },

    // Encrypt data with AES-GCM
    async encryptData(key, dataObj) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        
        const ciphertext = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            enc.encode(JSON.stringify(dataObj))
        );

        return {
            ciphertext: Array.from(new Uint8Array(ciphertext)),
            iv: Array.from(iv)
        };
    },

    // Decrypt data with AES-GCM
    async decryptData(key, ciphertextArray, ivArray) {
        try {
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: new Uint8Array(ivArray)
                },
                key,
                new Uint8Array(ciphertextArray)
            );

            const dec = new TextDecoder();
            return JSON.parse(dec.decode(decrypted));
        } catch (e) {
            throw new Error("Decryption failed. Invalid password or corrupted data.");
        }
    },

    // Generate ECDSA Key Pair for DID
    async generateDIDKeyPair() {
        return await crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256"
            },
            true,
            ["sign", "verify"]
        );
    },

    // Export public key to base64 for DID document
    async exportPublicKey(key) {
        const exported = await crypto.subtle.exportKey("spki", key);
        return btoa(String.fromCharCode(...new Uint8Array(exported)));
    }
};

window.CryptoUtils = CryptoUtils;
