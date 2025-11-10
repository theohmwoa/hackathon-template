import { ApiProperty } from '@nestjs/swagger';

export class ChatMessage {
  @ApiProperty({
    description: 'Unique message identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID this message belongs to',
    example: '987fcdeb-51a2-43f1-b456-789012345678',
  })
  project_id: string;

  @ApiProperty({
    description: 'Message sender role',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Can you help me add a button component?',
  })
  content: string;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;
}
