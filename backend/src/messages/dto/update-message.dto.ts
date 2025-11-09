import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Updated message content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}
