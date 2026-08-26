// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IssuerRegistry.sol";

/**
 * @title CredentialStatusRegistry
 * @dev Registry for storing credential commitments and managing revocation status.
 */
contract CredentialStatusRegistry {
    enum CredentialStatus { ACTIVE, REVOKED, EXPIRED }

    struct CredentialCommitment {
        address issuer;
        string holderDid;
        uint256 issuedAt;
        CredentialStatus status;
        string revocationReason;
        uint256 revokedAt;
    }

    IssuerRegistry public issuerRegistry;
    
    // Mapping from credential hash (commitment) to its details
    mapping(bytes32 => CredentialCommitment) public commitments;

    event CredentialAnchored(bytes32 indexed commitment, address indexed issuer, string holderDid);
    event CredentialRevoked(bytes32 indexed commitment, address indexed issuer, string reason);

    modifier onlyApprovedIssuer() {
        require(issuerRegistry.isApprovedIssuer(msg.sender), "Caller is not an approved issuer");
        _;
    }

    constructor(address _issuerRegistryAddress) {
        issuerRegistry = IssuerRegistry(_issuerRegistryAddress);
    }

    function anchorCredential(bytes32 _commitment, string memory _holderDid) public onlyApprovedIssuer {
        require(commitments[_commitment].issuer == address(0), "Credential already anchored");

        commitments[_commitment] = CredentialCommitment({
            issuer: msg.sender,
            holderDid: _holderDid,
            issuedAt: block.timestamp,
            status: CredentialStatus.ACTIVE,
            revocationReason: "",
            revokedAt: 0
        });

        emit CredentialAnchored(_commitment, msg.sender, _holderDid);
    }

    function revokeCredential(bytes32 _commitment, string memory _reason) public onlyApprovedIssuer {
        require(commitments[_commitment].issuer == msg.sender, "Only the original issuer can revoke");
        require(commitments[_commitment].status == CredentialStatus.ACTIVE, "Credential is not active");

        commitments[_commitment].status = CredentialStatus.REVOKED;
        commitments[_commitment].revocationReason = _reason;
        commitments[_commitment].revokedAt = block.timestamp;

        emit CredentialRevoked(_commitment, msg.sender, _reason);
    }

    function getCredentialStatus(bytes32 _commitment) public view returns (CredentialStatus) {
        require(commitments[_commitment].issuer != address(0), "Credential not found");
        return commitments[_commitment].status;
    }
}
