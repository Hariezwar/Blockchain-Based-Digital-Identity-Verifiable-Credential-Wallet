// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DIDRegistry
 * @dev Simple on-chain registry for DID documents (for EVM DIDs if used).
 */
contract DIDRegistry {
    struct DIDDocument {
        string did;
        string documentHash; // IPFS hash or similar pointing to the DID Document
        bool isActive;
        uint256 updatedAt;
    }

    // Mapping from controller address to DIDDocument
    mapping(address => DIDDocument) public didDocuments;

    event DIDRegistered(address indexed controller, string did, string documentHash);
    event DIDUpdated(address indexed controller, string documentHash);
    event DIDDeactivated(address indexed controller);

    function registerDID(string memory _did, string memory _documentHash) public {
        require(bytes(didDocuments[msg.sender].did).length == 0, "DID already registered for this address");

        didDocuments[msg.sender] = DIDDocument({
            did: _did,
            documentHash: _documentHash,
            isActive: true,
            updatedAt: block.timestamp
        });

        emit DIDRegistered(msg.sender, _did, _documentHash);
    }

    function updateDIDDocument(string memory _newDocumentHash) public {
        require(bytes(didDocuments[msg.sender].did).length > 0, "DID not registered");
        require(didDocuments[msg.sender].isActive, "DID is deactivated");

        didDocuments[msg.sender].documentHash = _newDocumentHash;
        didDocuments[msg.sender].updatedAt = block.timestamp;

        emit DIDUpdated(msg.sender, _newDocumentHash);
    }

    function deactivateDID() public {
        require(bytes(didDocuments[msg.sender].did).length > 0, "DID not registered");
        require(didDocuments[msg.sender].isActive, "DID already deactivated");

        didDocuments[msg.sender].isActive = false;
        didDocuments[msg.sender].updatedAt = block.timestamp;

        emit DIDDeactivated(msg.sender);
    }

    function resolveDID(address _controller) public view returns (DIDDocument memory) {
        return didDocuments[_controller];
    }
}
