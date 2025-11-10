import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Set env vars
process.env.SUPABASE_URL = 'https://dummy.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNjAwMDAwMDAwfQ.dummy';
process.env.SUPABASE_JWT_SECRET = 'dummy-secret-key-at-least-32-characters-long';

async function main() {
  const { NestFactory } = await import('@nestjs/core');
  const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
  const { writeFileSync } = await import('fs');
  const { join } = await import('path');
  
  const { AppModule } = await import('./dist/app.module.js');
  
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  
  const config = new DocumentBuilder()
    .setTitle('WebFlow Pro API')
    .setDescription('WebFlow Pro Backend API - AI-powered web development platform')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token from Supabase',
      in: 'header',
    }, 'JWT-auth')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  console.log('✅ OpenAPI spec generated');
  
  await app.close();
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
