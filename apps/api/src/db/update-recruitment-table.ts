import { db } from "./index";
import { sql } from "drizzle-orm";

async function updateRecruitmentTable() {
  console.log("🔄 Updating recruitment_submissions table...");

  try {
    // Add interests column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ADD COLUMN IF NOT EXISTS interests TEXT
    `);

    // Add motivation column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ADD COLUMN IF NOT EXISTS motivation TEXT
    `);

    // Rename cv_url to resume_url if cv_url exists
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'recruitment_submissions' 
                   AND column_name = 'cv_url') THEN
          ALTER TABLE recruitment_submissions RENAME COLUMN cv_url TO resume_url;
        END IF;
      END $$;
    `);

    // Change skills from JSONB to TEXT if it's JSONB
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'recruitment_submissions' 
                   AND column_name = 'skills'
                   AND data_type = 'jsonb') THEN
          ALTER TABLE recruitment_submissions 
          ALTER COLUMN skills TYPE TEXT USING skills::text;
        END IF;
      END $$;
    `);

    // Make education NOT NULL (set default for existing rows)
    await db.execute(sql`
      UPDATE recruitment_submissions SET education = 'Neuvedeno' WHERE education IS NULL
    `);
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ALTER COLUMN education SET NOT NULL
    `);

    // Make interests NOT NULL (set default for existing rows)
    await db.execute(sql`
      UPDATE recruitment_submissions SET interests = 'Neuvedeno' WHERE interests IS NULL
    `);
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ALTER COLUMN interests SET NOT NULL
    `);

    // Make motivation NOT NULL (set default for existing rows)
    await db.execute(sql`
      UPDATE recruitment_submissions SET motivation = 'Neuvedeno' WHERE motivation IS NULL
    `);
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ALTER COLUMN motivation SET NOT NULL
    `);

    // Change availability from VARCHAR to TEXT
    await db.execute(sql`
      ALTER TABLE recruitment_submissions 
      ALTER COLUMN availability TYPE TEXT
    `);

    console.log("✅ Recruitment submissions table updated successfully!");
  } catch (error) {
    console.error("❌ Error updating table:", error);
    throw error;
  }
}

updateRecruitmentTable()
  .then(() => {
    console.log("✨ Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
