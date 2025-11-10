import { ApiProperty } from '@nestjs/swagger';

export class ProjectFile {
  @ApiProperty({
    description: 'Unique file identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID this file belongs to',
    example: '987fcdeb-51a2-43f1-b456-789012345678',
  })
  project_id: string;

  @ApiProperty({
    description: 'File path within project',
    example: 'src/components/Button.tsx',
  })
  file_path: string;

  @ApiProperty({
    description: 'Complete file content/source code',
    example: 'export default function Button() { return <button>Click me</button> }',
  })
  file_content: string;

  @ApiProperty({
    description: 'File type for syntax highlighting',
    example: 'tsx',
  })
  file_type: string;

  @ApiProperty({
    description: 'File creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'File last modification timestamp',
    example: '2024-01-15T14:20:00Z',
  })
  updated_at: Date;
}
