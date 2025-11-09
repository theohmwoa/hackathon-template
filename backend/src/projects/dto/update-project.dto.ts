import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'My Updated Chat Application',
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'An updated description for my chat app',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
