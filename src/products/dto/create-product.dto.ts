// src/products/dto/create-product.dto.ts
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number) // แปลงจาก form-data (string) เป็น number
    price: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })//ตรวจสอบว่า “ทุกตัว” ใน array ต้องเป็น string
    colors?: string[];
}
