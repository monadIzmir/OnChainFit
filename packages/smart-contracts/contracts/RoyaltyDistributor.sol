// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title RoyaltyDistributor
 * @notice Automatic payment distribution with platform commission
 */
contract RoyaltyDistributor is Ownable, ReentrancyGuard, Pausable {
    // Basis points: 10000 = 100%
    uint256 public platformFeeBps = 800; // 8%
    address public platformWallet;

    struct PayoutParams {
        uint256 orderId;
        address designer;
        address brand;
        uint256 grossAmount;
        uint256 brandShareAmount;
        uint256 shippingAndTax;
        bytes backendSignature;
    }

    mapping(uint256 => bool) public processedOrders;
    mapping(address => uint256) public pendingWithdrawals;

    event PayoutDistributed(
        uint256 indexed orderId,
        address indexed designer,
        uint256 netAmount,
        uint256 platformFee
    );
    event PlatformFeeUpdated(uint256 newFeeBps);
    event Withdrawal(address indexed recipient, uint256 amount);

    error InvalidAmount();
    error OrderAlreadyProcessed();
    error InvalidSignature();
    error TransferFailed();
    error MaxFeeExceeded();

    constructor(address _platformWallet) Ownable(msg.sender) {
        platformWallet = _platformWallet;
    }

    /**
     * @notice Distribute payment to designer, brand, and platform
     */
    function distributePayment(PayoutParams calldata params)
        external
        onlyOwner
        nonReentrant
        whenNotPaused
    {
        if (processedOrders[params.orderId]) {
            revert OrderAlreadyProcessed();
        }
        if (params.grossAmount == 0) {
            revert InvalidAmount();
        }

        _verifyBackendSignature(params);

        processedOrders[params.orderId] = true;

        uint256 platformFee = (params.grossAmount * platformFeeBps) / 10000;
        uint256 netDesigner = params.grossAmount -
            params.brandShareAmount -
            platformFee -
            params.shippingAndTax;

        if (netDesigner == 0) {
            revert InvalidAmount();
        }

        // Pull-payment pattern
        pendingWithdrawals[params.designer] += netDesigner;
        pendingWithdrawals[params.brand] += params.brandShareAmount;
        pendingWithdrawals[platformWallet] += platformFee;

        emit PayoutDistributed(
            params.orderId,
            params.designer,
            netDesigner,
            platformFee
        );
    }

    /**
     * @notice Withdraw pending balance
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) {
            revert InvalidAmount();
        }

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @notice Get pending balance
     */
    function getPendingBalance(address account)
        external
        view
        returns (uint256)
    {
        return pendingWithdrawals[account];
    }

    /**
     * @notice Update platform fee (basis points)
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 1500) {
            revert MaxFeeExceeded(); // Max 15%
        }
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    /**
     * @notice Verify backend signature for replay protection
     */
    function _verifyBackendSignature(PayoutParams calldata params)
        internal
        view
    {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                params.orderId,
                params.designer,
                params.grossAmount,
                params.shippingAndTax
            )
        );

        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                messageHash
            )
        );

        address signer = _recoverSigner(
            ethSignedMessageHash,
            params.backendSignature
        );

        if (signer != owner()) {
            revert InvalidSignature();
        }
    }

    /**
     * @notice Recover signer from ECDSA signature
     */
    function _recoverSigner(bytes32 hash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        if (signature.length != 65) {
            revert InvalidSignature();
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        return ecrecover(hash, v, r, s);
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

    /**
     * @notice Accept native token transfers
     */
    receive() external payable {}
}
