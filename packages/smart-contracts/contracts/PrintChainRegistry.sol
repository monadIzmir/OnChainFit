// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PrintChainRegistry
 * @notice Design registration and proof-of-creation on-chain
 */
contract PrintChainRegistry is Ownable, Pausable {
    struct DesignRecord {
        bytes32 ipfsHash;
        address designer;
        uint256 registeredAt;
        bool isActive;
    }

    mapping(uint256 => DesignRecord) public designs;
    mapping(address => uint256[]) public designerDesigns;
    mapping(bytes32 => uint256) public ipfsHashToDesignId;
    uint256 private _nextDesignId = 1;

    event DesignRegistered(
        uint256 indexed designId,
        bytes32 indexed ipfsHash,
        address indexed designer,
        uint256 timestamp
    );
    event DesignDeactivated(uint256 indexed designId);

    error DesignNotFound();
    error DesignAlreadyExists();
    error UnauthorizedCaller();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Register a new design with IPFS hash
     * @param ipfsHash IPFS content hash
     * @param designer Designer wallet address
     */
    function registerDesign(bytes32 ipfsHash, address designer)
        external
        onlyOwner
        whenNotPaused
        returns (uint256 designId)
    {
        if (ipfsHashToDesignId[ipfsHash] != 0) {
            revert DesignAlreadyExists();
        }

        designId = _nextDesignId++;
        designs[designId] = DesignRecord(ipfsHash, designer, block.timestamp, true);
        designerDesigns[designer].push(designId);
        ipfsHashToDesignId[ipfsHash] = designId;

        emit DesignRegistered(designId, ipfsHash, designer, block.timestamp);
    }

    /**
     * @notice Get design details
     */
    function getDesign(uint256 designId)
        external
        view
        returns (DesignRecord memory)
    {
        if (!designs[designId].isActive) {
            revert DesignNotFound();
        }
        return designs[designId];
    }

    /**
     * @notice Get all designs by designer
     */
    function getDesignerDesigns(address designer)
        external
        view
        returns (uint256[] memory)
    {
        return designerDesigns[designer];
    }

    /**
     * @notice Deactivate a design
     */
    function deactivateDesign(uint256 designId) external onlyOwner {
        if (!designs[designId].isActive) {
            revert DesignNotFound();
        }
        designs[designId].isActive = false;
        emit DesignDeactivated(designId);
    }

    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
