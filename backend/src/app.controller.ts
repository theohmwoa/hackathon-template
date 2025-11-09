import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public, CurrentUser } from './auth/decorators';
import { User } from '@supabase/supabase-js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check (public)' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth(): { message: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Detailed health check (public)' })
  @ApiResponse({ status: 200, description: 'Returns detailed health information' })
  getDetailedHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  } {
    return this.appService.getDetailedHealth();
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (protected)' })
  @ApiResponse({ status: 200, description: 'Returns current user information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };
  }
}
