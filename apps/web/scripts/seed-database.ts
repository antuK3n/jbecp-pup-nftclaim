#!/usr/bin/env tsx

import { database } from "../lib/database";

async function checkDatabaseStatus() {
  console.log("🔍 Checking database status...");
  console.log("========================\n");

  try {
    // Get all claimed emails from database
    const claimedEmails = await database.getClaimedEmails();

    if (claimedEmails.length === 0) {
      console.log("📭 No emails found in database");
      console.log("💡 Use one of these commands to add emails:");
      console.log("   yarn db:add - Interactive email addition");
      console.log("   yarn db:import-json - Import from emails.json");
    } else {
      console.log(`📧 Found ${claimedEmails.length} emails in database:\n`);

      claimedEmails.forEach((email, index) => {
        const status =
          email.wallet_address === "PENDING" ? "⏳ Pending" : "✅ Claimed";
        console.log(`${index + 1}. ${email.email} - ${status}`);
      });
    }

    console.log("\n✅ Database status check completed!");
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    database.close();
  }
}

checkDatabaseStatus();
