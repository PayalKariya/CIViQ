import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log('Adding target_user_id column to feedback table...');
    await client.execute('ALTER TABLE feedback ADD COLUMN target_user_id INTEGER;');
    console.log('Adding type column to feedback table...');
    await client.execute('ALTER TABLE feedback ADD COLUMN type TEXT;');
    console.log('Successfully updated feedback table schema.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    client.close();
  }
}

main();
