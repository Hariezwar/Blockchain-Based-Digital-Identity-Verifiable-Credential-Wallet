# CredTrust 
**Blockchain-Based Digital Identity & Verifiable Credential Wallet**

> "Own Your Identity. Share Only What Matters. Verify Instantly."

## Overview
CredTrust is a secure, decentralized digital wallet for verifiable credentials. It allows individuals to store digital documents (like degrees, identity cards, etc.) locally on their device, encrypted with AES-GCM. 

Users can present cryptographic proofs (Verifiable Presentations) of their credentials, which can be instantly verified on-chain against a trusted issuer registry and a revocation registry.

## Features
- **Self-Sovereign Identity (DID)**: Uses `did:key` by default, generated locally.
- **Encrypted Local Wallet**: Uses Web Crypto API (AES-GCM) and IndexedDB. Private keys and credentials never leave your browser unencrypted.
- **Smart Contract Registries**: Contains `IssuerRegistry`, `CredentialStatusRegistry`, and `DIDRegistry` written in Solidity.
- **Dual Mode Architecture**:
  - **Full Mode**: Uses the Node.js/PostgreSQL backend for auth and issuing, and a live Hardhat network for anchoring commitments.
  - **Static Demo Mode**: Designed for hackathon demonstrations. Simulates the backend and blockchain entirely within the browser using Service Workers and IndexedDB, allowing it to be hosted statically on GitHub Pages.

## Project Structure
- `/frontend`: Vanilla JS PWA (HTML, CSS, JS, IndexedDB, WebCrypto).
- `/backend`: Node.js, Express, PostgreSQL backend API.
- `/blockchain`: Hardhat project containing Solidity Smart Contracts.
- `/database`: PostgreSQL schema and migrations.

## Getting Started (Static Demo Mode)
The easiest way to view the project is in **Static Demo Mode**, which requires no backend or blockchain setup.

1. Serve the `/frontend` directory using any static web server (e.g., `npx serve frontend` or VS Code Live Server).
2. Open `index.html` in your browser.
3. Use the built-in demo accounts:
   - **Holder**: `holder@demo.com` / `Demo@123`
   - **Issuer**: `issuer@demo.com` / `Demo@123`
   - **Verifier**: Use the Verification Engine publicly to scan QRs.

## Getting Started (Full Mode)
To run the full stack locally:

### 1. Database
```bash
docker-compose up -d
```
Run the SQL script located in `database/schema/001_initial_schema.sql` against the `credtrust_dev` database.

### 2. Blockchain
```bash
cd blockchain
npm install
npx hardhat node
```
Deploy the contracts to the local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Backend
```bash
cd backend
npm install
npm start
```
The API will be available at `http://localhost:3000`.

### 4. Frontend
Serve the `frontend/` directory on a local web server, ensuring you proxy API requests to `http://localhost:3000`.

## Security Notes
- **Demo Mode**: The static demo mode uses simulated cryptographic checks for the sake of frontend demonstration without a backend.
- **Do not use in production without a comprehensive security audit.** The Web Crypto implementations provided are basic wrappers designed for hackathon demonstrations.
- Never store PII (Personally Identifiable Information) on the blockchain. The `CredentialStatusRegistry` only anchors cryptographic hashes (commitments).

## License
MIT License.
