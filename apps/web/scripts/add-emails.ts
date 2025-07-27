#!/usr/bin/env tsx

import { database } from "../lib/database";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function addEmails() {
  console.log("📧 Email Database Manager");
  console.log("========================\n");

  try {
    // Get emails from user
    console.log(
      "Enter emails to add (one per line, press Enter twice when done):"
    );

    const emails: string[] = [];

    const askForEmail = () => {
      rl.question("Email: ", (email) => {
        if (email.trim() === "") {
          // User is done entering emails
          processEmails(emails);
        } else {
          emails.push(email.trim());
          askForEmail();
        }
      });
    };

    askForEmail();
  } catch (error) {
    console.error("❌ Error:", error);
    rl.close();
  }
}

async function processEmails(emails: string[]) {
  console.log("\n🔄 Processing emails...\n");

  let added = 0;
  let skipped = 0;

  for (const email of emails) {
    try {
      const hasClaimed = await database.hasEmailClaimed(email);
      if (hasClaimed) {
        console.log(`⏭️  ${email} - Already in database`);
        skipped++;
      } else {
        // Add a placeholder entry (not actually claimed yet)
        await database.markEmailAsClaimed(email, "PENDING", "PENDING");
        console.log(`✅ ${email} - Added to database`);
        added++;
      }
    } catch (error) {
      console.log(`❌ ${email} - Error: ${error}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);

  console.log("\n✅ Done!");
  rl.close();
  database.close();
}

addEmails();
