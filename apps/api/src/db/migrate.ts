import { db, client } from './index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Running migrations...');

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='special_status') THEN
        ALTER TABLE events ADD COLUMN special_status VARCHAR(50);
        RAISE NOTICE 'Added special_status column to events';
      END IF;
    END $$;
  `);

  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='status') THEN
        ALTER TABLE events DROP COLUMN status;
        RAISE NOTICE 'Dropped status column from events';
      END IF;
    END $$;
  `);

  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='github_url') THEN
        ALTER TABLE projects DROP COLUMN github_url;
        RAISE NOTICE 'Dropped github_url column from projects';
      END IF;
    END $$;
  `);

  console.log('Migrations completed.');
  await client.end();
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
