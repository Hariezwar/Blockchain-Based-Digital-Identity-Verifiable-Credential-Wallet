#🔐 Blockchain-Based Digital Identity & Verifiable Credential Wallet

A secure, decentralized digital identity platform that enables users to create and manage decentralized identities (DIDs), receive and store verifiable credentials, and securely share proof of identity without relying on centralized identity databases.

##🌐 Overview

The **Blockchain-Based Digital Identity & Verifiable Credential Wallet** is a web-based application designed around the principles of **Decentralized Identity (DID)** and **Verifiable Credentials (VCs)**.

The platform provides separate workflows for:

* 👤 **Holders** – Manage their decentralized identity and credentials.
* 🏛️ **Issuers** – Issue digitally signed verifiable credentials.
* ✅ **Verifiers** – Verify the authenticity and validity of credentials.
* 🔗 **Blockchain/DID Layer** – Provides tamper-evident identity and credential verification mechanisms.

The goal is to give individuals greater ownership and control over their digital identity while allowing organizations to issue and verify trusted credentials efficiently.

## ✨ Key Features

### 👤 Digital Identity Management

* Create and manage a decentralized identity.
* Generate and display a unique **DID (Decentralized Identifier)**.
* View DID details from the user's profile.
* Manage personal profile information.
* Secure authentication and role-based access.

### 🎓 Verifiable Credential Wallet

* Receive credentials from authorized issuers.
* Store credentials securely inside the wallet.
* View credential details, issuer information, issue date, and status.
* Track active, expired, revoked, and pending credentials.
* Organize credentials through a user-friendly dashboard.

### 🏛️ Credential Issuance

Issuers can:

* Register and authenticate securely.
* View eligible credential requests.
* Create and issue digitally signed credentials.
* Specify credential type, subject, validity period, and metadata.
* Revoke credentials when necessary.
* Maintain an issuance history.

### ✅ Credential Verification

Verifiers can:

* Enter or scan credential information.
* Verify the credential's authenticity.
* Validate the issuer.
* Check credential expiration.
* Check revocation status.
* Compare the credential subject with the presented DID.
* Display a clear **Verified / Invalid / Expired / Revoked** result.

### 🔗 Blockchain & DID Integration

* DID-based identity representation.
* Tamper-evident credential records.
* Credential verification using cryptographic proof concepts.
* Blockchain-ready architecture for decentralized trust.
* Separation of identity ownership from centralized application accounts.

### 🛡️ Security

* Secure authentication.
* Role-based authorization.
* Password hashing.
* Protected API routes.
* Digital signature verification concepts.
* Credential status and revocation checking.
* Input validation and error handling.

## 🔄 System Workflow

```text
                    ┌─────────────────┐
                    │      Holder     │
                    │                 │
                    │ Creates / Owns  │
                    │       DID       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Issuer      │
                    │                 │
                    │ Issues Verifiable│
                    │    Credential   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Digital Wallet  │
                    │                 │
                    │ Stores Credential│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Verifier    │
                    │                 │
                    │ Verifies DID +  │
                    │   Credential    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Verification    │
                    │     Result      │
                    │                 │
                    │ Valid / Invalid │
                    │ Expired / Revoked│
                    └─────────────────┘
```

## 🧩 User Roles

| Role              | Responsibilities                                                               |
| ----------------- | ------------------------------------------------------------------------------ |
| **Holder**        | Creates/manages DID, receives credentials, stores credentials and shares proof |
| **Issuer**        | Validates requests, issues credentials, manages credential lifecycle           |
| **Verifier**      | Requests and verifies credentials and their authenticity                       |
| **Administrator** | Manages platform configuration, users, roles and system monitoring             |

## 🏗️ Technology Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Responsive UI
* Dashboard-based interface

### Backend

* Node.js
* Express.js
* REST APIs
* Authentication and authorization middleware

### Database

* MongoDB / MongoDB Atlas
* User records
* DID information
* Credential metadata
* Issuance and verification records
* Revocation/status information

### Identity & Blockchain Concepts

* Decentralized Identifiers (DIDs)
* Verifiable Credentials (VCs)
* Public/private key concepts
* Cryptographic signatures
* Blockchain-based trust and integrity

## 📁 Project Structure

```text
Blockchain-Digital-Identity-Wallet/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── profile.html
│   ├── credentials.html
│   ├── verify.html
│   ├── issuer.html
│   ├── verifier.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── services/
│
├── database/
│   └── seed/
│
├── docs/
│
├── .env.example
├── package.json
└── README.md
```

## 🔑 Example Credential

```json
{
  "id": "urn:uuid:credential-001",
  "type": [
    "VerifiableCredential",
    "UniversityDegreeCredential"
  ],
  "issuer": {
    "id": "did:example:university123",
    "name": "Example University"
  },
  "credentialSubject": {
    "id": "did:example:holder456",
    "name": "Student Name",
    "degree": "B.Tech Computer Science"
  },
  "issuanceDate": "2026-08-01",
  "expirationDate": "2030-08-01",
  "status": "active"
}
```

## 🔄 Credential Lifecycle

```text
Request
   ↓
Issuer Review
   ↓
Credential Creation
   ↓
Digital Signing
   ↓
Credential Issued
   ↓
Holder Wallet
   ↓
Credential Presentation
   ↓
Verifier Validation
   ↓
Verified
   ↓
Possible Revocation / Expiration
```

## 🧪 Verification Process

When a credential is presented, the system checks:

1. Credential format and required fields.
2. Issuer identity.
3. Credential subject DID.
4. Digital signature/proof.
5. Issue date and expiration date.
6. Credential status.
7. Revocation status.
8. Integrity of the credential data.

The verifier receives an easy-to-understand result such as:

```text
✅ CREDENTIAL VERIFIED

Issuer: Example University
Holder DID: did:example:holder456
Credential: University Degree
Status: Active
Issued: 01 Aug 2026
Expires: 01 Aug 2030
```

## 🎯 Objectives

* Provide users with ownership of their digital identity.
* Reduce dependence on centralized identity providers.
* Enable secure and portable digital credentials.
* Prevent unauthorized modification of credentials.
* Simplify credential verification.
* Support realistic issuer–holder–verifier workflows.
* Demonstrate practical applications of blockchain and decentralized identity technology.

## 🌍 Real-World Applications

This project can be adapted for:

* 🎓 University degree and academic certificates
* 💼 Employment and professional credentials
* 🪪 Digital identity verification
* 🏥 Healthcare credentials
* 🏦 KYC and financial onboarding
* 🏢 Employee identity systems
* 🚗 Digital driving credentials
* 📜 Training and certification verification
* 🌐 Cross-platform identity management

## 🚀 Future Enhancements

* Integration with a real blockchain network.
* Support for standards such as W3C DID and Verifiable Credentials.
* Wallet-to-wallet credential exchange.
* QR-code based credential presentation.
* Selective disclosure and privacy-preserving verification.
* Zero-knowledge proof integration.
* Hardware wallet support.
* Mobile application.
* Multi-chain identity support.
* Decentralized revocation/status registries.

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Blockchain-Digital-Identity-Wallet.git
cd Blockchain-Digital-Identity-Wallet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

### 4. Start the backend

```bash
npm start
```

### 5. Open the frontend

Open the frontend through the configured development server or browser.

## 🧑‍💻 Demo Roles

For demonstration purposes, the application can provide separate accounts for:

```text
Holder
Issuer
Verifier
Administrator
```

Each role should have access only to the workflows and actions appropriate to that role.

## 📌 Project Highlights

* Decentralized Identity
* Blockchain Technology
* Verifiable Credentials
* Digital Wallet
* Cryptographic Verification
* Role-Based Access Control
* Secure Authentication
* Credential Lifecycle Management
* Tamper-Evident Data
* Issuer–Holder–Verifier Architecture

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

Create a Pull Request with a clear description of the proposed changes.

## 📄 License

This project is intended for educational, research, and demonstration purposes. Add an appropriate open-source license such as MIT before publishing the project for external contributions.

## 👨‍💻 Author

**HARIEZWAR U.**

B.Tech – Computer Science and Business Systems
V.S.B Engineering College

---

⭐ **If you find this project useful, consider giving the repository a star!**

> **"Own your identity. Control your credentials. Verify with confidence."**
