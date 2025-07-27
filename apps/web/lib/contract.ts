import { ethers } from "ethers";
import { database } from "./database";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

// Contract ABI - just the mint function
const CONTRACT_ABI = [
  "function mint(uint256 eventId, address to) external",
  "function totalEvents() external view returns (uint256)",
  "function getEvent(uint256 eventId) external view returns (tuple(string name, string description, string image, string eventName, string date, bool exists))",
  "event NFTMinted(address indexed to, uint256 indexed tokenId, uint256 indexed eventId)",
];

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor() {
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(PRIVATE_KEY, this.provider);
  }

  async mintNFT(toAddress: string, eventId: number = 1): Promise<string> {
    try {
      if (!CONTRACT_ADDRESS) {
        throw new Error("Contract address not configured");
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.signer
      );

      if (!contract) {
        throw new Error("Failed to create contract instance");
      }

      const tx = await (contract as any).mint(eventId, toAddress);
      if (!tx) {
        throw new Error("Failed to create transaction");
      }

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Failed to get transaction receipt");
      }

      return receipt.hash;
    } catch (error) {
      console.error("Minting failed:", error);
      throw new Error("Failed to mint NFT");
    }
  }

  async getTotalEvents(): Promise<number> {
    try {
      if (!CONTRACT_ADDRESS) {
        return 0;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.provider
      );

      if (!contract) {
        return 0;
      }

      return await (contract as any).totalEvents();
    } catch (error) {
      console.error("Failed to get total events:", error);
      return 0;
    }
  }

  async getEvent(eventId: number) {
    try {
      if (!CONTRACT_ADDRESS) {
        return null;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.provider
      );

      if (!contract) {
        return null;
      }

      return await (contract as any).getEvent(eventId);
    } catch (error) {
      console.error("Failed to get event:", error);
      return null;
    }
  }

  async isEmailEligible(email: string): Promise<boolean> {
    try {
      return await database.isEmailEligible(email);
    } catch (error) {
      console.error("Failed to check email eligibility:", error);
      return false;
    }
  }

  async hasEmailClaimed(email: string): Promise<boolean> {
    try {
      return await database.hasEmailBeenUsedForClaim(email);
    } catch (error) {
      console.error("Failed to check email claim status:", error);
      return false;
    }
  }

  async markEmailAsClaimed(
    email: string,
    walletAddress: string,
    transactionHash?: string
  ): Promise<void> {
    try {
      await database.markEmailAsClaimed(email, walletAddress, transactionHash);
    } catch (error) {
      console.error("Failed to mark email as claimed:", error);
    }
  }
}

export const contractService = new ContractService();
