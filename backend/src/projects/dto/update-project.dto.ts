import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'My Updated App',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'An updated description for my project',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Project template',
    example: 'blank',
    required: false,
  })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({
    description: 'Project thumbnail URL',
    example: 'https://storage.supabase.co/thumbnails/project-123.png',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  thumbnail_url?: string;

  @ApiProperty({
    description: 'Whether the project is deployed',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deployed?: boolean;

  @ApiProperty({
    description: 'Live deployment URL',
    example: 'https://my-app-a3f9k2.webflowpro.app',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  deployment_url?: string;
}
