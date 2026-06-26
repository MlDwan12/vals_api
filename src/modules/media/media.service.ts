import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { GetMediaDto } from './dto/get-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AdminPaginatedResponse } from 'src/core/crud/interfaces/pagination.interface';

@Injectable()
export class MediaService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'media');

  constructor(
    @InjectRepository(Media) private readonly repo: Repository<Media>,
  ) {}

  async getMedia(dto: GetMediaDto): Promise<AdminPaginatedResponse<Media>> {
    const { page, limit, search } = dto;

    const qb = this.repo
      .createQueryBuilder('media')
      .orderBy('media.createdAt', 'DESC')
      .addOrderBy('media.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.where('media.name ILIKE :search', { search: `%${search}%` });
    }

    const [items, total] = await qb.getManyAndCount();

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async upload(
    files: Express.Multer.File[],
    dto: UploadMediaDto,
  ): Promise<{ success: boolean }> {
    if (dto.alt && dto.alt.length > files.length) {
      throw new BadRequestException(
        'Количество alt не должно превышать количество файлов',
      );
    }

    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }

    const savedFiles: string[] = [];

    try {
      const records: Partial<Media>[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(originalName).toLowerCase();

        if (file.mimetype !== 'image/webp' || ext !== '.webp') {
          throw new BadRequestException(
            `Файл "${originalName}" имеет недопустимый формат`,
          );
        }

        const fileName = `${randomUUID()}.webp`;
        const filePath = path.join(this.uploadPath, fileName);

        await fs.promises.writeFile(filePath, file.buffer);
        savedFiles.push(filePath);

        const baseName = path.parse(originalName).name;
        records.push({ name: baseName, fileName, alt: dto.alt?.[i]?.trim() || null });
      }

      await this.repo.save(this.repo.create(records));

      return { success: true };
    } catch (error) {
      for (const filePath of savedFiles) {
        try {
          await fs.promises.unlink(filePath);
        } catch {}
      }

      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException('Не удалось загрузить изображения');
    }
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const media = await this.repo.findOne({ where: { id } });

    if (!media) {
      throw new NotFoundException('Картинка не найдена');
    }

    await this.repo.delete(id);

    try {
      await fs.promises.unlink(path.join(this.uploadPath, media.fileName));
    } catch {}

    return { success: true };
  }
}
