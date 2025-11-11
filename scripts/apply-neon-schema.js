#!/usr/bin/env node

/**
 * Apply Neon Database Schema
 * This script applies the database schema to the Neon PostgreSQL database
 */

const { Client } = require('../backend/node_modules/pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_kZbSUD1M0svX@ep-twilight-math-abv4js38-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require';

async function applySchema() {
  console.log('🚀 Applying Neon Database Schema...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    // Connect to database
    console.log('📡 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'neon-schema.sql');
    console.log('📖 Reading schema file:', schemaPath);
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Apply schema
    console.log('📝 Applying schema to database...\n');
    await client.query(schema);

    console.log('\n✅ Schema applied successfully!');
    console.log('🎉 Database is ready to use\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nCreated tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check auth schema
    const authResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'auth'
      ORDER BY table_name;
    `);

    if (authResult.rows.length > 0) {
      console.log('\nAuth tables:');
      authResult.rows.forEach(row => {
        console.log(`  ✓ auth.${row.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
applySchema();
