import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'My Awesome App',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A cutting-edge web application built with React',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Frontend framework',
    enum: ['react', 'vue', 'angular'],
    example: 'react',
    default: 'react',
  })
  @IsString()
  @IsIn(['react', 'vue', 'angular'])
  @IsOptional()
  framework?: string;

  @ApiProperty({
    description: 'Project template',
    example: 'blank',
    default: 'blank',
  })
  @IsString()
  @IsOptional()
  template?: string;
}
