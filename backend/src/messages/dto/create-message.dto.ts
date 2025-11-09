import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can I build a chat app?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
