#!/usr/bin/env tsx

import { database } from "../lib/database";
import { promises as fs } from "fs";
import path from "path";

async function importEmails() {
  console.log("📧 Bulk Email Import Tool");
  console.log("========================\n");

  try {
    // Check if emails.txt exists
    const emailsFile = path.join(process.cwd(), "emails.txt");

    try {
      const fileContent = await fs.readFile(emailsFile, "utf8");
      const emails = fileContent
        .split("\n")
        .map((email) => email.trim())
        .filter((email) => email && email.includes("@"));

      console.log(`📁 Found ${emails.length} emails in emails.txt\n`);

      if (emails.length === 0) {
        console.log("❌ No valid emails found in emails.txt");
        console.log("💡 Create a emails.txt file with one email per line");
        return;
      }

      console.log("🔄 Processing emails...\n");

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

      console.log("\n✅ Import completed!");
    } catch (error) {
      console.log("❌ emails.txt not found");
      console.log("\n💡 Create a emails.txt file with your emails:");
      console.log("   touch emails.txt");
      console.log('   echo "email@example.com" >> emails.txt');
      console.log('   echo "another@example.com" >> emails.txt');
      console.log("   # ... add more emails");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    database.close();
  }
}

importEmails();
