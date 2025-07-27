import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    baseSepolia: {
      url: "https://1rpc.io/base",
      chainId: 8453,
      accounts: [
        "e3600fa55266b44dc706d58c8b13a770249f7d982168c5eaabc5da062b352804",
      ], // Add your private key here if needed
    },
  },
};

export default config;
