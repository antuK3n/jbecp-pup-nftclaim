import sqlite3 from "sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "claimed-emails.db");

// Ensure data directory exists
import { promises as fs } from "fs";
const dataDir = path.join(process.cwd(), "data");
fs.mkdir(dataDir, { recursive: true }).catch(console.error);

interface ClaimedEmail {
  id: number;
  email: string;
  wallet_address: string;
  transaction_hash: string | null;
  claimed_at: string;
}

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Error opening database:", err);
      } else {
        console.log("Connected to SQLite database");
        this.initTable();
      }
    });
  }

  private initTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS claimed_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        wallet_address TEXT NOT NULL,
        transaction_hash TEXT,
        claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Claimed emails table ready");
      }
    });
  }

  async hasEmailClaimed(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT COUNT(*) as count FROM claimed_emails WHERE email = ?";
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          console.error("Error checking email:", err);
          reject(err);
        } else {
          resolve(row ? (row as any).count > 0 : false);
        }
      });
    });
  }

  async isEmailEligible(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql =
        "SELECT COUNT(*) as count FROM claimed_emails WHERE email = ?";
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          console.error("Error checking email eligibility:", err);
          reject(err);
        } else {
          resolve(row ? (row as any).count > 0 : false);
        }
      });
    });
  }

  async hasEmailBeenUsedForClaim(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT wallet_address FROM claimed_emails WHERE email = ?";
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          console.error("Error checking if email was used for claim:", err);
          reject(err);
        } else {
          // If wallet_address is not 'PENDING', it means the email was used for an actual claim
          resolve(row ? (row as any).wallet_address !== "PENDING" : false);
        }
      });
    });
  }

  async markEmailAsClaimed(
    email: string,
    walletAddress: string,
    transactionHash?: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO claimed_emails (email, wallet_address, transaction_hash) VALUES (?, ?, ?)";
      this.db.run(
        sql,
        [email, walletAddress, transactionHash || null],
        (err) => {
          if (err) {
            console.error("Error marking email as claimed:", err);
            reject(err);
          } else {
            console.log(`Email ${email} marked as claimed`);
            resolve();
          }
        }
      );
    });
  }

  async getClaimedEmails(): Promise<ClaimedEmail[]> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM claimed_emails ORDER BY claimed_at DESC";
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          console.error("Error getting claimed emails:", err);
          reject(err);
        } else {
          resolve(rows as ClaimedEmail[]);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database:", err);
      } else {
        console.log("Database connection closed");
      }
    });
  }
}

export const database = new Database();
