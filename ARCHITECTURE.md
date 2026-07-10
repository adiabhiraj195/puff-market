# PUFF NFT Marketplace — Complete Architecture Reference

> **Document purpose:** This is a full, self-contained technical reference describing every layer of the PUFF NFT Marketplace. It is written so that any developer or AI system with no prior context can read this document alone and understand exactly how every piece of the system is built, why each decision was made, and how all components interact with each other.
>
> **Project type:** Portfolio project demonstrating fullstack Web3 engineering.
> **Scope:** Not production-hardened (no audit, no multisig). Built to demonstrate skills.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Technology Stack](#2-technology-stack)
3. [Repository Layout](#3-repository-layout)
4. [Core Principles](#4-core-principles)
5. [Smart Contract Layer](#5-smart-contract-layer)
   - 5.1 [PuffToken.sol — ERC-20 Currency](#51-pufftokensol--erc-20-currency)
   - 5.2 [PuffNFT.sol — ERC-721 Asset](#52-puffnftsol--erc-721-asset)
   - 5.3 [Marketplace.sol — Fixed-Price Trading](#53-marketplacesol--fixed-price-trading)
   - 5.4 [Auction.sol — Bidding Engine](#54-auctionsol--bidding-engine)
   - 5.5 [Contract Interaction Map](#55-contract-interaction-map)
   - 5.6 [Security Patterns Used](#56-security-patterns-used)
   - 5.7 [Deployment Order](#57-deployment-order)
6. [NFT Metadata Specification](#6-nft-metadata-specification)
   - 6.1 [What Lives Where](#61-what-lives-where)
   - 6.2 [Metadata JSON Schema](#62-metadata-json-schema)
   - 6.3 [Upload Flow Before Minting](#63-upload-flow-before-minting)
7. [Auction Data Model](#7-auction-data-model)
   - 7.1 [On-Chain State](#71-on-chain-state)
   - 7.2 [Off-Chain State](#72-off-chain-state)
   - 7.3 [Lifecycle States](#73-lifecycle-states)
8. [Backend Layer — Node/Express](#8-backend-layer--nodeexpress)
   - 8.1 [Why a Separate Backend](#81-why-a-separate-backend)
   - 8.2 [Three Jobs in One Process](#82-three-jobs-in-one-process)
   - 8.3 [Database Schema — Prisma](#83-database-schema--prisma)
   - 8.4 [SIWE Authentication Flow](#84-siwe-authentication-flow)
   - 8.5 [Event Indexer](#85-event-indexer)
   - 8.6 [WebSocket Events](#86-websocket-events)
9. [API Reference](#9-api-reference)
   - 9.1 [Auth Routes](#91-auth-routes)
   - 9.2 [Media Routes](#92-media-routes)
   - 9.3 [NFT Routes](#93-nft-routes)
   - 9.4 [Listing Routes](#94-listing-routes)
   - 9.5 [Auction Routes](#95-auction-routes)
   - 9.6 [User Routes](#96-user-routes)
10. [Frontend Layer — Next.js](#10-frontend-layer--nextjs)
    - 10.1 [Pages](#101-pages)
    - 10.2 [Key Components](#102-key-components)
    - 10.3 [Wallet Connection Pattern](#103-wallet-connection-pattern)
    - 10.4 [Transaction State Pattern](#104-transaction-state-pattern)
11. [End-to-End User Flows](#11-end-to-end-user-flows)
    - 11.1 [Connect Wallet and Login](#111-connect-wallet-and-login)
    - 11.2 [Claim PUFF from Faucet](#112-claim-puff-from-faucet)
    - 11.3 [Mint an NFT](#113-mint-an-nft)
    - 11.4 [List NFT for Fixed Price](#114-list-nft-for-fixed-price)
    - 11.5 [Buy an NFT](#115-buy-an-nft)
    - 11.6 [Create an Auction](#116-create-an-auction)
    - 11.7 [Place a Bid](#117-place-a-bid)
    - 11.8 [Settle an Auction](#118-settle-an-auction)
12. [Money Flow — PUFF Distribution](#12-money-flow--puff-distribution)
13. [Environment Variables](#13-environment-variables)
14. [Infrastructure and Deployment](#14-infrastructure-and-deployment)
15. [What Is Intentionally Omitted](#15-what-is-intentionally-omitted)

---

## 1. Project Summary

PUFF NFT Marketplace is a decentralised NFT trading platform where:

- Users authenticate by signing a message with their crypto wallet — no email or password.
- Users mint NFTs (image or video) that are permanently stored on IPFS.
- NFTs can be listed for a fixed price or put up for an English-style timed auction.
- All transactions use **PUFF**, a custom ERC-20 token, as the marketplace currency.
- New users receive a one-time bonus of 5,000 PUFF plus 1,000 PUFF on every subsequent daily faucet claim.
- The original NFT creator automatically receives a 5% royalty on every secondary sale, enforced at the smart contract level via EIP-2981.
- The marketplace takes a 2.5% fee on every completed sale or settled auction.
- Auction bidders receive live bid updates via WebSocket without refreshing the page.

The four smart contracts handle all value and ownership. The Node/Express backend handles indexing, search, and authentication. The Next.js frontend is the interface. None of these three layers duplicates the responsibility of another.

---

## 2. Technology Stack

### Smart Contracts

| Tool | Version | Purpose |
|---|---|---|
| Solidity | ^0.8.24 | Contract language |
| Foundry (forge + cast) | latest | Compile, test, deploy, fuzz |
| OpenZeppelin Contracts | 5.x | ERC-20, ERC-721, security mixins |
| Sepolia testnet | — | Public deployment target |
| Etherscan (Sepolia) | — | Contract verification and public ABI |

### Backend

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| TypeScript | 5.x | Type safety |
| Express | 4.x | HTTP server |
| Prisma | 5.x | ORM and migration tool |
| PostgreSQL | 15 | Primary relational database |
| Socket.io | 4.x | Real-time WebSocket server |
| viem | 2.x | Ethereum RPC client and event listener |
| siwe | 2.x | Sign-In With Ethereum message parsing |
| jsonwebtoken | 9.x | Session tokens after SIWE auth |
| Pinata SDK | latest | IPFS upload and pinning |
| zod | 3.x | Runtime request body validation |
| ffmpeg | system | Server-side video thumbnail generation |

### Frontend

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | React framework with SSR and ISR |
| Tailwind CSS | 3.x | Utility-first styling |
| wagmi | 2.x | React hooks for Ethereum contracts |
| viem | 2.x | Low-level Ethereum interactions |
| RainbowKit | 2.x | Wallet connection modal UI |
| Socket.io-client | 4.x | Live auction bid updates |
| axios | 1.x | HTTP calls to the backend API |
| react-dropzone | 14.x | File upload drag-and-drop UI |

---

## 3. Repository Layout

```
puff-marketplace/
│
├── contracts/                          Foundry project
│   ├── src/
│   │   ├── PuffToken.sol               ERC-20 currency + faucet
│   │   ├── PuffNFT.sol                 ERC-721 NFT asset + royalty
│   │   ├── Marketplace.sol             Fixed-price listing and buy
│   │   └── Auction.sol                 Timed English auction
│   ├── test/
│   │   ├── PuffToken.t.sol
│   │   ├── PuffNFT.t.sol
│   │   ├── Marketplace.t.sol
│   │   └── Auction.t.sol
│   ├── script/
│   │   └── Deploy.s.sol                Deployment script, outputs addresses
│   └── foundry.toml
│
├── backend/                            Node/Express service
│   ├── src/
│   │   ├── index.ts                    Express app entry + Socket.io server
│   │   ├── routes/
│   │   │   ├── auth.ts                 SIWE nonce + verify endpoints
│   │   │   ├── nfts.ts                 Browse, search, detail endpoints
│   │   │   ├── listings.ts             Create, cancel, update listing
│   │   │   ├── auctions.ts             Create auction, get auction + bids
│   │   │   └── users.ts                Profile read and update
│   │   ├── indexer/
│   │   │   └── index.ts                Chain event listener (all 4 contracts)
│   │   ├── middleware/
│   │   │   └── auth.ts                 JWT verification middleware
│   │   └── lib/
│   │       ├── prisma.ts               Prisma client singleton
│   │       ├── ipfs.ts                 Pinata upload helpers
│   │       └── contracts.ts            Contract addresses + ABIs
│   ├── prisma/
│   │   └── schema.prisma               Full database schema
│   └── package.json
│
├── frontend/                           Next.js application
│   ├── app/
│   │   ├── page.tsx                    / — Marketplace grid (SSR + ISR)
│   │   ├── nft/[tokenId]/page.tsx      NFT detail page
│   │   ├── auction/[id]/page.tsx       Live auction page
│   │   ├── profile/[address]/page.tsx  Public user profile
│   │   ├── mint/page.tsx               Mint flow (protected)
│   │   └── list/[tokenId]/page.tsx     List or auction flow (protected)
│   ├── components/
│   │   ├── WalletButton.tsx
│   │   ├── NFTCard.tsx
│   │   ├── NFTGrid.tsx
│   │   ├── NFTDetail/
│   │   ├── Auction/
│   │   ├── Mint/
│   │   └── shared/
│   ├── hooks/
│   │   └── useContractAction.ts        Universal tx state machine hook
│   ├── lib/
│   │   ├── wagmi.ts                    wagmi config + chain setup
│   │   └── api.ts                      Typed axios API client
│   └── package.json
│
└── README.md
```

---

## 4. Core Principles

These are the rules that govern every architectural decision in this project. If something looks odd, it is probably explained by one of these principles.

### The blockchain is the single source of truth

Ownership of an NFT, PUFF balances, listing prices, current auction bids, and auction end times — all of these exist canonically on-chain. The Postgres database is a **read-optimised cache** of on-chain state, rebuilt automatically from contract events by the indexer. If the database and the chain ever disagree about who owns an NFT, the chain is correct. The database gets corrected on the next indexed event, not the other way around. This rule prevents a class of bugs where manipulating a database row gives someone assets they don't own on-chain.

### Contracts are loosely coupled through standard interfaces

The four contracts do not import each other. Marketplace and Auction know about PuffToken only as `IERC20`. They know about PuffNFT only as `IERC721` and `IERC2981`. This means any ERC-20 could theoretically be used as the currency, and any ERC-721 with royalty support could be listed. The actual contract addresses are passed in at deploy time, not hardcoded. This is correct contract design.

### Pull payments, never push payments

When a sale completes or a bid is refunded, the contract credits an internal balance mapping (`proceeds[address]` or `pendingRefunds[auctionId][address]`). The recipient must call a separate function to withdraw their funds. The alternative — pushing funds automatically in the same transaction — would mean a malicious or broken recipient contract could revert the entire transaction and block all other users. Pull payments eliminate this attack vector entirely.

### Checks-Effects-Interactions ordering

Every function that moves value reads and validates state first (Checks), then updates all internal state (Effects), then makes external calls (Interactions). This ordering prevents reentrancy attacks because by the time an external call is made, the contract's own state already reflects the completed action. A reentrant call would find the listing marked inactive and revert harmlessly.

### The backend never touches user funds or keys

The Node/Express backend has no private key with authority over user funds. It cannot move NFTs or PUFF on behalf of users. Its only on-chain responsibilities are reading contract state and listening to events. All transactions that move value are signed and broadcast by the user's own wallet.

---

## 5. Smart Contract Layer

There are exactly four contracts. Each has one job. They are deployed independently and interact only through standard ERC interfaces.

---

### 5.1 PuffToken.sol — ERC-20 Currency

**Single responsibility:** Be the marketplace currency. Track PUFF balances, allow transfers, and mint PUFF through the faucet.

**Inherits from OpenZeppelin:** `ERC20`, `ERC20Permit`, `Ownable2Step`

**Full source:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract PuffToken is ERC20, ERC20Permit, Ownable2Step {

    uint256 public constant MAX_SUPPLY       = 1_000_000_000 * 1e18; // 1 billion PUFF
    uint256 public constant FAUCET_AMOUNT    =         1_000 * 1e18; // 1,000 PUFF per daily claim
    uint256 public constant NEW_USER_BONUS   =         5_000 * 1e18; // 5,000 PUFF first claim only
    uint256 public constant FAUCET_COOLDOWN  = 24 hours;

    mapping(address => uint256) public lastFaucetClaim;
    mapping(address => bool)    public hasClaimedBonus;

    event FaucetClaimed(address indexed user, uint256 amount);
    event NewUserBonus(address indexed user, uint256 bonus);

    constructor()
        ERC20("Puff Coin", "PUFF")
        ERC20Permit("Puff Coin")
        Ownable2Step(msg.sender)
    {
        // Mint 100 million PUFF to deployer as treasury reserve
        _mint(msg.sender, 100_000_000 * 1e18);
    }

    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "PuffToken: cooldown active"
        );

        uint256 amount = FAUCET_AMOUNT;

        // First-ever claim receives new-user bonus on top of regular amount
        if (!hasClaimedBonus[msg.sender]) {
            amount += NEW_USER_BONUS;
            hasClaimedBonus[msg.sender] = true;
            emit NewUserBonus(msg.sender, NEW_USER_BONUS);
        }

        require(totalSupply() + amount <= MAX_SUPPLY, "PuffToken: max supply reached");

        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);

        emit FaucetClaimed(msg.sender, amount);
    }
}
```

**State variables explained:**

| Variable | Type | Purpose |
|---|---|---|
| `MAX_SUPPLY` | constant | Hard cap — faucet will revert if minting would exceed this |
| `FAUCET_AMOUNT` | constant | PUFF minted on every regular faucet call |
| `NEW_USER_BONUS` | constant | Additional PUFF minted only on the very first faucet call |
| `FAUCET_COOLDOWN` | constant | Minimum time between faucet claims per address |
| `lastFaucetClaim[address]` | mapping | Unix timestamp of last claim — enforces cooldown |
| `hasClaimedBonus[address]` | mapping | Whether this address has already received the new-user bonus |

**Why `ERC20Permit` (EIP-2612)?**

Standard ERC-20 requires two separate transactions to spend tokens: first `approve(spenderAddress, amount)`, then the actual operation (e.g. `buyItem`). With Permit, the user signs a typed message off-chain (no gas cost, no transaction) that grants spending permission. The Marketplace or Auction contract then calls `permit()` plus `transferFrom()` in a single transaction. This reduces the buy and bid flows from two user-facing transactions to one, which is how modern DeFi protocols like Uniswap v3 work.

**Why the faucet lives in `PuffToken.sol` and not a separate contract:**

The faucet mints new PUFF. Minting is a token-level operation. If the faucet were a separate contract, it would need `MINTER_ROLE` on PuffToken — adding an unnecessary intermediary contract with its own attack surface. Keeping the faucet inside the token contract is simpler, has fewer moving parts, and fewer places for bugs. The call chain `user → PuffToken.faucet()` is strictly better than `user → FaucetContract.claim() → PuffToken.mint()`.

---

### 5.2 PuffNFT.sol — ERC-721 Asset

**Single responsibility:** Mint NFTs, track ownership, store `tokenURI` pointers to IPFS, and answer royalty queries. It knows nothing about prices, listings, or auctions.

**Inherits from OpenZeppelin:** `ERC721`, `ERC721URIStorage`, `ERC2981`, `Ownable2Step`

**Full source:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

contract PuffNFT is ERC721, ERC721URIStorage, ERC2981, Ownable2Step {

    uint256 private _nextTokenId;
    uint96  public  constant ROYALTY_BPS = 500; // 5% — in basis points

    mapping(uint256 => address) public originalCreator;

    event Minted(address indexed creator, uint256 indexed tokenId, string tokenURI);

    constructor()
        ERC721("Puff NFT", "PNFT")
        Ownable2Step(msg.sender)
    {}

    function mint(address to, string calldata uri) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        originalCreator[tokenId] = to;
        _setDefaultRoyalty(to, ROYALTY_BPS);
        emit Minted(to, tokenId, uri);
        return tokenId;
    }

    // EIP-2981: called by Marketplace and Auction to calculate royalty split
    // Returns (recipientAddress, royaltyAmount) given a sale price
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        public
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return super.royaltyInfo(tokenId, salePrice);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
```

**State variables explained:**

| Variable | Type | Purpose |
|---|---|---|
| `_nextTokenId` | uint256 | Auto-incrementing counter; becomes each new token's ID |
| `ROYALTY_BPS` | constant | 500 = 5% royalty charged on every secondary sale |
| `originalCreator[tokenId]` | mapping | Stores the minting wallet address — useful for UI display |

**What `tokenURI` returns:**

The string `ipfs://bafyrei.../metadata.json` — a content-addressed IPFS URI pointing to the NFT metadata JSON (see section 6). The contract never stores media files directly. It stores only the IPFS URI that points to where metadata lives off-chain.

**Why `ERC2981` matters:**

`ERC2981` is the NFT Royalty Standard. When `Marketplace.buyItem()` or `Auction.settleAuction()` processes a sale, it calls `royaltyInfo(tokenId, salePrice)` on this contract to get back `(creatorAddress, royaltyAmount)`. It then routes that PUFF amount to the creator automatically. The creator never has to do anything. The seller cannot opt out. Royalties are enforced at the protocol layer, not by goodwill.

**Why `_safeMint` instead of `_mint`:**

`_safeMint` checks whether the recipient address is a smart contract, and if so, calls `onERC721Received()` on it to verify the contract can actually handle ERC-721 tokens. This prevents NFTs from being accidentally locked in contracts that don't know how to hold them.

---

### 5.3 Marketplace.sol — Fixed-Price Trading

**Single responsibility:** Allow sellers to list NFTs at a fixed PUFF price, allow buyers to purchase them, and distribute the proceeds — minus fee and royalty — to the seller.

**Inherits from OpenZeppelin:** `ReentrancyGuard`, `Ownable2Step`, `Pausable`

**Key design decision — approval-based listing, not escrow:**

The NFT stays in the seller's wallet for the duration of the listing. The seller grants the Marketplace contract approval via `NFT.setApprovalForAll()` or `NFT.approve()`. When a buyer calls `buyItem()`, the contract uses that approval to pull the NFT directly from the seller to the buyer in one atomic step. The NFT is never in the Marketplace contract's custody. This is more capital-efficient than escrow and appropriate for fixed-price listings because there is no time risk — the sale either happens immediately or doesn't happen.

**Full source:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Marketplace is ReentrancyGuard, Ownable2Step, Pausable {

    IERC20  public immutable puffToken;
    uint256 public constant  FEE_BPS = 250; // 2.5% marketplace fee

    struct Listing {
        address seller;
        uint256 price;   // PUFF amount in wei (18 decimals)
        bool    active;
    }

    // nftContract address => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;
    // seller address => withdrawable PUFF balance
    mapping(address => uint256) public proceeds;

    event Listed(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event Sale(
        address indexed nft,
        uint256 indexed tokenId,
        address buyer,
        uint256 price
    );
    event ListingCancelled(address indexed nft, uint256 indexed tokenId);
    event PriceUpdated(address indexed nft, uint256 indexed tokenId, uint256 newPrice);
    event ProceedsWithdrawn(address indexed seller, uint256 amount);

    constructor(address _puffToken) Ownable2Step(msg.sender) {
        puffToken = IERC20(_puffToken);
    }

    function listItem(
        address nft,
        uint256 tokenId,
        uint256 price
    ) external whenNotPaused {
        require(price > 0, "Marketplace: price must be > 0");
        require(IERC721(nft).ownerOf(tokenId) == msg.sender, "Marketplace: not owner");
        require(
            IERC721(nft).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nft).getApproved(tokenId) == address(this),
            "Marketplace: contract not approved"
        );

        listings[nft][tokenId] = Listing({
            seller: msg.sender,
            price:  price,
            active: true
        });

        emit Listed(nft, tokenId, msg.sender, price);
    }

    function buyItem(
        address nft,
        uint256 tokenId
    ) external nonReentrant whenNotPaused {
        Listing memory listing = listings[nft][tokenId];

        // CHECKS
        require(listing.active, "Marketplace: not listed");
        require(
            IERC721(nft).ownerOf(tokenId) == listing.seller,
            "Marketplace: seller no longer owns NFT"
        );

        // Calculate royalty and fee splits
        (address royaltyRecipient, uint256 royaltyAmount) =
            IERC2981(nft).royaltyInfo(tokenId, listing.price);
        uint256 fee            = (listing.price * FEE_BPS) / 10_000;
        uint256 sellerProceeds = listing.price - fee - royaltyAmount;

        // EFFECTS — update state before any external calls
        listings[nft][tokenId].active = false;
        proceeds[listing.seller]  += sellerProceeds;
        proceeds[royaltyRecipient] += royaltyAmount;
        proceeds[owner()]          += fee;

        // INTERACTIONS — external calls happen last
        puffToken.transferFrom(msg.sender, address(this), listing.price);
        IERC721(nft).safeTransferFrom(listing.seller, msg.sender, tokenId);

        emit Sale(nft, tokenId, msg.sender, listing.price);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "Marketplace: nothing to withdraw");
        proceeds[msg.sender] = 0;                     // zero before transfer (CEI)
        puffToken.transfer(msg.sender, amount);
        emit ProceedsWithdrawn(msg.sender, amount);
    }

    function cancelListing(address nft, uint256 tokenId) external {
        require(listings[nft][tokenId].seller == msg.sender, "Marketplace: not seller");
        listings[nft][tokenId].active = false;
        emit ListingCancelled(nft, tokenId);
    }

    function updatePrice(address nft, uint256 tokenId, uint256 newPrice) external {
        require(listings[nft][tokenId].seller == msg.sender, "Marketplace: not seller");
        require(newPrice > 0, "Marketplace: price must be > 0");
        listings[nft][tokenId].price = newPrice;
        emit PriceUpdated(nft, tokenId, newPrice);
    }

    // Emergency pause — only owner
    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
```

**Money flow inside `buyItem()` for a 1,000 PUFF sale:**

```
Buyer pays:    1,000 PUFF
  → Seller gets:  925 PUFF  (proceeds[seller] += 925)
  → Creator gets:  50 PUFF  (proceeds[creator] += 50  — EIP-2981 royalty 5%)
  → Owner gets:    25 PUFF  (proceeds[owner]  += 25  — marketplace fee 2.5%)

All three balances credited as pending.
Each party calls withdrawProceeds() separately to claim.
```

**Why the NFT ownership check in `buyItem()` matters:**

A seller could list their NFT and then transfer it away, making the listing stale. A buyer could then call `buyItem()` on a listing where the seller no longer holds the NFT. The check `ownerOf(tokenId) == listing.seller` catches this and reverts cleanly instead of producing a confusing error from the NFT contract.

---

### 5.4 Auction.sol — Bidding Engine

**Single responsibility:** Run timed English auctions. Take custody of the NFT for the auction duration, take custody of bids in PUFF, extend the auction on last-minute bids, settle and distribute funds when the auction ends.

**Inherits from OpenZeppelin:** `ReentrancyGuard`, `Ownable2Step`, `Pausable`

**Key design decision — escrow-based, unlike Marketplace:**

The NFT is transferred into the Auction contract when the auction is created. This is mandatory: without escrow, a seller could create an auction for an NFT and then sell it on the Marketplace simultaneously, or transfer it away mid-auction. Escrow guarantees the NFT exists in the contract and will be delivered to the winner.

**Full source:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Auction is ReentrancyGuard, Ownable2Step, Pausable, IERC721Receiver {

    IERC20  public immutable puffToken;
    uint256 public constant FEE_BPS               = 250;        // 2.5%
    uint256 public constant MIN_BID_INCREMENT_BPS = 500;        // 5% minimum raise
    uint256 public constant ANTI_SNIPE_WINDOW     = 10 minutes; // trigger window
    uint256 public constant ANTI_SNIPE_EXTENSION  = 10 minutes; // added time

    struct AuctionData {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startPrice;     // minimum first bid
        uint256 highestBid;
        address highestBidder;  // zero address if no bids yet
        uint256 endTime;        // unix timestamp
        bool    settled;
        bool    cancelled;
    }

    uint256 private _nextAuctionId;

    mapping(uint256 => AuctionData)                    public auctions;
    // auctionId => bidder address => refundable PUFF amount
    mapping(uint256 => mapping(address => uint256))    public pendingRefunds;

    event AuctionCreated(
        uint256 indexed auctionId,
        address nft,
        uint256 tokenId,
        uint256 startPrice,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionExtended(uint256 indexed auctionId, uint256 newEndTime);
    event AuctionSettled(uint256 indexed auctionId, address winner, uint256 amount);
    event AuctionCancelled(uint256 indexed auctionId);
    event RefundWithdrawn(uint256 indexed auctionId, address bidder, uint256 amount);

    constructor(address _puffToken) Ownable2Step(msg.sender) {
        puffToken = IERC20(_puffToken);
    }

    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration        // seconds, between 1 hour and 7 days
    ) external whenNotPaused returns (uint256 auctionId) {
        require(startPrice > 0, "Auction: start price must be > 0");
        require(
            duration >= 1 hours && duration <= 7 days,
            "Auction: duration out of range"
        );
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Auction: not token owner"
        );

        // Pull NFT into escrow — seller cannot move it until auction resolves
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        auctionId = _nextAuctionId++;
        auctions[auctionId] = AuctionData({
            seller:        msg.sender,
            nftContract:   nftContract,
            tokenId:       tokenId,
            startPrice:    startPrice,
            highestBid:    0,
            highestBidder: address(0),
            endTime:       block.timestamp + duration,
            settled:       false,
            cancelled:     false
        });

        emit AuctionCreated(auctionId, nftContract, tokenId, startPrice, block.timestamp + duration);
    }

    function placeBid(
        uint256 auctionId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        AuctionData storage a = auctions[auctionId];

        // CHECKS
        require(!a.settled && !a.cancelled,    "Auction: not active");
        require(block.timestamp < a.endTime,   "Auction: already ended");
        require(msg.sender != a.seller,        "Auction: seller cannot bid");

        if (a.highestBid == 0) {
            // No bids yet — must meet start price
            require(amount >= a.startPrice, "Auction: below start price");
        } else {
            // Subsequent bids must be at least 5% higher
            uint256 minBid = a.highestBid +
                (a.highestBid * MIN_BID_INCREMENT_BPS / 10_000);
            require(amount >= minBid, "Auction: bid too low");
        }

        // EFFECTS — credit previous bidder's refund before pulling new PUFF
        if (a.highestBidder != address(0)) {
            pendingRefunds[auctionId][a.highestBidder] += a.highestBid;
        }

        // INTERACTIONS — pull PUFF from new bidder into contract escrow
        puffToken.transferFrom(msg.sender, address(this), amount);

        // Update auction state
        a.highestBid    = amount;
        a.highestBidder = msg.sender;

        // Anti-snipe: if bid lands in last 10 minutes, extend by 10 minutes
        if (a.endTime - block.timestamp < ANTI_SNIPE_WINDOW) {
            a.endTime += ANTI_SNIPE_EXTENSION;
            emit AuctionExtended(auctionId, a.endTime);
        }

        emit BidPlaced(auctionId, msg.sender, amount);
    }

    // Callable by anyone after endTime — trustless settlement
    function settleAuction(uint256 auctionId) external nonReentrant {
        AuctionData storage a = auctions[auctionId];
        require(!a.settled && !a.cancelled, "Auction: already resolved");
        require(block.timestamp >= a.endTime, "Auction: still live");

        a.settled = true;

        if (a.highestBidder == address(0)) {
            // No bids — return NFT to seller, auction ends empty
            IERC721(a.nftContract).safeTransferFrom(
                address(this), a.seller, a.tokenId
            );
        } else {
            // Calculate splits
            (address royaltyRecipient, uint256 royaltyAmount) =
                IERC2981(a.nftContract).royaltyInfo(a.tokenId, a.highestBid);
            uint256 fee            = (a.highestBid * FEE_BPS) / 10_000;
            uint256 sellerProceeds = a.highestBid - fee - royaltyAmount;

            // Distribute PUFF
            puffToken.transfer(a.seller,          sellerProceeds);
            puffToken.transfer(royaltyRecipient,  royaltyAmount);
            puffToken.transfer(owner(),            fee);

            // Transfer NFT to winner
            IERC721(a.nftContract).safeTransferFrom(
                address(this), a.highestBidder, a.tokenId
            );
        }

        emit AuctionSettled(auctionId, a.highestBidder, a.highestBid);
    }

    // Outbid bidders pull their own PUFF refunds
    function withdrawRefund(uint256 auctionId) external nonReentrant {
        uint256 amount = pendingRefunds[auctionId][msg.sender];
        require(amount > 0, "Auction: nothing to refund");
        pendingRefunds[auctionId][msg.sender] = 0;
        puffToken.transfer(msg.sender, amount);
        emit RefundWithdrawn(auctionId, msg.sender, amount);
    }

    // Cancel only allowed before any bids are placed
    function cancelAuction(uint256 auctionId) external {
        AuctionData storage a = auctions[auctionId];
        require(a.seller == msg.sender,          "Auction: not seller");
        require(a.highestBidder == address(0),   "Auction: bids already placed");
        require(!a.settled,                       "Auction: already settled");
        a.cancelled = true;
        IERC721(a.nftContract).safeTransferFrom(
            address(this), a.seller, a.tokenId
        );
        emit AuctionCancelled(auctionId);
    }

    // Required to receive ERC-721 tokens into this contract
    function onERC721Received(
        address, address, uint256, bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
```

**Three critical Auction design choices explained:**

**1. NFT in escrow from creation.** The moment `createAuction()` is called, `safeTransferFrom(seller, auctionContract, tokenId)` runs. The seller no longer holds the NFT. This is non-negotiable: without escrow, a seller could list on Marketplace and auction simultaneously, or simply transfer the NFT away mid-auction, leaving the winner with PUFF spent and nothing to receive.

**2. Outbid bidders get `pendingRefunds`, not an immediate transfer.** When bidder A is outbid by bidder B, the line `pendingRefunds[auctionId][bidderA] += previousBid` runs. Bidder A's PUFF sits in the contract until they call `withdrawRefund()`. If the code instead called `puffToken.transfer(bidderA, previousBid)` immediately, a malicious bidder A could be a smart contract that reverts on token receipt, causing every future `placeBid()` call to revert too — effectively freezing the auction. Pull payments prevent this.

**3. `settleAuction()` is callable by anyone.** The seller is not required to call it. If they refuse, the winner can call it themselves. If neither calls it, any third party can. This makes settlement trustless — the auction outcome cannot be held hostage by one participant's inaction.

---

### 5.5 Contract Interaction Map

```
USER WALLET
    │
    ├─ calls ──► PuffToken.faucet()
    │              └─ mints PUFF to user
    │
    ├─ calls ──► PuffNFT.mint(address, ipfsURI)
    │              └─ emits Minted + Transfer events
    │
    ├─ calls ──► PuffToken.approve(marketplaceAddr, price)  [or permit()]
    │    then ──► Marketplace.listItem(nft, tokenId, price)
    │    then ──► Marketplace.buyItem(nft, tokenId)
    │                ├─ reads ──► PuffNFT.royaltyInfo(tokenId, price)
    │                ├─ calls ──► PuffToken.transferFrom(buyer, marketplace, price)
    │                └─ calls ──► PuffNFT.safeTransferFrom(seller, buyer, tokenId)
    │
    ├─ calls ──► PuffNFT.setApprovalForAll(auctionAddr, true)
    │    then ──► Auction.createAuction(nft, tokenId, startPrice, duration)
    │                └─ calls ──► PuffNFT.safeTransferFrom(seller, auction, tokenId)
    │
    ├─ calls ──► PuffToken.approve(auctionAddr, bidAmount)
    │    then ──► Auction.placeBid(auctionId, bidAmount)
    │                └─ calls ──► PuffToken.transferFrom(bidder, auction, bidAmount)
    │
    └─ calls ──► Auction.settleAuction(auctionId)
                    ├─ reads ──► PuffNFT.royaltyInfo(tokenId, highestBid)
                    ├─ calls ──► PuffToken.transfer(seller, sellerProceeds)
                    ├─ calls ──► PuffToken.transfer(creator, royaltyAmount)
                    ├─ calls ──► PuffToken.transfer(owner, fee)
                    └─ calls ──► PuffNFT.safeTransferFrom(auction, winner, tokenId)
```

**Important:** Marketplace and Auction never call each other. They both independently call PuffToken and PuffNFT through standard interfaces.

---

### 5.6 Security Patterns Used

| Pattern | Where Applied | What It Prevents |
|---|---|---|
| Checks-Effects-Interactions | `buyItem`, `placeBid`, `settleAuction`, `withdrawProceeds`, `withdrawRefund` | Reentrancy — state is updated before any external call |
| Pull payments | `proceeds[address]`, `pendingRefunds[auctionId][address]` | Blocked withdrawals from malicious recipient contracts |
| `ReentrancyGuard` | All value-moving functions | Belt-and-suspenders reentrancy protection |
| `Pausable` | Marketplace and Auction | Emergency stop in case of discovered vulnerability |
| `Ownable2Step` | All four contracts | Prevents accidental ownership transfer to wrong address |
| NFT escrow | Auction only | Prevents seller from moving NFT mid-auction |
| Approval verification | `listItem` | Catches stale listings where seller removed approval |
| `ownerOf` verification | `buyItem` | Catches stale listings where seller transferred the NFT away |
| Min bid increment | `placeBid` | Prevents spam micro-bids that clog auction |
| Anti-snipe extension | `placeBid` | Prevents last-second sniping that discourages real bidders |
| Trustless settlement | `settleAuction` | Prevents seller from holding outcome hostage by refusing to call settle |

---

### 5.7 Deployment Order

Contracts must be deployed in this order because Marketplace and Auction take PuffToken's address as a constructor argument:

```
Step 1: Deploy PuffToken.sol
          → record: PUFF_TOKEN_ADDRESS

Step 2: Deploy PuffNFT.sol
          → record: NFT_CONTRACT_ADDRESS

Step 3: Deploy Marketplace.sol(PUFF_TOKEN_ADDRESS)
          → record: MARKETPLACE_ADDRESS

Step 4: Deploy Auction.sol(PUFF_TOKEN_ADDRESS)
          → record: AUCTION_ADDRESS

Step 5: Verify all four contracts on Sepolia Etherscan
          → forge verify-contract <address> <ContractName> --chain sepolia
```

After deployment, update the backend `.env` and frontend `.env.local` with all four addresses. The contracts are otherwise fully independent — no post-deployment initialisation calls are needed between them.

---

## 6. NFT Metadata Specification

### 6.1 What Lives Where

| Data | Storage | Written by | Read by |
|---|---|---|---|
| Media file (image/video) | IPFS — permanent, content-addressed | Backend on upload | Frontend via CDN gateway |
| Thumbnail (for video NFTs) | IPFS — permanent | Backend (ffmpeg extract) | Frontend everywhere as preview |
| Metadata JSON | IPFS — permanent | Backend on upload | `tokenURI()`, frontend detail page |
| Current listing price | Postgres — mutable, indexed from chain | Event indexer | Backend API → frontend |
| Current auction bid | Postgres — mutable, indexed from chain | Event indexer | Backend API + Socket.io → frontend |
| Ownership history | Postgres — append-only log of `Transfer` events | Event indexer | Backend API → frontend |
| NFT attributes/properties | IPFS metadata JSON — written once at mint | Backend on upload | Frontend detail page, search filters |

**The principle:** Anything that changes after mint (who owns it, what it costs, bid history) lives in Postgres derived from chain events. Anything immutable (the art, the creator, the original properties) lives on IPFS. The chain enforces ownership; the database makes it fast to query.

---

### 6.2 Metadata JSON Schema

Stored at `ipfs://<metadataCID>/metadata.json`. This is the string returned by `PuffNFT.tokenURI(tokenId)`.

```json
{
  "name": "Sunset Over Mumbai #042",
  "description": "A timelapse of the sun setting over the Arabian Sea, captured from Bandra Fort on June 1st 2026. Part of the Sunsets collection.",

  "image": "ipfs://bafyreib4pff766vhpbxbhjbkxonq2kj/thumbnail.jpg",
  "animation_url": "ipfs://bafyreib4pff766vhpbxbhjbkxonq2kj/video.mp4",

  "attributes": [
    { "trait_type": "Collection",  "value": "Sunsets"    },
    { "trait_type": "Style",       "value": "Timelapse"  },
    { "trait_type": "Location",    "value": "Mumbai"     },
    { "trait_type": "Rarity",      "value": "Rare"       },
    { "trait_type": "File Type",   "value": "video/mp4"  }
  ],

  "properties": {
    "creator":        "0xAbCd1234...",
    "created_at":     "2026-07-01T10:30:00Z",
    "collection":     "Sunsets",
    "media_type":     "video",
    "file_size_kb":   4820,
    "duration_sec":   45,
    "thumbnail_cid":  "bafyreib4pff766vhpbxbhjbkxonq2kjthumbnail",
    "media_cid":      "bafyreib4pff766vhpbxbhjbkxonq2kjmedia",
    "royalty_bps":    500
  }
}
```

**Field-by-field specification:**

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Display title. |
| `description` | Yes | Shown on NFT detail page. |
| `image` | Yes | Must be a static image. For video NFTs, this is the extracted thumbnail. Always `ipfs://` URI, not an HTTP gateway URL. The frontend resolves it to an HTTP URL using the configured gateway. |
| `animation_url` | No | For video/audio NFTs. When present, the frontend renders this as a `<video>` element and uses `image` only as a poster. |
| `attributes` | Yes | Array of `{ "trait_type": string, "value": string\|number }` pairs. These are displayed as the Properties grid on the NFT detail page and used as filter facets on the marketplace grid. |
| `properties.creator` | Yes | The minting wallet address. Injected by the backend — not taken from user input, so it cannot be faked. |
| `properties.created_at` | Yes | ISO 8601 UTC timestamp injected by backend. |
| `properties.media_type` | Yes | `"image"` or `"video"`. Controls which renderer the frontend uses. |
| `properties.royalty_bps` | Yes | Informational. The enforced royalty is in the contract via EIP-2981. This field lets UIs display it without an RPC call. |
| `properties.thumbnail_cid` | No | Allows the frontend to construct the thumbnail URL directly from the CID without fetching the full metadata JSON on the listing grid. |

**What never goes in the metadata JSON:**

- Current price — this is mutable and indexed from chain events into Postgres.
- Current owner — same reason.
- Ownership history — this is a derived view from `Transfer` events.
- Auction bids — entirely off-chain and real-time.

---

### 6.3 Upload Flow Before Minting

The IPFS upload must complete before the mint transaction because the `tokenURI` is passed as a parameter to `PuffNFT.mint()` and stored immutably on-chain.

```
1. User selects file + fills metadata form in browser

2. Browser → POST /api/media/upload (multipart/form-data)
   Fields: file, name, description, attributes (JSON string), collection

3. Backend validates:
   - File type: image/jpeg, image/png, image/gif, video/mp4 only
   - File size: max 50MB
   - Attributes: valid JSON array

4. If video: backend runs ffmpeg to extract a thumbnail still
   $ ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg

5. Backend uploads media file to Pinata IPFS
   → receives mediaCID

6. Backend uploads thumbnail to Pinata IPFS
   → receives thumbnailCID

7. Backend assembles metadata JSON (see schema above)
   - Injects creator address from JWT session (cannot be spoofed)
   - Injects created_at as current server UTC timestamp
   - Injects all CIDs

8. Backend uploads metadata JSON to Pinata IPFS
   → receives metadataCID

9. Backend returns to frontend:
   {
     tokenURI:     "ipfs://<metadataCID>",
     metadataCID,
     mediaCID,
     thumbnailCID,
     mediaType:    "video",
     metadata:     { ...full metadata object }
   }

10. Frontend receives tokenURI

11. User clicks "Mint NFT"
    → wagmi.writeContract({ functionName: 'mint', args: [userAddress, tokenURI] })
    → wallet prompts user to sign and pay gas
    → transaction submitted, TxToast shows "Pending..."

12. Transaction confirmed on-chain
    → PuffNFT emits Minted(creator, tokenId, tokenURI) + Transfer(0x0, creator, tokenId)

13. Frontend calls POST /api/media/confirm-mint with tokenId + all metadata
    → Backend upserts NFT row in Postgres (optimistic write for fast UX)

14. Indexer picks up Minted and Transfer events
    → Also upserts NFT row (idempotent — same data as step 13)

15. NFT appears in user's profile
```

---

## 7. Auction Data Model

### 7.1 On-Chain State

The `AuctionData` struct stored in `Auction.sol`:

```
auctionId      uint256    auto-incremented, starts at 0
seller         address    wallet that created the auction
nftContract    address    the NFT contract address
tokenId        uint256    which token is being auctioned
startPrice     uint256    minimum first bid in PUFF (18 decimal wei)
highestBid     uint256    current winning bid in PUFF; 0 if no bids
highestBidder  address    current winning bidder; address(0) if no bids
endTime        uint256    unix timestamp when bidding closes
settled        bool       true after settleAuction() completes
cancelled      bool       true after cancelAuction() (only before first bid)
```

The `pendingRefunds` mapping:

```
pendingRefunds[auctionId][bidderAddress] = uint256 (PUFF amount claimable)
```

This mapping is populated every time a bidder is outbid. It is cleared when `withdrawRefund()` is called.

---

### 7.2 Off-Chain State

Postgres tables that the event indexer maintains:

**`Auction` table:**

```
id              String    primary key — the on-chain auctionId as string
tokenId         String    foreign key to NFT table
sellerAddress   String
status          Enum      ACTIVE | SETTLED | CANCELLED
highestBid      String    PUFF amount stored as string to avoid JS BigInt loss
highestBidder   String?   null if no bids yet
endTime         DateTime
createdAt       DateTime
settledAt       DateTime? null until settled
settleTxHash    String?   null until settled
```

**`Bid` table:**

```
id              String    auto-generated
auctionId       String    foreign key to Auction
bidderAddress   String
amount          String    PUFF amount as string
txHash          String    transaction hash
blockNumber     Int
timestamp       DateTime
```

**Why amounts are stored as strings:** JavaScript's `number` type is a 64-bit float, which cannot safely represent integers above 2^53. PUFF uses 18 decimal places, so `1000 PUFF` is the integer `1_000_000_000_000_000_000_000` — well beyond the safe integer limit. Storing as a string and parsing with BigInt on the frontend avoids silent data corruption.

---

### 7.3 Lifecycle States

```
                    createAuction()
                         │
                         ▼
                      ACTIVE
                    /         \
          [before           [after
           first bid]        first bid]
               │                  │
        cancelAuction()      endTime passes
               │                  │
           CANCELLED        settleAuction()
                                  │
                    ┌─────────────┴────────────┐
                    │                          │
             [no bids placed]         [bids were placed]
                    │                          │
            NFT returned               NFT → winner
             to seller                 PUFF → seller (net)
                                       PUFF → creator (royalty)
                                       PUFF → marketplace (fee)
```

---

## 8. Backend Layer — Node/Express

### 8.1 Why a Separate Backend

The backend is a separate long-running Node.js process, not Next.js API routes. Two features make this mandatory:

**Event indexer:** Needs a persistent WebSocket connection to the Alchemy RPC to listen for contract events continuously. Vercel serverless functions are stateless and short-lived — they cannot hold an open connection. There is no workaround.

**Socket.io:** A persistent WebSocket server that pushes bid updates to connected browser clients. Also requires a long-lived process. Cannot run in serverless functions.

If the auction and real-time features were removed, Next.js API routes with Prisma would be sufficient. They are not removed, so the split is necessary.

---

### 8.2 Three Jobs in One Process

The backend process (`backend/src/index.ts`) does three things:

**Job 1 — HTTP API server (Express)**

Handles REST requests from the Next.js frontend. Auth verification, NFT search, listing management, auction queries, profile reads and writes. All reads go through Postgres for fast response times.

**Job 2 — Event indexer**

Starts as a background task when the server boots. Connects to Alchemy via WebSocket. Subscribes to all events from all four contracts. Writes normalised rows to Postgres when events arrive. This is the mechanism that keeps the database in sync with on-chain state.

**Job 3 — Socket.io server**

Runs on the same HTTP server as Express (shared port). Clients join rooms named `auction:<auctionId>` and `wallet:<address>`. The event indexer emits to these rooms when relevant events arrive. This is how live bid updates reach the browser without polling.

---

### 8.3 Database Schema — Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String   @id @default(cuid())
  walletAddress  String   @unique
  username       String?
  bio            String?
  avatarUrl      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  nftsOwned      NFT[]       @relation("owner")
  nftsCreated    NFT[]       @relation("creator")
  listings       Listing[]
  auctions       Auction[]
  bids           Bid[]
}

model NFT {
  id              String    @id @default(cuid())
  tokenId         String    @unique
  contractAddress String
  tokenURI        String
  metadataCID     String
  mediaCID        String
  thumbnailCID    String
  mediaType       MediaType
  name            String
  description     String?
  attributes      Json
  properties      Json

  ownerAddress   String
  owner          User      @relation("owner",   fields: [ownerAddress],  references: [walletAddress])
  creatorAddress String
  creator        User      @relation("creator", fields: [creatorAddress], references: [walletAddress])

  mintTxHash     String
  mintedAt       DateTime

  listing        Listing?
  auction        Auction?
  transfers      Transfer[]

  @@index([ownerAddress])
  @@index([creatorAddress])
}

model Listing {
  id            String        @id @default(cuid())
  tokenId       String        @unique
  nft           NFT           @relation(fields: [tokenId], references: [tokenId])
  sellerAddress String
  seller        User          @relation(fields: [sellerAddress], references: [walletAddress])
  price         String
  status        ListingStatus @default(ACTIVE)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  soldAt        DateTime?
  buyerAddress  String?
  txHash        String?

  @@index([sellerAddress])
  @@index([status])
}

model Auction {
  id            String        @id
  tokenId       String        @unique
  nft           NFT           @relation(fields: [tokenId], references: [tokenId])
  sellerAddress String
  seller        User          @relation(fields: [sellerAddress], references: [walletAddress])
  startPrice    String
  highestBid    String        @default("0")
  highestBidder String?
  endTime       DateTime
  status        AuctionStatus @default(ACTIVE)
  createdAt     DateTime      @default(now())
  settledAt     DateTime?
  settleTxHash  String?

  bids          Bid[]

  @@index([status])
  @@index([endTime])
}

model Bid {
  id            String   @id @default(cuid())
  auctionId     String
  auction       Auction  @relation(fields: [auctionId], references: [id])
  bidderAddress String
  bidder        User     @relation(fields: [bidderAddress], references: [walletAddress])
  amount        String
  txHash        String
  blockNumber   Int
  timestamp     DateTime

  @@index([auctionId])
  @@index([bidderAddress])
}

model Transfer {
  id          String   @id @default(cuid())
  tokenId     String
  nft         NFT      @relation(fields: [tokenId], references: [tokenId])
  from        String
  to          String
  txHash      String
  blockNumber Int
  timestamp   DateTime

  @@index([tokenId])
}

enum MediaType     { IMAGE VIDEO }
enum ListingStatus { ACTIVE SOLD CANCELLED }
enum AuctionStatus { ACTIVE SETTLED CANCELLED }
```

---

### 8.4 SIWE Authentication Flow

Sign-In With Ethereum (EIP-4361) is how users prove wallet ownership without a password. The backend verifies wallet ownership cryptographically without ever seeing a private key.

**Step by step:**

```
1. Frontend: user connects wallet via RainbowKit → gets public address

2. Frontend → POST /api/auth/nonce { address }
   Backend: generate random nonce, store in DB with 10-minute expiry
   Backend → { nonce, message: "Sign this to log in...\nNonce: abc123" }

3. Frontend: wallet.signMessage(message) → signature (no gas, no transaction)

4. Frontend → POST /api/auth/verify { message, signature, address }
   Backend:
     a. Parse SIWE message
     b. Verify nonce matches stored nonce and has not expired
     c. Recover signer from signature using viem.verifyMessage()
     d. Confirm recovered address === submitted address
     e. Upsert User row (create if first login)
     f. Invalidate nonce (one-time use)
     g. Sign JWT { walletAddress } with 7-day expiry
   Backend → { token: "eyJ...", user: { walletAddress, username, avatarUrl } }

5. Frontend: store JWT (httpOnly cookie recommended)
   All subsequent API calls include: Authorization: Bearer <token>

6. Backend middleware (auth.ts):
   - Extract JWT from Authorization header
   - Verify signature with JWT_SECRET
   - Attach { walletAddress } to req.user
   - Protected routes reject requests without valid JWT
```

---

### 8.5 Event Indexer

The indexer is the bridge between the blockchain and the database. It is the component that makes the "blockchain is source of truth" principle practical — without it, every page load would require dozens of RPC calls.

**How it starts:**

```typescript
// backend/src/index.ts
import { startIndexer } from './indexer'

// After Express server starts
startIndexer()
```

**What it does:**

```typescript
// backend/src/indexer/index.ts
import { createPublicClient, webSocket } from 'viem'
import { sepolia } from 'viem/chains'
import { prisma } from '../lib/prisma'
import { io } from '../index'

const client = createPublicClient({
  chain: sepolia,
  transport: webSocket(process.env.ALCHEMY_WS_URL),
})

export function startIndexer() {
  watchNFTEvents()
  watchMarketplaceEvents()
  watchAuctionEvents()
}

function watchAuctionEvents() {
  client.watchContractEvent({
    address: AUCTION_ADDRESS,
    abi: auctionAbi,
    eventName: 'BidPlaced',
    onLogs: async (logs) => {
      for (const log of logs) {
        const { auctionId, bidder, amount } = log.args

        // Write bid to database
        await prisma.bid.create({
          data: {
            auctionId:     auctionId.toString(),
            bidderAddress: bidder,
            amount:        amount.toString(),
            txHash:        log.transactionHash,
            blockNumber:   Number(log.blockNumber),
            timestamp:     new Date(),
          }
        })

        // Update auction's current highest bid
        await prisma.auction.update({
          where: { id: auctionId.toString() },
          data:  { highestBid: amount.toString(), highestBidder: bidder }
        })

        // Push real-time update to all clients watching this auction
        io.to(`auction:${auctionId}`).emit('bid:new', {
          auctionId: auctionId.toString(),
          bidder,
          amount:    amount.toString(),
          txHash:    log.transactionHash,
          timestamp: new Date().toISOString(),
        })

        // Notify outbid bidder in their personal room
        // (previous highestBidder — fetched from DB before this update)
        // io.to(`wallet:${previousBidder}`).emit('bid:outbid', { ... })
      }
    }
  })
  // Similar watchers for AuctionCreated, AuctionExtended, AuctionSettled, AuctionCancelled
}
```

**Full list of events indexed:**

| Contract | Event | Database action | Socket.io emission |
|---|---|---|---|
| PuffNFT | `Minted` | Upsert NFT row | — |
| PuffNFT | `Transfer` | Update NFT owner, insert Transfer row | — |
| Marketplace | `Listed` | Upsert Listing row | — |
| Marketplace | `Sale` | Update Listing to SOLD, update NFT owner, insert Transfer | `nft:sold` to seller wallet room |
| Marketplace | `ListingCancelled` | Update Listing to CANCELLED | — |
| Marketplace | `PriceUpdated` | Update Listing price | — |
| Auction | `AuctionCreated` | Insert Auction row | — |
| Auction | `BidPlaced` | Insert Bid row, update Auction highest bid | `bid:new` to auction room |
| Auction | `AuctionExtended` | Update Auction endTime | `auction:extended` to auction room |
| Auction | `AuctionSettled` | Update Auction to SETTLED, update NFT owner, insert Transfer | `auction:settled` + `auction:won` to winner wallet room |
| Auction | `AuctionCancelled` | Update Auction to CANCELLED | — |

---

### 8.6 WebSocket Events

**Room naming convention:**

```
auction:<auctionId>    — clients watching a specific auction page join this room
wallet:<address>       — each logged-in user's personal notification room
```

**Client joins a room:**

```typescript
// Frontend: on auction page mount
socket.emit('join:auction', { auctionId: '7' })

// Frontend: on login
socket.emit('join:wallet', { address: '0xAbCd...' })
```

**Server emits these events:**

| Event | Room | Payload |
|---|---|---|
| `bid:new` | `auction:<id>` | `{ auctionId, bidder, amount, txHash, timestamp }` |
| `auction:extended` | `auction:<id>` | `{ auctionId, newEndTime }` |
| `auction:settled` | `auction:<id>` | `{ auctionId, winner, amount }` |
| `nft:sold` | `wallet:<address>` | `{ tokenId, name, price, buyer }` — sent to seller |
| `bid:outbid` | `wallet:<address>` | `{ auctionId, tokenId, yourBid, newHighBid }` — sent to previous highest bidder |
| `auction:won` | `wallet:<address>` | `{ auctionId, tokenId, name, amount }` — sent to winner |

---

## 9. API Reference

**Base URL:** `http://localhost:4000/api`

**Authentication:** Protected routes require `Authorization: Bearer <jwt>` header. Routes marked 🔒 require authentication.

**Response envelope:**

```json
{
  "success": true,
  "data": { ... }
}
```

or on error:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

**Amount fields** (PUFF values) are always returned as strings representing wei (18-decimal integers). The frontend converts to display units using BigInt.

---

### 9.1 Auth Routes

#### `POST /api/auth/nonce`

Request a nonce for SIWE signing. Call this before asking the user to sign.

**Body:** `{ "address": "0xAbCd..." }`

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "f4a8b2c1d9e3",
    "message": "Sign in to Puff Marketplace\n\nNonce: f4a8b2c1d9e3\nIssued at: 2026-07-01T12:00:00Z"
  }
}
```

---

#### `POST /api/auth/verify`

Verify the SIWE signature and receive a JWT session token.

**Body:**
```json
{
  "message":   "Sign in to Puff Marketplace\n\nNonce: f4a8b2c1d9e3...",
  "signature": "0x4a3b...",
  "address":   "0xAbCd..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user":  { "walletAddress": "0xAbCd...", "username": null, "avatarUrl": null }
  }
}
```

---

### 9.2 Media Routes

#### `POST /api/media/upload` 🔒

Upload media to IPFS and generate the metadata JSON. Call this before minting.

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | Yes | image/jpeg, image/png, image/gif, or video/mp4. Max 50MB. |
| `name` | string | Yes | NFT title |
| `description` | string | No | Long-form description |
| `attributes` | string | No | JSON array of `{ trait_type, value }` objects |
| `collection` | string | No | Collection name |

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenURI":     "ipfs://bafyrei.../metadata.json",
    "metadataCID":  "bafyreiABC...",
    "mediaCID":     "bafyreiDEF...",
    "thumbnailCID": "bafyreiGHI...",
    "mediaType":    "video",
    "metadata":     { ...full metadata object }
  }
}
```

---

#### `POST /api/media/confirm-mint` 🔒

Register the minted NFT in Postgres immediately after the mint transaction confirms. This is an optimistic write — the indexer will also write the same row when it processes the `Minted` event. Using `upsert` on `tokenId` makes both paths safe.

**Body:**
```json
{
  "txHash":       "0x...",
  "tokenId":      "42",
  "tokenURI":     "ipfs://...",
  "metadataCID":  "...",
  "mediaCID":     "...",
  "thumbnailCID": "...",
  "mediaType":    "video",
  "name":         "Sunset Over Mumbai #042",
  "description":  "...",
  "attributes":   [...],
  "properties":   { ... }
}
```

---

### 9.3 NFT Routes

#### `GET /api/nfts`

Browse and search the marketplace.

**Query params:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `q` | string | — | Full-text search across name and description |
| `status` | string | `"all"` | `"listed"`, `"auction"`, `"all"` |
| `mediaType` | string | — | `"image"` or `"video"` |
| `trait` | string | — | `"Rarity:Legendary"` — filter by attribute value |
| `sort` | string | `"newest"` | `"newest"`, `"price_asc"`, `"price_desc"`, `"ending_soon"` |
| `page` | number | 1 | |
| `limit` | number | 20 | Max 100 |

**Response data shape:**
```json
{
  "items": [
    {
      "tokenId":      "42",
      "name":         "Sunset Over Mumbai #042",
      "thumbnailUrl": "https://gateway.pinata.cloud/ipfs/.../thumbnail.jpg",
      "mediaType":    "video",
      "owner":        { "walletAddress": "0x...", "username": "owner.eth" },
      "creator":      { "walletAddress": "0x...", "username": "creator.eth" },
      "listing":      { "price": "1000000000000000000000", "status": "ACTIVE" },
      "auction":      null,
      "attributes":   [...]
    }
  ],
  "total": 143,
  "page":  1,
  "pages": 8
}
```

---

#### `GET /api/nfts/:tokenId`

Full NFT detail with ownership history.

**Response data shape:**
```json
{
  "tokenId":      "42",
  "name":         "...",
  "description":  "...",
  "tokenURI":     "ipfs://...",
  "mediaUrl":     "https://gateway.pinata.cloud/ipfs/.../video.mp4",
  "thumbnailUrl": "https://gateway.pinata.cloud/ipfs/.../thumbnail.jpg",
  "mediaType":    "video",
  "attributes":   [...],
  "properties":   { ... },
  "owner":        { "walletAddress": "0x...", "username": "buyer.eth" },
  "creator":      { "walletAddress": "0x...", "username": "creator.eth" },
  "mintTxHash":   "0x...",
  "mintedAt":     "2026-07-01T10:30:00Z",
  "listing":      { "price": "1000000000000000000000", "status": "ACTIVE" },
  "auction":      null,
  "transferHistory": [
    {
      "from":      "0x0000000000000000000000000000000000000000",
      "to":        "0xcreator...",
      "txHash":    "0x...",
      "timestamp": "2026-07-01T10:30:00Z",
      "event":     "Mint"
    },
    {
      "from":      "0xcreator...",
      "to":        "0xbuyer...",
      "txHash":    "0x...",
      "timestamp": "2026-07-03T14:00:00Z",
      "event":     "Sale",
      "price":     "1000000000000000000000"
    }
  ]
}
```

---

### 9.4 Listing Routes

#### `POST /api/listings` 🔒

Register a new listing after the on-chain `listItem` transaction confirms.

**Body:**
```json
{ "tokenId": "42", "price": "1000000000000000000000", "txHash": "0x..." }
```

---

#### `DELETE /api/listings/:tokenId` 🔒

Cancel a listing after on-chain `cancelListing` confirms.

**Body:** `{ "txHash": "0x..." }`

---

#### `PATCH /api/listings/:tokenId/price` 🔒

Update listing price after on-chain `updatePrice` confirms.

**Body:** `{ "price": "2000000000000000000000", "txHash": "0x..." }`

---

### 9.5 Auction Routes

#### `POST /api/auctions` 🔒

Register a new auction after on-chain `createAuction` confirms.

**Body:**
```json
{
  "auctionId":  "7",
  "tokenId":    "42",
  "startPrice": "500000000000000000000",
  "endTime":    "2026-07-08T12:00:00Z",
  "txHash":     "0x..."
}
```

---

#### `GET /api/auctions/:auctionId`

Full auction detail with live bid history.

**Response data shape:**
```json
{
  "auctionId":     "7",
  "nft":           { "tokenId": "42", "name": "...", "thumbnailUrl": "..." },
  "seller":        { "walletAddress": "0x...", "username": "seller.eth" },
  "startPrice":    "500000000000000000000",
  "highestBid":    "750000000000000000000",
  "highestBidder": { "walletAddress": "0x...", "username": "bidder.eth" },
  "endTime":       "2026-07-08T12:00:00Z",
  "status":        "ACTIVE",
  "bids": [
    {
      "bidderAddress": "0x...",
      "username":      "bidder.eth",
      "amount":        "750000000000000000000",
      "txHash":        "0x...",
      "timestamp":     "2026-07-07T19:30:00Z"
    }
  ]
}
```

---

#### `GET /api/auctions`

List auctions. Supports `?status=ACTIVE&sort=ending_soon`.

---

### 9.6 User Routes

#### `GET /api/users/:address`

Public profile data — no authentication required.

**Response includes:** wallet address, username, bio, avatarUrl, stats (nftsOwned, nftsCreated, totalSales), arrays of owned NFTs, created NFTs, active listings, and active auctions.

---

#### `PATCH /api/users/me` 🔒

Update own profile.

**Body:** `{ "username": "creator.eth", "bio": "...", "avatarUrl": "https://..." }`

---

## 10. Frontend Layer — Next.js

### 10.1 Pages

| Route | Render strategy | Auth required | Description |
|---|---|---|---|
| `/` | SSR + ISR (60s) | No | Marketplace grid — browseable publicly, fast first load |
| `/nft/[tokenId]` | SSR | No | NFT detail, ownership history, buy/list CTAs conditional on auth |
| `/auction/[auctionId]` | SSR + Socket.io client | No | Live auction — real-time bid updates via WebSocket |
| `/profile/[address]` | SSR | No | Public profile — owned and created NFTs |
| `/mint` | CSR | Yes | Upload + metadata form + mint transaction |
| `/list/[tokenId]` | CSR | Yes | Set fixed price or create auction for an owned NFT |

**Why SSR for public pages:** Next.js App Router server components fetch data from the backend API on the server and render HTML. This means the marketplace grid and NFT detail pages are fully indexed by search engines and show content immediately without a client-side loading state. ISR (Incremental Static Regeneration) on the marketplace grid rebuilds the page in the background every 60 seconds, serving stale-while-revalidate for speed.

---

### 10.2 Key Components

```
components/

WalletButton.tsx
  - RainbowKit ConnectButton wrapper
  - After wallet connects, triggers SIWE sign-in automatically
  - Shows shortened address + PUFF balance when connected

NFTCard.tsx
  - Renders thumbnail (or video preview on hover)
  - Shows name, price or current bid, media type badge
  - Links to /nft/[tokenId] or /auction/[auctionId]

NFTGrid.tsx
  - Virtualized grid of NFTCards
  - Filter bar: status, mediaType, sort
  - Calls GET /api/nfts with query params on filter change
  - Infinite scroll or pagination

NFTDetail/
  MediaViewer.tsx       Renders <img> or <video> from CDN gateway URL
  PropertiesGrid.tsx    attributes array as chip grid
  OwnershipHistory.tsx  Transfer history table
  BuyModal.tsx          Two-step: approve PUFF → buyItem. Shows TxToast.
  ListModal.tsx         Two-step: approve NFT → listItem

Auction/
  BidList.tsx           Scrolling bid history feed, updates via Socket.io bid:new
  CountdownTimer.tsx    Live countdown, re-renders every second, updates on auction:extended
  PlaceBidModal.tsx     Two-step: approve PUFF → placeBid
  AuctionStatus.tsx     Current highest bid + bidder display

Mint/
  MediaUpload.tsx       Dropzone for image/video, shows preview, calls /api/media/upload
  MetadataForm.tsx      Name, description, attributes builder (add/remove trait pairs)
  MintButton.tsx        Calls mint() contract function with tokenURI from upload step

shared/
  TxToast.tsx           "Check wallet" → "Pending 0x..." → "Confirmed ✓" toast
  PuffBalance.tsx       useReadContract hook reading PUFF balance, formats from wei
  FaucetButton.tsx      Calls faucet(), shows cooldown timer, highlights new-user bonus
```

---

### 10.3 Wallet Connection Pattern

```typescript
// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const config = createConfig(
  getDefaultConfig({
    appName:   'Puff Marketplace',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
    chains:    [sepolia],
    transports: {
      [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_URL),
    },
  })
)
```

```typescript
// components/WalletButton.tsx
'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSignMessage } from 'wagmi'
import { useEffect } from 'react'
import { api } from '../lib/api'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  useEffect(() => {
    if (isConnected && address) {
      siweLogin(address)
    }
  }, [isConnected, address])

  async function siweLogin(addr: string) {
    const { data } = await api.post('/auth/nonce', { address: addr })
    const signature = await signMessageAsync({ message: data.data.message })
    const { data: authData } = await api.post('/auth/verify', {
      message: data.data.message,
      signature,
      address: addr,
    })
    // Store JWT — use httpOnly cookie via API route or localStorage for simplicity
    localStorage.setItem('puff_token', authData.data.token)
  }

  return <ConnectButton />
}
```

---

### 10.4 Transaction State Pattern

Every on-chain action goes through the same state machine. This is the most important frontend pattern in the codebase — without it, the UI shows nothing while the user waits for block confirmations.

```typescript
// hooks/useContractAction.ts
import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

type TxState = 'idle' | 'signing' | 'pending' | 'confirmed' | 'failed'

export function useContractAction() {
  const [state, setState] = useState<TxState>('idle')
  const [txHash, setTxHash] = useState<string>()
  const { writeContractAsync } = useWriteContract()

  async function execute(contractCall: () => Promise<`0x${string}`>) {
    try {
      setState('signing')            // "Check your wallet..."
      const hash = await contractCall()
      setTxHash(hash)
      setState('pending')            // "Confirming... [Etherscan link]"
      // Wait for receipt
      setState('confirmed')          // "Success ✓"
    } catch (err) {
      setState('failed')             // "Transaction failed. Try again."
    }
  }

  return { execute, state, txHash }
}
```

State-to-UI mapping:

| State | Button label | TxToast content |
|---|---|---|
| `idle` | "Buy for 1,000 PUFF" | hidden |
| `signing` | "Check your wallet..." | "Waiting for signature" |
| `pending` | "Confirming..." | "Transaction submitted → [Etherscan]" |
| `confirmed` | "Purchase complete ✓" | "Success! NFT is now yours." |
| `failed` | "Retry" | "Transaction failed. Check Etherscan." |

---

## 11. End-to-End User Flows

### 11.1 Connect Wallet and Login

```
1. User visits marketplace.
2. Clicks "Connect Wallet" → RainbowKit modal opens.
3. Selects MetaMask → wallet connects → address returned.
4. WalletButton effect triggers siweLogin(address).
5. Frontend: POST /api/auth/nonce → receives message string with nonce.
6. Frontend: wallet.signMessage(message) → wallet prompts user → user signs
   (no gas cost — this is a personal_sign, not a transaction).
7. Frontend: POST /api/auth/verify { message, signature, address }.
8. Backend: verifies signature cryptographically, upserts User row, returns JWT.
9. Frontend: stores JWT. User is now authenticated.
10. Header shows: shortened address + PUFF balance + profile link.
```

---

### 11.2 Claim PUFF from Faucet

```
1. User clicks "Get PUFF" button (visible when PUFF balance is zero or low).
2. Frontend reads PuffToken.hasClaimedBonus(address) — free RPC read.
3. Frontend reads PuffToken.lastFaucetClaim(address) — free RPC read.
4. Displays: "Claim 6,000 PUFF" (first time) or "Claim 1,000 PUFF" (returning).
5. User clicks → wagmi.writeContract PuffToken.faucet().
6. TxState: idle → signing → pending → confirmed.
7. On confirmed: PUFF balance updates via useReadContract refetch.
8. If first claim: contract emits NewUserBonus event.
9. Cooldown timer appears: "Next claim in 23h 59m".
```

---

### 11.3 Mint an NFT

```
1. User navigates to /mint (redirect to login if not authed).
2. Drags media file into dropzone → preview renders.
3. Fills: name, description, attribute traits (key-value pairs).
4. Clicks "Upload to IPFS":
   → POST /api/media/upload (multipart)
   → Backend: validate → upload media → thumbnail → metadata JSON → IPFS
   → Returns tokenURI
5. Frontend shows IPFS preview with "Ready to mint" confirmation.
6. User clicks "Mint NFT":
   → wagmi.writeContract PuffNFT.mint(userAddress, tokenURI)
   → Wallet prompts → user signs → tx submitted
7. TxState machine: signing → pending (shows tx hash link) → confirmed.
8. On confirmed: POST /api/media/confirm-mint with tokenId + metadata.
9. Backend: upsert NFT row in Postgres.
10. Redirect to /nft/[tokenId] — NFT detail page loads immediately.
11. Indexer catches Minted + Transfer events, upserts same row (idempotent).
```

---

### 11.4 List NFT for Fixed Price

```
1. On /nft/[tokenId], owner sees "List for Sale" button (shown only to owner).
2. ListModal opens → user enters price in PUFF (human units, e.g. "1000").
3. Frontend converts to wei: BigInt("1000") * 10n ** 18n.

Step 1 of 2 — Approve:
4. wagmi.writeContract PuffNFT.setApprovalForAll(MARKETPLACE_ADDRESS, true)
   OR PuffNFT.approve(MARKETPLACE_ADDRESS, tokenId)
5. TxState: signing → pending → confirmed. Progress indicator shows "1 of 2".

Step 2 of 2 — List:
6. wagmi.writeContract Marketplace.listItem(NFT_ADDRESS, tokenId, priceInWei)
7. TxState: signing → pending → confirmed. Progress shows "2 of 2 — Listed!".

8. On confirmed: POST /api/listings { tokenId, price, txHash }.
9. Marketplace grid now shows the NFT with "Buy for 1,000 PUFF" badge.
10. Indexer catches Listed event, upserts Listing row (idempotent).
```

---

### 11.5 Buy an NFT

```
1. User sees NFT listed on marketplace grid.
2. Clicks "Buy" → BuyModal opens, shows price + user's PUFF balance.
3. If balance insufficient: FaucetButton shown ("Get PUFF first").
4. User clicks "Buy for 1,000 PUFF".

Step 1 of 2 — Approve PUFF spending:
5. wagmi.writeContract PuffToken.approve(MARKETPLACE_ADDRESS, priceInWei)
   (Or: permit() signature if EIP-2612 flow is implemented — skip this tx entirely)
6. TxState: signing → pending → confirmed. Shows "1 of 2".

Step 2 of 2 — Buy:
7. wagmi.writeContract Marketplace.buyItem(NFT_ADDRESS, tokenId)
8. Contract atomically:
   - Reads royaltyInfo → gets (creator, 50 PUFF)
   - Calculates fee: 25 PUFF
   - Credits proceeds: seller +925, creator +50, owner +25
   - puffToken.transferFrom(buyer → marketplace, 1000 PUFF)
   - PuffNFT.safeTransferFrom(seller → buyer, tokenId)
   - Emits Sale + Transfer events
9. TxState: confirmed. Shows "You now own this NFT!".

10. Indexer catches Sale event:
    - Updates Listing to SOLD
    - Updates NFT owner to buyer
    - Inserts Transfer row
    - Emits nft:sold to seller's wallet room via Socket.io
11. Seller sees notification: "Your NFT sold for 1,000 PUFF. Claim 925 PUFF."
12. Seller calls Marketplace.withdrawProceeds() to claim their PUFF.
```

---

### 11.6 Create an Auction

```
1. On /list/[tokenId], owner selects "Put up for Auction".
2. Form: start price (PUFF) + duration selector (1h / 24h / 3d / 7d).
3. User clicks "Start Auction".

Step 1 of 2 — Approve NFT transfer to Auction contract:
4. wagmi.writeContract PuffNFT.setApprovalForAll(AUCTION_ADDRESS, true)
5. TxState: confirmed. Shows "1 of 2".

Step 2 of 2 — Create auction:
6. wagmi.writeContract Auction.createAuction(NFT_ADDRESS, tokenId, startPrice, duration)
7. Contract: pulls NFT into escrow → writes AuctionData → emits AuctionCreated.
8. TxState: confirmed. Redirect to /auction/[auctionId].

9. Frontend: POST /api/auctions { auctionId, tokenId, startPrice, endTime, txHash }.
10. Auction detail page renders with countdown timer.
11. Indexer catches AuctionCreated event, inserts Auction row (idempotent).
```

---

### 11.7 Place a Bid

```
1. Bidder on /auction/[auctionId] — joins Socket.io room on mount.
2. Sees current highest bid, countdown timer.
3. Clicks "Place Bid" → PlaceBidModal opens.
4. Frontend calculates minimum bid: highestBid * 1.05 (5% increment).
5. User enters bid amount ≥ minimum.

Step 1 of 2 — Approve PUFF:
6. wagmi.writeContract PuffToken.approve(AUCTION_ADDRESS, bidAmountInWei)
7. TxState: confirmed. Shows "1 of 2".

Step 2 of 2 — Place bid:
8. wagmi.writeContract Auction.placeBid(auctionId, bidAmountInWei)
9. Contract:
   - Validates amount ≥ minimum
   - Credits pendingRefunds[auctionId][previousBidder] += previousBid
   - puffToken.transferFrom(newBidder → auction, bidAmount)
   - Updates highestBid + highestBidder
   - Checks anti-snipe: if endTime - now < 10min → endTime += 10min → emits AuctionExtended
   - Emits BidPlaced
10. TxState: confirmed.

11. Indexer catches BidPlaced:
    - Inserts Bid row
    - Updates Auction row
    - io.to('auction:7').emit('bid:new', { ... })
    → All browser clients on this auction page receive the update instantly.
    → BidList component re-renders with new bid at top.

12. If AuctionExtended event also emitted:
    - Indexer updates Auction.endTime in DB
    - io.to('auction:7').emit('auction:extended', { newEndTime })
    → CountdownTimer on all clients resets to new end time.

13. Indexer emits bid:outbid to previous bidder's wallet room.
    → Previous bidder sees toast: "You were outbid. Your 700 PUFF is refundable."
```

---

### 11.8 Settle an Auction

```
1. endTime passes.
2. Auction detail page's "Place Bid" button becomes "Settle Auction" button.
   (Anyone can call this — shown to all users, not just the seller.)
3. User (winner, seller, or anyone) clicks "Settle".
4. wagmi.writeContract Auction.settleAuction(auctionId)
5. Contract:
   - Reads royaltyInfo → (creator, royaltyAmount)
   - Calculates fee
   - puffToken.transfer(seller, sellerProceeds)
   - puffToken.transfer(creator, royaltyAmount)
   - puffToken.transfer(owner, fee)
   - PuffNFT.safeTransferFrom(auction → winner, tokenId)
   - Emits AuctionSettled

6. Indexer catches AuctionSettled:
   - Updates Auction status to SETTLED
   - Updates NFT owner to winner
   - Inserts Transfer row
   - io.to('auction:7').emit('auction:settled', { winner, amount })
   - io.to('wallet:<winner>').emit('auction:won', { ... })

7. Winner sees: "You won! The NFT is now in your wallet."
8. Losing bidders call Auction.withdrawRefund(auctionId) to reclaim their PUFF.
```

---

## 12. Money Flow — PUFF Distribution

### Fixed-price sale of 1,000 PUFF

```
Buyer wallet                   -1,000 PUFF
  ↓
Marketplace contract receives   +1,000 PUFF
  ↓ splits into:
  proceeds[seller]              +925 PUFF   (92.5% — net after fee and royalty)
  proceeds[creator]             +50 PUFF    (5.0%  — EIP-2981 royalty, always enforced)
  proceeds[marketplaceOwner]    +25 PUFF    (2.5%  — marketplace fee)
  ↓
Each party calls withdrawProceeds() separately
```

### Auction settled at 1,000 PUFF highest bid

```
Winner's PUFF was escrowed in contract throughout auction
  ↓
settleAuction() distributes:
  seller receives               925 PUFF    (direct transfer — no pull needed post-settlement)
  creator receives               50 PUFF
  marketplace owner receives     25 PUFF
  ↓
Outbid bidders (A, B, C...) each call withdrawRefund() to reclaim their PUFF
```

### Why proceeds are credited to a mapping in Marketplace but directly transferred in Auction

In `Marketplace.buyItem()`: the proceeds are credited to a mapping and withdrawn separately because there could be many concurrent listings, and using a mapping is gas-efficient for a general escrow system. In `Auction.settleAuction()`: there is exactly one winner and one final payment, so direct transfers are safe and simpler. The refund mapping still uses pull payments for losing bidders.

---

## 13. Environment Variables

### `contracts/.env`

```bash
PRIVATE_KEY="0x..."                          # Deployer wallet private key (testnet only)
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/KEY"
ETHERSCAN_API_KEY="..."                      # For contract verification
```

### `backend/.env`

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/puff_marketplace"

# Chain — use WebSocket URL for event indexer
ALCHEMY_HTTP_URL="https://eth-sepolia.g.alchemy.com/v2/KEY"
ALCHEMY_WS_URL="wss://eth-sepolia.g.alchemy.com/v2/KEY"
CHAIN_ID="11155111"

# Contract addresses — set after deployment
NFT_CONTRACT_ADDRESS="0x..."
MARKETPLACE_CONTRACT_ADDRESS="0x..."
AUCTION_CONTRACT_ADDRESS="0x..."
PUFF_TOKEN_ADDRESS="0x..."

# Auth
JWT_SECRET="minimum-32-character-random-secret"
NONCE_EXPIRY_MINUTES="10"

# IPFS
PINATA_API_KEY="..."
PINATA_API_SECRET="..."
PINATA_JWT="..."
PINATA_GATEWAY="https://gateway.pinata.cloud"

# Server
PORT="4000"
FRONTEND_URL="http://localhost:3000"
```

### `frontend/.env.local`

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_WS_URL="http://localhost:4000"

# Chain
NEXT_PUBLIC_CHAIN_ID="11155111"
NEXT_PUBLIC_ALCHEMY_URL="https://eth-sepolia.g.alchemy.com/v2/KEY"
NEXT_PUBLIC_WALLETCONNECT_ID="..."

# Contract addresses
NEXT_PUBLIC_NFT_ADDRESS="0x..."
NEXT_PUBLIC_MARKETPLACE_ADDRESS="0x..."
NEXT_PUBLIC_AUCTION_ADDRESS="0x..."
NEXT_PUBLIC_PUFF_TOKEN_ADDRESS="0x..."

# Media
NEXT_PUBLIC_IPFS_GATEWAY="https://gateway.pinata.cloud/ipfs"
```

---

## 14. Infrastructure and Deployment

| Layer | Tool | Notes |
|---|---|---|
| Smart contracts | Sepolia testnet | Deployed via `forge script`. All four verified on Sepolia Etherscan. |
| Frontend | Vercel | Native Next.js support. SSR, ISR, edge caching all work out of the box. |
| Backend (Express + indexer + Socket.io) | Railway or Render | Needs a persistent process — not serverless. Free tier sufficient for portfolio. |
| Database | Railway managed Postgres | Or Supabase for free tier with a dashboard. |
| RPC provider | Alchemy | Both HTTP (API calls) and WebSocket (indexer) URLs needed. Free tier sufficient. |
| IPFS pinning | Pinata | Free tier: 1GB storage, sufficient for portfolio. |
| Media CDN | Pinata gateway | `https://gateway.pinata.cloud/ipfs/<CID>` — fronts IPFS for fast media delivery. |

---

## 15. What Is Intentionally Omitted

This is a portfolio project, not a production deployment. The following things are omitted and would be required before this system handled real user funds at scale:

| Omitted | What it would require |
|---|---|
| Smart contract audit | Third-party security review by a firm (e.g. OpenZeppelin, Trail of Bits) or a competitive audit platform (Code4rena, Sherlock). Non-negotiable before mainnet. |
| Multisig admin controls | The `owner()` of all contracts should be a Gnosis Safe multisig, not a single EOA. Currently the deployer EOA is the owner. |
| Upgrade mechanism | Contracts are immutable once deployed. A transparent proxy or UUPS pattern would allow bug fixes, at the cost of added complexity and a new trust assumption. |
| On-chain access control | `AccessControl` roles (PAUSER_ROLE, FEE_MANAGER_ROLE) instead of a single `onlyOwner`. |
| Legal review | NFT marketplaces with real currencies may trigger consumer protection law, securities law (depending on whether PUFF is deemed a security), or money-services business requirements depending on jurisdiction. |
| KYC/AML | Not applicable at testnet. Required for real-money platforms in many jurisdictions. |
| Gas sponsorship | Users need both testnet ETH (for gas) and PUFF (for purchases). Account abstraction (ERC-4337) would allow gas-free UX. |
| Incident response | Who can pause the contracts, how fast, and how users are notified. |
| Reorg handling | The indexer currently processes events as they arrive. A production indexer would wait for N confirmations before treating an event as final. |
| Monitoring | Contract alerts (Tenderly, OpenZeppelin Defender), application monitoring (Sentry, Datadog). |
| Bug bounty | A public bug bounty program (Immunefi) before launching to real users. |

---

*End of document.*

> This document describes the complete system as designed. All contract source is illustrative — full tested implementations are in `/contracts/src/`. All API shapes are definitive — implementations are in `/backend/src/routes/`. This document should be updated whenever a contract function signature, API shape, or architectural decision changes.
