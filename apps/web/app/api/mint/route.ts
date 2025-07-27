import { NextRequest, NextResponse } from "next/server";
import { contractService } from "../../../lib/contract";

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json();

    console.log("🔍 Checking eligibility for email:", email);

    // Check if email is eligible (exists in database)
    const isEligible = await contractService.isEmailEligible(email);
    console.log("📊 Email eligible:", isEligible);

    if (!isEligible) {
      console.log("❌ Email not eligible:", email);
      return NextResponse.json(
        { error: "Email not eligible for NFT claim" },
        { status: 403 }
      );
    }

    // Check if email has already been used for minting
    const hasClaimed = await contractService.hasEmailClaimed(email);
    console.log("📊 Email already claimed:", hasClaimed);

    if (hasClaimed) {
      return NextResponse.json(
        { error: "This email has already been used to claim an NFT" },
        { status: 409 }
      );
    }

    // Validate wallet address
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    console.log("✅ Proceeding with mint for email:", email);

    // Mint the NFT
    const txHash = await contractService.mintNFT(walletAddress, 1);

    // Mark email as claimed in database with transaction hash
    await contractService.markEmailAsClaimed(email, walletAddress, txHash);

    return NextResponse.json({
      success: true,
      transactionHash: txHash,
      message: "NFT minted successfully!",
    });
  } catch (error) {
    console.error("Minting error:", error);
    return NextResponse.json(
      { error: "Failed to mint NFT. Please try again." },
      { status: 500 }
    );
  }
}
