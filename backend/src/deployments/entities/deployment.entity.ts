import { ApiProperty } from '@nestjs/swagger';

export class Deployment {
  @ApiProperty({
    description: 'Unique deployment identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID being deployed',
    example: '987fcdeb-51a2-43f1-b456-789012345678',
  })
  project_id: string;

  @ApiProperty({
    description: 'Deployment lifecycle status',
    enum: ['pending', 'building', 'deploying', 'success', 'failed'],
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Live deployment URL',
    example: 'https://my-app-a3f9k2.webflowpro.app',
    required: false,
  })
  deployment_url?: string;

  @ApiProperty({
    description: 'Build/deployment logs',
    example: 'Installing dependencies...\n✓ Dependencies installed',
    required: false,
  })
  build_log?: string;

  @ApiProperty({
    description: 'Deployment creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last status update timestamp',
    example: '2024-01-15T10:35:00Z',
  })
  updated_at: Date;
}
