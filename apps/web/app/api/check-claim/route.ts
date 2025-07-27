import { NextRequest, NextResponse } from "next/server";
import { contractService } from "../../../lib/contract";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const hasClaimed = await contractService.hasEmailClaimed(email);

    return NextResponse.json({
      hasClaimed,
      message: hasClaimed
        ? "This email has already been used to claim an NFT"
        : "Email is eligible for NFT claim",
    });
  } catch (error) {
    console.error("Check claim error:", error);
    return NextResponse.json(
      { error: "Failed to check claim status" },
      { status: 500 }
    );
  }
}
