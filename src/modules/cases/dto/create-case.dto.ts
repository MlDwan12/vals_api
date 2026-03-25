import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsOptional,
  IsObject,
  ArrayMaxSize,
  IsArray,
  MaxLength,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'ID услуг, к которым привязан кейс',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  serviceIds: number[];

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  industry: string[];

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(255)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  problem: string;

  @IsString()
  result: string;

  @IsOptional()
  content?: Record<string, unknown>;

  @IsOptional()
  contentHtml?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  keywords?: string;
}
