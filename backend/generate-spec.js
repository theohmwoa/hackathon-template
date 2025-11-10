const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const fs = require('fs');
const path = require('path');

// Set dummy env vars for generation
process.env.SUPABASE_URL = 'https://dummy.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'dummy-key';
process.env.SUPABASE_JWT_SECRET = 'dummy-secret';

async function generateOpenApiSpec() {
  try {
    const { AppModule } = require('./dist/app.module');
    const app = await NestFactory.create(AppModule, { logger: false });

    const config = new DocumentBuilder()
      .setTitle('WebFlow Pro API')
      .setDescription('WebFlow Pro Backend API - AI-powered web development platform')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token from Supabase',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'apikey',
          in: 'header',
          description: 'Supabase API Key',
        },
        'api-key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    const outputPath = path.join(__dirname, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log('✅ OpenAPI spec generated at:', outputPath);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    process.exit(1);
  }
}

generateOpenApiSpec();
