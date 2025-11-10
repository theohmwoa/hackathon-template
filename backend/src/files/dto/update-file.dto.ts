import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateFileDto {
  @ApiProperty({
    description: 'Updated file content',
    example: 'export default function Button({ label }: { label: string }) { return <button>{label}</button> }',
  })
  @IsString()
  @IsNotEmpty()
  file_content: string;
}
