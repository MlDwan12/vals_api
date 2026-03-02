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
} from 'class-validator';

export class CreateCaseDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serviceId: number;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  industry: string[];

  @IsString()
  @MaxLength(255)
  title: string;

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
