import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Can you help me add a button component?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
