import { Pool } from "pg";

interface ClaimedEmail {
  id: number;
  email: string;
  wallet_address: string;
  transaction_hash: string | null;
  claimed_at: string;
}

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    // this.initTable();
  }

  // private async initTable() {
  //   try {
  //     const createTableSQL = `
  //       CREATE TABLE IF NOT EXISTS claimed_emails (
  //         id SERIAL PRIMARY KEY,
  //         email VARCHAR(255) UNIQUE NOT NULL,
  //         wallet_address VARCHAR(255) NOT NULL,
  //         transaction_hash VARCHAR(255),
  //         claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //       )
  //     `;

  //     await this.pool.query(createTableSQL);
  //     console.log("Claimed emails table ready");
  //   } catch (error) {
  //     console.error("Error creating table:", error);
  //   }
  // }

  async hasEmailClaimed(email: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) as count FROM claimed_emails WHERE email = $1",
        [email]
      );
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }

  async isEmailEligible(email: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT COUNT(*) as count FROM claimed_emails WHERE email = $1",
        [email]
      );
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error("Error checking email eligibility:", error);
      return false;
    }
  }

  async hasEmailBeenUsedForClaim(email: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        "SELECT wallet_address FROM claimed_emails WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return false;
      }

      // If wallet_address is not 'PENDING', it means the email was used for an actual claim
      return result.rows[0].wallet_address !== "PENDING";
    } catch (error) {
      console.error("Error checking if email was used for claim:", error);
      return false;
    }
  }

  async markEmailAsClaimed(
    email: string,
    walletAddress: string,
    transactionHash?: string
  ): Promise<void> {
    try {
      await this.pool.query(
        "UPDATE claimed_emails SET wallet_address = $2, transaction_hash = $3 WHERE email = $1",
        [email, walletAddress, transactionHash || null]
      );
    } catch (err) {
      console.error("Error marking email as claimed:", err);
      throw err;
    }
  }

  async getClaimedEmails(): Promise<ClaimedEmail[]> {
    try {
      const result = await this.pool.query(
        "SELECT * FROM claimed_emails ORDER BY claimed_at DESC"
      );
      return result.rows as ClaimedEmail[];
    } catch (error) {
      console.error("Error getting claimed emails:", error);
      return [];
    }
  }

  async close() {
    await this.pool.end();
    console.log("Database connection closed");
  }
}

export const database = new Database();
