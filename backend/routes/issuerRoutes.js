const express = require("express");
const router = express.Router();

// In-memory mock databases for demo purposes
const organizations = new Map();
const credentials = new Map();

// Organization Routes
router.post("/organization", (req, res) => {
  const org = req.body;
  if (!org.userId) {
      // If no userId, use a default for testing or generate one
      org.userId = "user-" + Date.now();
  }
  organizations.set(org.userId, org);
  res.status(201).json(org);
});

router.get("/organization/:userId", (req, res) => {
  const org = organizations.get(req.params.userId);
  if (org) {
      res.json(org);
  } else {
      res.status(404).json({ error: "Organization not found" });
  }
});

router.get("/organizations", (req, res) => {
  res.json(Array.from(organizations.values()));
});

// Issuance Routes
router.post("/issue", (req, res) => {
  const { did, claims, status = 'ACTIVE' } = req.body;
  const credentialId = 'urn:uuid:' + require('crypto').randomUUID();
  const issueDate = new Date().toISOString();
  
  const credential = {
      "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
      ],
      id: credentialId,
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      issuer: { id: "did:web:demo-university.edu" },
      issuanceDate: issueDate,
      credentialSubject: {
          id: did,
          ...claims
      },
      status,
      proof: {
          type: "Ed25519Signature2018",
          created: issueDate,
          proofPurpose: "assertionMethod",
          verificationMethod: "did:web:demo-university.edu#keys-1",
          jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mock-signature-for-demo-mode"
      }
  };

  credentials.set(credentialId, credential);
  res.status(201).json(credential);
});

router.post("/revoke/:id", (req, res) => {
  const cred = credentials.get(req.params.id);
  if (cred) {
      cred.status = 'REVOKED';
      credentials.set(req.params.id, cred);
      res.json(cred);
  } else {
      res.status(404).json({ error: "Credential not found" });
  }
});

router.get("/credentials", (req, res) => {
  res.json(Array.from(credentials.values()));
});

module.exports = router;
