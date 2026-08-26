/**
 * WalletService - Manages Encrypted Wallet and IndexedDB storage
 */

const DB_NAME = "CredTrustWalletDB";
const DB_VERSION = 1;

class WalletService {
    constructor() {
        this.db = null;
        this.isLocked = true;
        this.walletKey = null; // Stored only in memory while unlocked
        this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event.target.error);
                reject("Database error");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store encrypted wallet material
                if (!db.objectStoreNames.contains('wallet_core')) {
                    db.createObjectStore('wallet_core', { keyPath: 'id' });
                }
                
                // Store encrypted credentials
                if (!db.objectStoreNames.contains('credentials')) {
                    db.createObjectStore('credentials', { keyPath: 'id' });
                }
            };
        });
    }

    async hasWallet() {
        await this.initDB();
        return new Promise((resolve) => {
            const tx = this.db.transaction(['wallet_core'], 'readonly');
            const store = tx.objectStore('wallet_core');
            const request = store.get('main');
            
            request.onsuccess = () => {
                resolve(!!request.result);
            };
            request.onerror = () => resolve(false);
        });
    }

    async createWallet(password) {
        try {
            // Generate Key pair for DID
            const keyPair = await window.CryptoUtils.generateDIDKeyPair();
            
            // Export private key for storage
            const privateKeyExported = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
            const publicKeyBase64 = await window.CryptoUtils.exportPublicKey(keyPair.publicKey);
            
            const did = `did:key:${publicKeyBase64.substring(0, 30)}`;

            // Generate encryption key from password
            const { key, salt } = await window.CryptoUtils.generateWalletKey(password);
            
            // Encrypt the sensitive wallet material
            const walletData = {
                privateKey: privateKeyExported,
                did: did,
                createdAt: new Date().toISOString()
            };

            const encrypted = await window.CryptoUtils.encryptData(key, walletData);

            // Store in DB
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(['wallet_core'], 'readwrite');
                const store = tx.objectStore('wallet_core');
                
                const record = {
                    id: 'main',
                    salt: Array.from(salt),
                    ciphertext: encrypted.ciphertext,
                    iv: encrypted.iv,
                    did: did
                };

                const request = store.put(record);
                
                request.onsuccess = () => {
                    this.walletKey = key;
                    this.isLocked = false;
                    this.currentDID = did;
                    resolve({ did });
                };
                request.onerror = (e) => reject(e.target.error);
            });
        } catch (error) {
            console.error("Wallet creation failed", error);
            throw error;
        }
    }

    async unlockWallet(password) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['wallet_core'], 'readonly');
            const store = tx.objectStore('wallet_core');
            const request = store.get('main');
            
            request.onsuccess = async () => {
                if (!request.result) return reject("No wallet found");
                
                try {
                    const record = request.result;
                    const salt = new Uint8Array(record.salt);
                    
                    const { key } = await window.CryptoUtils.generateWalletKey(password, salt);
                    
                    // Test decryption to verify password
                    const decrypted = await window.CryptoUtils.decryptData(
                        key, 
                        record.ciphertext, 
                        record.iv
                    );

                    this.walletKey = key;
                    this.isLocked = false;
                    this.currentDID = record.did;
                    resolve({ success: true, did: record.did });
                } catch (e) {
                    reject("Invalid password");
                }
            };
            request.onerror = () => reject("DB error");
        });
    }

    lockWallet() {
        this.walletKey = null;
        this.isLocked = true;
        this.currentDID = null;
    }

    async loadCurrentDID() {
        if (this.currentDID) return this.currentDID;
        await this.initDB();
        return new Promise((resolve) => {
            const tx = this.db.transaction(['wallet_core'], 'readonly');
            const store = tx.objectStore('wallet_core');
            const request = store.get('main');
            request.onsuccess = () => {
                if(request.result) {
                    this.currentDID = request.result.did;
                    resolve(this.currentDID);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    }

    async saveCredential(credential) {
        if (this.isLocked || !this.walletKey) throw new Error("Wallet is locked");

        const encrypted = await window.CryptoUtils.encryptData(this.walletKey, credential);

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['credentials'], 'readwrite');
            const store = tx.objectStore('credentials');
            
            const request = store.put({
                id: credential.id,
                ciphertext: encrypted.ciphertext,
                iv: encrypted.iv,
                issuerName: credential.issuerName, // Store some plaintext metadata for filtering
                issueDate: credential.issueDate
            });

            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }
}

window.walletService = new WalletService();
