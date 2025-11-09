#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const OPENAPI_SPEC_PATH = path.join(__dirname, '../../backend/openapi.json');
const OUTPUT_PATH = path.join(__dirname, '../src/@api/types.ts');

console.log('🔧 Generating TypeScript types from OpenAPI spec...\n');

// Check if OpenAPI spec exists
if (!fs.existsSync(OPENAPI_SPEC_PATH)) {
  console.error('❌ Error: OpenAPI spec not found at:', OPENAPI_SPEC_PATH);
  console.error('\nPlease run the following command in the backend folder first:');
  console.error('  npm run generate:openapi\n');
  process.exit(1);
}

console.log('✓ Found OpenAPI spec at:', OPENAPI_SPEC_PATH);

try {
  // Generate TypeScript types using openapi-typescript
  console.log('\n📝 Generating types...');

  const command = `npx openapi-typescript ${OPENAPI_SPEC_PATH} --output ${OUTPUT_PATH}`;
  execSync(command, { stdio: 'inherit' });

  console.log('\n✅ TypeScript types successfully generated at:', OUTPUT_PATH);
  console.log('\nYou can now import types from @api/types in your Angular components:\n');
  console.log('  import { paths, components } from \'@api/types\';');
  console.log('  type User = components[\'schemas\'][\'User\'];');
  console.log('\n');
} catch (error) {
  console.error('\n❌ Error generating types:', error.message);
  process.exit(1);
}
