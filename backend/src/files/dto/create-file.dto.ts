import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    description: 'File path within project',
    example: 'src/components/Button.tsx',
  })
  @IsString()
  @IsNotEmpty()
  file_path: string;

  @ApiProperty({
    description: 'Complete file content/source code',
    example: 'export default function Button() { return <button>Click me</button> }',
  })
  @IsString()
  @IsNotEmpty()
  file_content: string;

  @ApiProperty({
    description: 'File type for syntax highlighting',
    enum: ['tsx', 'css', 'html', 'json'],
    example: 'tsx',
  })
  @IsString()
  @IsIn(['tsx', 'css', 'html', 'json'])
  @IsNotEmpty()
  file_type: string;
}
