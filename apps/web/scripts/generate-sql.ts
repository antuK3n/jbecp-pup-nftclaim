#!/usr/bin/env tsx

import { promises as fs } from "fs";
import path from "path";

async function generateSQL() {
  console.log("📧 Generating SQL from emails.json...");
  console.log("================================\n");

  try {
    const emailsFile = path.join(process.cwd(), "emails.json");
    const fileContent = await fs.readFile(emailsFile, "utf8");
    const emailsData = JSON.parse(fileContent);

    let emails: string[] = [];

    if (Array.isArray(emailsData)) {
      emails = emailsData;
    } else if (emailsData.emails && Array.isArray(emailsData.emails)) {
      emails = emailsData.emails;
    } else {
      console.log("❌ Invalid JSON format");
      return;
    }

    emails = emails.filter(
      (email) => email && typeof email === "string" && email.includes("@")
    );

    console.log(`📁 Found ${emails.length} emails in emails.json\n`);

    if (emails.length === 0) {
      console.log("❌ No valid emails found");
      return;
    }

    // Generate SQL
    const sqlValues = emails
      .map((email) => `('${email}', 'PENDING', 'PENDING')`)
      .join(",\n");

    const sql = `INSERT INTO claimed_emails (email, wallet_address, transaction_hash) VALUES\n${sqlValues};`;

    console.log("📋 Copy this SQL and paste it in Supabase SQL Editor:\n");
    console.log("=".repeat(50));
    console.log(sql);
    console.log("=".repeat(50));
    console.log("\n✅ SQL generated! Copy and paste it in Supabase.");
  } catch (error) {
    console.log("❌ emails.json not found or invalid JSON");
    console.log("\n💡 Make sure emails.json exists in the project root");
  }
}

generateSQL();
