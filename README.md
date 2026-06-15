# PolyAgent

> Privacy-preserving payroll & multisig platform powered by ZK proofs, MetaMask Smart Accounts, and AI.

PolyAgent is a multi-chain payroll system that lets organizations, DAOs, and global teams run payroll **without exposing signer identities**. Transactions appear on-chain as if submitted by a single anonymous relayer. Built for the **MetaMask Smart Accounts Kit × 1Shot API Hackathon** with integrations spanning Venice AI, Web3Auth Embedded Wallets, ERC-7715 Advanced Permissions, and x402 gasless deposits.

---

## The Problem

| Issue | Impact |
|-------|--------|
| **Exposed signer identities** | Multisig approvers are publicly visible on-chain, creating security and privacy risks |
| **Traceable payments** | Recipient addresses and amounts are visible to competitors and on-chain analysts |
| **Gas complexity** | Users need ETH for every deposit — a barrier for non-crypto-native teams |
| **Wallet fragmentation** | Teams juggle multiple wallet extensions, each with different UX and security trade-offs |
| **No intelligent assistance** | Users navigate complex blockchain operations without contextual help |

## Our Solution

| Layer | Solution | Technology |
|-------|----------|------------|
| **Identity Privacy** | ZK proofs hide signer identities; only a relayer appears on-chain | Noir circuits + zkVerify aggregation |
| **Smart Account** | Upgrade EOAs to MetaMask Smart Accounts with advanced capabilities | `@metamask/smart-accounts-kit` |
| **Gasless Deposits** | x402 protocol enables USDC deposits without ETH | EIP-3009 `TransferWithAuthorization` |
| **Delegated Execution** | ERC-7715 permissions allow pre-authorized spending with caveats | ERC-7710 delegation + ERC-7715 permissions |
| **Social Login** | Web3Auth Embedded Wallets for non-custodial social authentication | `@web3auth/modal` (Google, Apple, Email) |
| **AI Assistant** | Venice AI–powered chat for transaction analysis and platform guidance | Venice AI + OpenAI SDK |
| **Multi-Chain** | Deployed on Horizen, Base, and Arbitrum (Stylus Rust/WASM) | Solidity + Arbitrum Stylus |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PolyAgent Frontend                          │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │RainbowKit │  │ Web3Auth │  │  Venice  │  │  Smart Account    │  │
│  │(EOA/MM)   │  │(Social)  │  │  AI Chat │  │  Upgrade Flow     │  │
│  └────┬─────┘  └────┬─────┘  └────┬──────┘  └────────┬──────────┘  │
│       │              │              │                  │            │
│  ┌────▼──────────────▼──────────────▼──────────────────▼──────────┐ │
│  │                     wagmi + viem (EVM layer)                    │ │
│  │          useWalletClient · usePublicClient · useAccount         │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                        Backend (NestJS + Prisma)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Auth   │ │ Account  │ │   Tx     │ │ Notifica- │ │   ZK     │  │
│  │ (JWT+ZK) │ │ Mgmt     │ │  Engine  │ │  tion     │ │  Verify  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                         ┌──────────┐                               │
│                         │PostgreSQL│                               │
│                         └──────────┘                               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                     Blockchain Layer                                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    MetaMultiSigWallet                         │  │
│  │  • ZK proof verification (UltraHonk + zkVerify aggregation)   │  │
│  │  • PoseidonT3 hashing for Noir circuit compatibility          │  │
│  │  • execute() · addSigners() · removeSigners() · batchTransfer │  │
│  └──────────┬──────────┬──────────┬──────────────────────────────┘  │
│             │          │          │                                 │
│     Horizen │    Base  │  Arbitrum│ (Stylus Rust/WASM via proxy)    │
│             │          │          │                                 │
│  ┌──────────▼──────────▼──────────▼──────────────────────────────┐ │
│  │                    zkVerify Contract                           │ │
│  │  On-chain proof aggregation — verifies Merkle proofs against  │ │
│  │  a stored root, proving a signer's commitment is in the set   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Smart Account (ERC-7572)                    │ │
│  │  • MetaMask Hybrid implementation                             │ │
│  │  • ERC-7715 execution permissions                             │ │
│  │  • ERC-7710 delegation scopes with caveats                   │ │
│  │  • Enables gasless x402 via permission grants                 │ │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### `MetaMultiSigWallet.sol`

The core wallet contract deployed on Horizen and Base. Key characteristics:

| Feature | Detail |
|---------|--------|
| **Proving System** | UltraHonk (`keccak256("ultrahonk")`) |
| **ZK Verification** | On-chain via `IVerifyProofAggregation` (zkVerify contract) |
| **Circuit Hash** | PoseidonT3 (compatible with Noir `poseidon2`) |
| **Field Prime** | BN254 (`21888242871839275222246405745257275088548364400416034343698204186575808495617`) |

**Key Functions:**
- `execute(nonce, to, value, data, proofs[])` — Executes a transaction once `proofs.length >= signaturesRequired`. Each ZK proof contains `{ commitment, nullifier, aggregationId, domainId, merklePath, leafCount, index }`. The contract verifies each proof via `_verifyProof()` → `zkVerify.verifyProofAggregation()`, which checks the commitment exists in the signer Merkle tree without revealing which signer approved.
- `addSigners(commitments[], newThreshold)` — Add new signer commitments (onlySelf guard).
- `removeSigners(commitments[], newThreshold)` — Remove signers (onlySelf guard).
- `batchTransfer(recipients[], amounts[])` — Batch native ETH transfers.
- `batchTransferMulti(recipients[], amounts[], tokenAddresses[])` — Batch mixed token transfers.

### `MetaMultiSigWalletStylusFactory.sol`

An EIP-1167 minimal proxy factory for Arbitrum Stylus. The Rust/WASM port of `MetaMultiSigWallet` exceeds the 24KB EVM code-size limit (~29KB compressed). Instead of deploying a full Stylus contract per account:

1. The **Stylus implementation** (~29KB WASM) is deployed **once** via `cargo-stylus`
2. Per-user **EIP-1167 proxies** (~52 bytes EVM bytecode) delegatecall into the impl
3. Each proxy holds independent storage (signers, nonces, nullifiers)

**Custom EIP-1167 variant** includes a 5-byte prefix handling empty-calldata (`receive()` / plain ETH transfers) — required because the Stylus loader fragment reverts on empty calldata.

### Deployment Addresses

| Chain | Network | zkVerify | PoseidonT3 | Stylus Impl | Stylus Factory |
|-------|---------|----------|------------|-------------|----------------|
| 2651420 | Horizen testnet | `0x3098A697...E868C21` | `0x3333...3B93` | — | — |
| 84532 | Base Sepolia | `0x0807C544...A1e8A8` | `0x3333...3B93` | — | — |
| 26514 | Horizen mainnet | `0xCb47A3C3...b2B69` | `0x3333...3B93` | — | — |
| 8453 | Base mainnet | `0xCb47A3C3...b2B69` | `0x3333...3B93` | — | — |
| 421614 | Arbitrum Sepolia | `0xd0074949...F0FDE2` | `0x3333...3B93` | `0x61fddf7c..59f1d1` | `0x73d33f80..15c11a` |
| 42161 | Arbitrum One | `0xCb47A3C3...b2B69` | `0x3333...3B93` | `0x49e772bd..2850f` | `0x740b6a46..e1be` |

All chains share `vkHash = 0xb3c5381523...ae38`.

---

## ZK Privacy & Private Multisig

PolyAgent uses **Noir circuits** compiled to UltraHonk proofs, aggregated on-chain by zkVerify.

### Authentication Flow

```
User Device                          Backend                         Blockchain
──────────                          ───────                         ──────────
   │                                   │                                │
   │── sign("noir-identity") ─────────→│                                │
   │←──── signature ──────────────────│                                │
   │                                   │                                │
   │── derive secret (keccak256 % BN)──│                                │
   │── commitment = poseidon(secret)───│                                │
   │                                   │                                │
   │── login(commitment, proof) ──────→│                                │
   │                          ┌───────┴────────┐                       │
   │                          │ Verify Noir     │                       │
   │                          │ proof off-chain │                       │
   │                          └───────┬────────┘                       │
   │←──── JWT (access+refresh) ──────│                                │
   │                                   │                                │
```

### Transaction Approval

```
Signer A                    Signer B                    Relayer               Chain
─────────                  ──────────                  ───────               ─────
   │                          │                          │                    │
   │── generate ZK proof ───→│                          │                    │
   │   (proves I'm a signer   │                          │                    │
   │    without revealing     │                          │                    │
   │    which one)            │                          │                    │
   │                          │── generate ZK proof ───→│                    │
   │                          │                          │                    │
   │                          │                          │── execute(tx,     │
   │                          │                          │     proofs[2]) ──→│
   │                          │                          │                    │
   │                          │                          │              ┌─────┴────────┐
   │                          │                          │              │ Verify both  │
   │                          │                          │              │ proofs via   │
   │                          │                          │              │ zkVerify     │
   │                          │                          │              └─────┬────────┘
   │                          │                          │←─── success ──────│
   │                          │                          │                    │
```

On-chain, only the relayer's address appears in `tx.from`. Signer identities remain hidden.

---

## MetaMask Smart Account Integration

PolyAgent uses `@metamask/smart-accounts-kit` to upgrade user wallets to MetaMask Smart Accounts (ERC-7572).

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Smart Account Layer                      │
│                                                            │
│  ┌──────────────┐    ┌──────────────────────────────┐    │
│  │   User EOA   │───→│    MetaMask Smart Account    │    │
│  │ (RainbowKit) │    │  (Hybrid Implementation)     │    │
│  │ or Web3Auth) │    │  toMetaMaskSmartAccount()    │    │
│  └──────────────┘    └──────────┬───────────────────┘    │
│                                 │                         │
│                    ┌────────────▼──────────────┐         │
│                    │   ERC-7715 Permissions     │         │
│                    │   Request/Grant/Execute    │         │
│                    └────────────┬──────────────┘         │
│                                 │                         │
│                    ┌────────────▼──────────────┐         │
│                    │   ERC-7710 Delegations     │         │
│                    │   Scope + Caveat Enforcers │         │
│                    └───────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### Implementation

**`services/web3/smartAccount.ts`** — Creates a MetaMask Smart Account from the user's existing EOA:
```typescript
const smartAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [address, [], [], []],
  deploySalt: "0x",
  signer: { walletClient },
});
```

**`hooks/app/useSmartAccount.ts`** — React hook managing:
- `upgradeToSmartAccount()` — Deploys the smart account if not deployed, stores the address
- `getSmartAccount()` — Returns the smart account instance
- Auto-deploys on first use (pays gas once)

**`components/modals/SmartAccountUpgradeModal.tsx`** — Upgrade UI explaining:
- What a Smart Account enables (advanced permissions, delegation)
- The deployment transaction (one-time gas cost)
- Post-upgrade capabilities

### Why Hybrid Implementation?

The `Hybrid` implementation combines EOA and smart account capabilities:
- Transactions can originate from the **EOA directly** (no extra gas) or from the **smart account** (for delegated/permissioned flows)
- ERC-7715 permissions apply at the smart account level
- x402 deposits can be delegated via the smart account without exposing the EOA

---

## Advanced Permissions (ERC-7715)

PolyAgent implements ERC-7715 Advanced Permissions to enable secure, scoped transaction execution.

### Permission Types

| Permission | Description | Use Case |
|-----------|-------------|----------|
| **`erc20-token-periodic`** | Grant permission to spend up to X USDC per period | x402 deposit delegation |
| **`call-token-allowance`** | Grant permission for specific function calls | Relayer execution |
| **Native transfer** | Allow transfers up to a cap | Gas sponsorship |

### Flow

```
User (Smart Account Owner)          Session Account (x402 Facilitator)
─────────────────────────────       ──────────────────────────────────
  │                                                                    │
  │── requestUSDCPeriodicPermission(                                  │
  │     amount, period, token                                        │
  │   )                                                               │
  │                                                                    │
  │   Wallet opens MetaMask → user reviews → signs                    │
  │                                                                    │
  │── permission granted                                              │
  │                                              │                    │
  │                                              │── deposit USDC ───→│
  │                                              │   (within limits)  │
  │                                              │                    │
```

### Implementation

**`services/web3/permissions.ts`** — Permission helpers:
```typescript
const walletClient = createWalletClient({ transport: custom(window.ethereum) })
  .extend(erc7715ProviderActions());

const permissions = await walletClient.requestExecutionPermissions({
  signer: sessionAccount,
  permissions: [{
    type: "erc20-token-periodic",
    data: { token, amount, period },
    required: true,
  }],
});
```

**`hooks/app/useAdvancedPermissions.ts`** — React hook wrapping ERC-7715:
- `requestUSDCx402Permission(token, amount)` — Opens MetaMask permission grant UI
- `getGrantedPermissions()` — Checks already-granted permissions

---

## Venice AI Integration

PolyAgent integrates **Venice AI** (via OpenAI-compatible API at `https://api.venice.ai/api/v1`) for intelligent assistance.

### Features

| Feature | Description |
|---------|-------------|
| **Transaction Analysis** | Analyze transaction data, explain what it does, flag risks |
| **Gas Optimization** | Suggest optimal chains and timing for transfers |
| **Platform Guidance** | Answer questions about using PolyAgent features |
| **ZK Privacy Explainer** | Explain how zero-knowledge proofs protect signer identities |
| **Smart Account Help** | Guide users through upgrade and permission flows |

### Architecture

```
┌──────────┐     POST /api/venice/chat     ┌──────────────┐     OpenAI SDK     ┌───────────┐
│  User    │───────────────────────────────→│  Next.js API  │──────────────────→│ Venice AI │
│  Chat UI │←───────────────────────────────│  Route (SR)  │←──────────────────│ API       │
└──────────┘     { response }              └──────────────┘                   └───────────┘
```

- API key stays **server-side** (never exposed to client)
- Uses `zai-org-glm-5-1` model with system prompt tuned for PolyAgent
- Chat history managed client-side for privacy

### Files

| File | Purpose |
|------|---------|
| `app/api/venice/chat/route.ts` | Server-side API route with lazy client init |
| `services/api/venice.ts` | Service layer (`getAIAssistantResponse`, `analyzeTransaction`) |
| `hooks/app/useVeniceAI.ts` | React hooks (`askAssistant`, `analyzeTx`) |
| `components/AiAssistant/VeniceChat.tsx` | Chat UI component |
| `app/dashboard/ai-assistant/page.tsx` | AI Assistant page |

---

## Web3Auth Embedded Wallet

PolyAgent uses **Web3Auth** (`@web3auth/modal`) to provide non-custodial embedded wallets via social login.

### Login Options

| Method | Type | Wallet Derivation |
|--------|------|-------------------|
| Google | OAuth | Deterministic from social ID |
| Apple | OAuth | Deterministic from social ID |
| Email | Passwordless | Deterministic from email |

### Architecture

```
┌─────────────┐     connect()     ┌───────────────┐     EIP-1193     ┌────────────┐
│  Web3Auth   │──────────────────→│  Web3Auth     │────────────────→│  wagmi     │
│  Modal UI   │                   │  Provider      │                 │  Connector │
│  (social)   │←──────────────────│  (EVM)         │←────────────────│            │
└─────────────┘     Connection    └───────────────┘     accounts     └────────────┘
```

### Implementation

- Provider wired at `ScaffoldEthAppWithProvidersClient` level
- `useWeb3AuthLogin` hook handles login + wagmi connector bridge
- After login, the Web3Auth provider is connected to wagmi so all existing hooks work
- Sapphire Devnet for development, Sapphire Mainnet for production

### Key Derivation Rule

Same wallet address requires: **same Client ID** + **same Sapphire network** + **same auth connection**. Changing any → different address.

---

## x402 Gasless USDC Deposits

PolyAgent implements the **x402 protocol** for gasless USDC deposits using EIP-3009 `TransferWithAuthorization`.

### Flow

```
1. User initiates deposit (amount, multisig address)
2. Frontend checks: is wallet upgraded to Smart Account?
   │
   ├── YES → Grant ERC-7715 permission for x402 facilitator
   │         Sign EIP-3009 authorization (off-chain, no gas)
   │         Submit to facilitator → facilitator submits on-chain
   │
   └── NO  → Offer Smart Account upgrade
             Or proceed with direct deposit
             Sign EIP-3009 authorization (off-chain, no gas)
             Submit to facilitator → facilitator submits on-chain
```

### Implementation

- **`hooks/api/useX402Deposit.ts`** — Mutation hook with `useDelegation` param
- When `useDelegation: true`: routes authorization through smart account address
- When `useDelegation: false`: routes through user's EOA
- Uses `@polypay/shared` EIP-3009 utilities and x402 payload encoding

### Smart Account + x402 Synergy

The Smart Account enables the most powerful x402 flow:
1. User grants **one-time ERC-7715 permission** to the x402 facilitator
2. Permission includes **caveats** (max amount, token, period)
3. Facilitator can deposit on user's behalf **without further signatures**
4. User never needs ETH for deposit gas

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript 5.8, Tailwind CSS 4 + DaisyUI 5 |
| **State** | Zustand 5 (persist middleware), TanStack React Query 5 |
| **Forms** | React Hook Form 7 + Zod 3 |
| **Web3** | wagmi 2, viem 2, RainbowKit 2 |
| **Smart Account** | `@metamask/smart-accounts-kit` (ERC-7572) |
| **Permissions** | ERC-7715 Advanced Permissions, ERC-7710 Delegations |
| **Embedded Wallet** | `@web3auth/modal` v11 (Google, Apple, Email) |
| **AI** | Venice AI (OpenAI-compatible API) |
| **x402** | `x402` + `venice-x402-client` (EIP-3009 gasless deposits) |
| **ZK** | Noir circuits, UltraHonk proofs, zkVerify aggregation |
| **Backend** | NestJS 11, TypeScript 5.7, Prisma 7 (PostgreSQL) |
| **Contracts** | Solidity (Horizen/Base), Arbitrum Stylus Rust/WASM |
| **Real-time** | Socket.io (WebSocket notifications) |

---

## Project Structure

```
polyagent/
├── packages/
│   ├── nextjs/                  # Frontend (Next.js App Router)
│   │   ├── app/
│   │   │   ├── api/venice/chat  # Venice AI server route
│   │   │   └── dashboard/
│   │   │       ├── ai-assistant # AI Assistant page
│   │   │       └── new-account  # Account creation
│   │   ├── components/
│   │   │   ├── AiAssistant/     # VeniceChat UI
│   │   │   ├── modals/
│   │   │   │   ├── SmartAccountUpgradeModal
│   │   │   │   ├── PermissionRequestModal
│   │   │   │   └── DepositModal (x402)
│   │   │   └── Sidebar/         # Navigation + account connect
│   │   ├── hooks/
│   │   │   ├── app/
│   │   │   │   ├── useSmartAccount      # Smart Account lifecycle
│   │   │   │   ├── useAdvancedPermissions # ERC-7715 permissions
│   │   │   │   ├── useVeniceAI           # AI assistant
│   │   │   │   └── useWeb3AuthLogin      # Web3Auth social login
│   │   │   └── api/
│   │   │       └── useX402Deposit        # Gasless deposit
│   │   ├── services/
│   │   │   ├── web3/
│   │   │   │   ├── web3auth.tsx          # Web3Auth provider
│   │   │   │   ├── smartAccount.ts       # Smart Account creation
│   │   │   │   └── permissions.ts        # ERC-7715 helpers
│   │   │   ├── store/
│   │   │   │   └── useSmartAccountStore  # Smart Account state
│   │   │   └── api/
│   │   │       └── venice.ts             # Venice AI service
│   │   └── configs/
│   │       └── routes.config.ts          # Route definitions
│   ├── backend/                 # NestJS backend
│   ├── shared/                  # @polypay/shared (DTOs, types, constants)
│   └── hardhat/                 # Smart contracts
│       └── contracts/
│           ├── MetaMultiSigWallet.sol
│           └── MetaMultiSigWalletStylusFactory.sol
├── docker/                      # Docker Compose
├── usdc-deposit-agent/          # x402 gasless deposit agent
└── docs/                        # Documentation
```

---

## Quick Start

### Prerequisites

- Node.js >= 20.18.3
- Yarn (v3.2.3+)
- Docker & Docker Compose (for PostgreSQL)

### Installation

```bash
# Clone
git clone git@github.com:Poly-pay/polypay_app.git
cd polypay_app

# Install dependencies
yarn install

# Build shared package
yarn workspace @polypay/shared build

# Set up environment
cp packages/nextjs/.env.example packages/nextjs/.env.local
# Edit .env.local:
# - NEXT_PUBLIC_WEB3AUTH_CLIENT_ID (from https://developer.metamask.io)
# - VENICE_API_KEY (from https://venice.ai)
# - NEXT_PUBLIC_FEATURE_X402_DEPOSIT=true
```

### Run (without backend)

```bash
# Start frontend only
yarn workspace @polypay/frontend dev
# Open http://localhost:3000
```

### Run (full stack)

```bash
# Start database
cd docker
docker compose up -d postgres

# Start backend
yarn workspace @polypay/backend start:dev

# Start frontend (separate terminal)
yarn workspace @polypay/frontend dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | Yes | Web3Auth project client ID |
| `VENICE_API_KEY` | Yes | Venice AI API key |
| `NEXT_PUBLIC_API_URL` | No | Backend URL (default: localhost:4000) |
| `NEXT_PUBLIC_NETWORK` | No | `testnet` (default) or `mainnet` |
| `NEXT_PUBLIC_FEATURE_X402_DEPOSIT` | No | Enable x402 gasless deposits |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | No | Alchemy API key (has default) |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | No | WalletConnect project ID (has default) |

---

## Commands

| Command | Description |
|---------|-------------|
| `yarn start:frontend` | Dev server (port 3000) |
| `yarn start:backend` | Backend dev server (port 4000) |
| `yarn build` | Build all packages |
| `yarn lint` | ESLint (frontend + hardhat) |
| `yarn next:check-types` | TypeScript check (frontend) |
| `yarn test` | Hardhat tests |
| `yarn format` | Prettier format all packages |

---

## Hackathon MetaMask Smart Accounts Kit × 1Shot API

This project was built for the **MetaMask Smart Accounts Kit × 1Shot API Hackathon**.

### Primary Track: Best x402 + ERC-7710

The x402 flow combined with ERC-7710 delegation and MetaMask Smart Accounts creates a novel UX:
- **Zero ETH required** for deposits
- **One-time permission grant** replaces repeated signing
- **Caveat-enforced limits** protect user funds

### Overlap Track: Best Venice AI

The Venice AI assistant is the first AI integration for a privacy-preserving multisig platform, providing:
- Real-time transaction analysis
- Contextual guidance for ZK privacy features
- Smart Account upgrade assistance

---

## License

MIT
