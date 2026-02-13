// src/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './/dto/create-product.dto';
import { UpdateProductDto } from './/dto/update-product.dto';
import { Product } from './/entities/product.entity';
import { safeUnlinkByRelativePath } from '..//common/utils/file.utils';
import type { Express } from 'express';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  /* ================= UTILS ================= */
  private toPublicImagePath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/'); // กัน Windows path
    return normalized
      .replace(/^\.?\/?uploads\//, '')
      .replace(/^uploads\//, '');
  }

  /* ================= CREATE ================= */
  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    const diskPath = file?.path?.replace(/\\/g, '/');
    const imageUrl = diskPath
      ? this.toPublicImagePath(diskPath)
      : undefined;

    try {
      return await this.productModel.create({
        ...dto,
        ...(imageUrl ? { imageUrl } : {}),
      });
    } catch (err) {
      if (diskPath) await safeUnlinkByRelativePath(diskPath);
      throw new InternalServerErrorException('Create product failed');
    }
  }

  /* ================= READ ALL ================= */
  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  /* ================= READ ONE ================= */
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  /* ================= UPDATE (รองรับแก้ไขรูป) ================= */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      if (file?.path) {
        await safeUnlinkByRelativePath(file.path);
      }
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    let newImageUrl: string | undefined;
    //รูปสินค้า
    // ถ้ามีการอัปโหลดรูปใหม่
    if (file?.path) {
      const diskPath = file.path.replace(/\\/g, '/');
      newImageUrl = this.toPublicImagePath(diskPath);

      // ลบรูปเก่า
      if (product.imageUrl) {
        await safeUnlinkByRelativePath(`uploads/${product.imageUrl}`);
      }
    }
    // อัปเดตข้อมูลสินค้า
    try {
      product.name = updateProductDto.name ?? product.name;
      product.price = updateProductDto.price ?? product.price;
      product.description =
        updateProductDto.description ?? product.description;
      product.colors = updateProductDto.colors ?? product.colors;

      if (newImageUrl) {
        product.imageUrl = newImageUrl;
      }

      return await product.save();
    } catch (err) {
      if (file?.path) {
        await safeUnlinkByRelativePath(file.path);
      }
      throw new InternalServerErrorException('Update product failed');
    }
  }

  /* ================= DELETE ================= */
  async remove(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // ลบรูปตอนลบสินค้า
    if (deletedProduct.imageUrl) {
      await safeUnlinkByRelativePath(`uploads/${deletedProduct.imageUrl}`);
    }

    return deletedProduct;
  }

  /* ================= SEARCH ================= */
  async search(query: {
    keyword?: string;
    minPrice?: number;
    maxPrice?: number;
    sortPrice?: 'asc' | 'desc';
  }): Promise<Product[]> {
    const filter: any = {};

    if (query.keyword) {
      filter.name = {
        $regex: query.keyword,
        $options: 'i',
      };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) {
        filter.price.$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        filter.price.$lte = query.maxPrice;
      }
    }

    const sortOption: { price: 1 | -1 } =
      query.sortPrice === 'desc'
        ? { price: -1 }
        : { price: 1 };

    return this.productModel.find(filter).sort(sortOption).exec();
  }
}
