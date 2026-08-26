class VerificationService {
    async verifyCredential(credentialJson) {
        let results = {
            signature: { status: 'PENDING', message: 'Checking cryptographic signature...' },
            issuer: { status: 'PENDING', message: 'Checking issuer trust registry...' },
            blockchain: { status: 'PENDING', message: 'Checking blockchain commitment...' },
            expiry: { status: 'PENDING', message: 'Checking credential validity dates...' },
            revocation: { status: 'PENDING', message: 'Checking revocation status...' }
        };

        try {
            const credential = JSON.parse(credentialJson);

            // 1. Expiry Check
            const now = new Date();
            const exp = new Date(credential.expirationDate);
            if (exp < now) {
                results.expiry = { status: 'FAILED', message: 'Credential has expired.' };
            } else {
                results.expiry = { status: 'PASSED', message: 'Credential is valid and not expired.' };
            }

            // 2. Issuer Trust (Simulated check against Registry)
            if (credential.issuer.id === "did:web:demo-university.edu") {
                results.issuer = { status: 'PASSED', message: 'Issuer is registered and APPROVED.' };
            } else {
                results.issuer = { status: 'WARNING', message: 'Issuer is NOT in the trusted registry.' };
            }

            // 3. Signature (Simulated crypto verification)
            // In a real app, this would use crypto.subtle.verify
            if (credential.proof && credential.proof.jwt) {
                results.signature = { status: 'PASSED', message: 'Digital signature is valid. Credential is untampered.' };
            } else {
                results.signature = { status: 'FAILED', message: 'Invalid or missing cryptographic proof.' };
            }

            // 4. Blockchain & Revocation (Simulated check against CredentialStatusRegistry)
            if (credential.credentialSubject.degree === "Revoked Degree") {
                results.blockchain = { status: 'PASSED', message: 'Commitment found on-chain.' };
                results.revocation = { status: 'FAILED', message: 'Credential was REVOKED by the issuer on 2026-01-01.' };
            } else {
                results.blockchain = { status: 'PASSED', message: 'Commitment found on-chain (DEMO-TX-001).' };
                results.revocation = { status: 'PASSED', message: 'Credential is ACTIVE on-chain.' };
            }

            return { isValid: Object.values(results).every(r => r.status === 'PASSED'), results, credential };
        } catch (e) {
            results.signature = { status: 'FAILED', message: 'Invalid JSON format.' };
            return { isValid: false, results, credential: null };
        }
    }
}

window.verificationService = new VerificationService();
