import { ApiProperty } from '@nestjs/swagger';

export class Project {
  @ApiProperty({
    description: 'Unique project identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID of the project owner',
    example: '987fcdeb-51a2-43f1-b456-789012345678',
  })
  user_id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'My Awesome App',
  })
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A cutting-edge web application',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Frontend framework',
    example: 'react',
  })
  framework: string;

  @ApiProperty({
    description: 'Project template',
    example: 'blank',
  })
  template: string;

  @ApiProperty({
    description: 'Project thumbnail URL',
    example: 'https://storage.supabase.co/thumbnails/project-123.png',
    required: false,
  })
  thumbnail_url?: string;

  @ApiProperty({
    description: 'Deployment status',
    example: false,
  })
  is_deployed: boolean;

  @ApiProperty({
    description: 'Live deployment URL',
    example: 'https://my-app-a3f9k2.webflowpro.app',
    required: false,
  })
  deployment_url?: string;

  @ApiProperty({
    description: 'Last time project was opened',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  last_opened_at?: Date;

  @ApiProperty({
    description: 'Project creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T14:20:00Z',
  })
  updated_at: Date;
}
