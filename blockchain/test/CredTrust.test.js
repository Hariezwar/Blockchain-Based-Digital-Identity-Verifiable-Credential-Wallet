const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredTrust Smart Contracts", function () {
  let issuerRegistry;
  let credentialStatusRegistry;
  let didRegistry;
  let owner;
  let issuer1;
  let issuer2;
  let holder;
  let verifier;

  beforeEach(async function () {
    [owner, issuer1, issuer2, holder, verifier] = await ethers.getSigners();

    const IssuerRegistry = await ethers.getContractFactory("IssuerRegistry");
    issuerRegistry = await IssuerRegistry.deploy();

    const CredentialStatusRegistry = await ethers.getContractFactory("CredentialStatusRegistry");
    credentialStatusRegistry = await CredentialStatusRegistry.deploy(issuerRegistry.target);

    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
  });

  describe("IssuerRegistry", function () {
    it("Should register a new issuer in PENDING state", async function () {
      await issuerRegistry.connect(issuer1).registerIssuer("did:ethr:0x123", "Demo University");
      const issuer = await issuerRegistry.getIssuer(issuer1.address);
      expect(issuer.did).to.equal("did:ethr:0x123");
      expect(issuer.status).to.equal(0n); // PENDING
    });

    it("Should allow owner to approve an issuer", async function () {
      await issuerRegistry.connect(issuer1).registerIssuer("did:ethr:0x123", "Demo University");
      await issuerRegistry.connect(owner).setIssuerStatus(issuer1.address, 1); // APPROVED
      const isApproved = await issuerRegistry.isApprovedIssuer(issuer1.address);
      expect(isApproved).to.be.true;
    });
  });

  describe("CredentialStatusRegistry", function () {
    const mockCommitment = ethers.keccak256(ethers.toUtf8Bytes("mock-credential"));

    beforeEach(async function () {
      await issuerRegistry.connect(issuer1).registerIssuer("did:ethr:0x123", "Demo University");
      await issuerRegistry.connect(owner).setIssuerStatus(issuer1.address, 1); // APPROVED
    });

    it("Should allow an approved issuer to anchor a credential", async function () {
      await credentialStatusRegistry.connect(issuer1).anchorCredential(mockCommitment, "did:key:holder123");
      const status = await credentialStatusRegistry.getCredentialStatus(mockCommitment);
      expect(status).to.equal(0n); // ACTIVE
    });

    it("Should not allow an unapproved issuer to anchor", async function () {
      await expect(
        credentialStatusRegistry.connect(issuer2).anchorCredential(mockCommitment, "did:key:holder123")
      ).to.be.revertedWith("Caller is not an approved issuer");
    });
  });
});
