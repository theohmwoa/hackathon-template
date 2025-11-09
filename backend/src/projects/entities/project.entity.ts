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
    example: 'My Chat Application',
  })
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A Lovable-style chat app with AI assistant',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Project creation timestamp',
    example: '2025-11-09T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-09T14:20:00Z',
  })
  updated_at: Date;
}
