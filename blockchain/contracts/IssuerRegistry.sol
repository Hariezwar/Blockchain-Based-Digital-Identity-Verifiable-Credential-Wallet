// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IssuerRegistry
 * @dev Registry for trusted credential issuers.
 */
contract IssuerRegistry {
    enum IssuerStatus { PENDING, APPROVED, SUSPENDED, REJECTED }

    struct Issuer {
        string did;
        string name;
        IssuerStatus status;
        uint256 registeredAt;
        uint256 updatedAt;
    }

    address public owner;
    mapping(address => Issuer) public issuers;
    address[] public issuerAddresses;

    event IssuerRegistered(address indexed issuerAddress, string did, string name);
    event IssuerStatusChanged(address indexed issuerAddress, IssuerStatus newStatus);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerIssuer(string memory _did, string memory _name) public {
        require(bytes(issuers[msg.sender].did).length == 0, "Issuer already registered");
        
        issuers[msg.sender] = Issuer({
            did: _did,
            name: _name,
            status: IssuerStatus.PENDING,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });
        issuerAddresses.push(msg.sender);

        emit IssuerRegistered(msg.sender, _did, _name);
    }

    function setIssuerStatus(address _issuerAddress, IssuerStatus _status) public onlyOwner {
        require(bytes(issuers[_issuerAddress].did).length > 0, "Issuer not found");
        
        issuers[_issuerAddress].status = _status;
        issuers[_issuerAddress].updatedAt = block.timestamp;

        emit IssuerStatusChanged(_issuerAddress, _status);
    }

    function isApprovedIssuer(address _issuerAddress) public view returns (bool) {
        return issuers[_issuerAddress].status == IssuerStatus.APPROVED;
    }

    function getIssuer(address _issuerAddress) public view returns (Issuer memory) {
        return issuers[_issuerAddress];
    }
}
