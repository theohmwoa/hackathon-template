import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { FilesModule } from './files/files.module';
import { ChatModule } from './chat/chat.module';
import { DeploymentsModule } from './deployments/deployments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    SupabaseModule,
    ProjectsModule,
    FilesModule,
    ChatModule,
    DeploymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
