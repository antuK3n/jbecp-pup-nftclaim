#!/usr/bin/env tsx

import { database } from "../lib/database";
import { promises as fs } from "fs";
import path from "path";

async function importJsonEmails() {
  console.log("📧 JSON Email Import Tool");
  console.log("========================\n");

  try {
    // Check if emails.json exists
    const emailsFile = path.join(process.cwd(), "emails.json");

    try {
      const fileContent = await fs.readFile(emailsFile, "utf8");
      const emailsData = JSON.parse(fileContent);

      // Handle both array and object formats
      let emails: string[] = [];

      if (Array.isArray(emailsData)) {
        emails = emailsData;
      } else if (emailsData.emails && Array.isArray(emailsData.emails)) {
        emails = emailsData.emails;
      } else {
        console.log("❌ Invalid JSON format");
        console.log(
          '💡 Use either: ["email@example.com", "another@example.com"]'
        );
        console.log(
          '💡 Or: {"emails": ["email@example.com", "another@example.com"]}'
        );
        return;
      }

      // Filter valid emails
      emails = emails.filter(
        (email) => email && typeof email === "string" && email.includes("@")
      );

      console.log(`📁 Found ${emails.length} emails in emails.json\n`);

      if (emails.length === 0) {
        console.log("❌ No valid emails found in emails.json");
        console.log("💡 Create a emails.json file with your emails");
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
      console.log("❌ emails.json not found or invalid JSON");
      console.log("\n💡 Create a emails.json file with your emails:");
      console.log("   {");
      console.log('     "emails": [');
      console.log('       "email@example.com",');
      console.log('       "another@example.com"');
      console.log("     ]");
      console.log("   }");
      console.log("\n💡 Or use simple array format:");
      console.log("   [");
      console.log('     "email@example.com",');
      console.log('     "another@example.com"');
      console.log("   ]");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    database.close();
  }
}

importJsonEmails();
