import { ApiProperty } from '@nestjs/swagger';

export class Message {
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
    description: 'User ID of the message owner',
    example: '456fcdeb-51a2-43f1-b456-789012345678',
  })
  user_id: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can I build a chat app?',
  })
  content: string;

  @ApiProperty({
    description: 'Role of the message sender',
    example: 'user',
    enum: ['user', 'assistant'],
  })
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2025-11-09T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-09T14:20:00Z',
  })
  updated_at: Date;
}
