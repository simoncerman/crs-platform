import { db } from "./index";
import { sql } from "drizzle-orm";

async function addDraftStatus() {
  console.log("🔄 Adding 'draft' status to recruitment_submissions...");

  try {
    // Check if draft status already exists in the check constraint
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      DROP CONSTRAINT IF EXISTS recruitment_submissions_status_check
    `);

    // Add new check constraint with draft status
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ADD CONSTRAINT recruitment_submissions_status_check 
      CHECK (status IN ('draft', 'pending', 'reviewed', 'accepted', 'rejected'))
    `);

    console.log("✅ Draft status added successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

addDraftStatus()
  .then(() => {
    console.log("✨ Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
