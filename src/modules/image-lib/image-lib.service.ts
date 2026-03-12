import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateImageLibDto } from './dto/create-image-lib.dto';
import { UpdateImageLibDto } from './dto/update-image-lib.dto';
import { ImageLib } from './entities/image-lib.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { BaseCrudRepository } from 'src/core/crud/base.repository';
import { QueryFailedError, Repository } from 'typeorm';
import { ImageLibRepository } from './image-lib.repository';
import { BaseCrudService } from 'src/core/crud/base.service';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { relative, join, resolve, sep } from 'path';
import { getUploadsRootAbs } from './image-lib-path.util';

type PgQueryFailed = {
  code?: string;
  constraint?: string;
};

@Injectable()
export class ImageLibService extends BaseCrudService<
  ImageLib,
  CreateImageLibDto,
  UpdateImageLibDto
> {
  protected repository: BaseCrudRepository<ImageLib>;
  constructor(
    @InjectRepository(ImageLib) private readonly repo: Repository<ImageLib>,
    protected readonly logger: PinoLogger,
  ) {
    super(logger);
    this.repository = new ImageLibRepository(this.repo);
  }

  async createManyFromUploadedFiles(
    files: Express.Multer.File[],
  ): Promise<ImageLib[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const rows: Array<Partial<ImageLib>> = files.map((file, index) =>
      this.mapFileToEntity(file, index),
    );

    try {
      return await this.repository.createMany(rows, 100);
    } catch (err: unknown) {
      await this.safeDeleteUploadedFiles(files);

      if (err instanceof QueryFailedError) {
        const pg = err as PgQueryFailed;

        if (pg.code === '23505') {
          throw new ConflictException(
            this.buildUniqueConflictMessage(pg.constraint),
          );
        }
      }

      this.logger.error({ err }, 'ImageLib upload: db save failed');
      throw new InternalServerErrorException('Failed to save uploaded images');
    }
  }

  async removeWithFile(id: number): Promise<void> {
    const entity = await this.findById(id);

    await this.remove(id);

    if (!entity.link) {
      return;
    }

    const absFilePath = this.safeResolveUploadPath(entity.link);

    try {
      await unlink(absFilePath);
    } catch (err: unknown) {
      this.logger.warn(
        {
          err,
          id,
          link: entity.link,
          absFilePath,
        },
        'Failed to delete local file for ImageLib',
      );
    }
  }

  private mapFileToEntity(
    file: Express.Multer.File,
    index: number,
  ): Partial<ImageLib> {
    const relPath = relative(
      process.cwd(),
      join(file.destination, file.filename),
    ).replaceAll('\\', '/');

    const link = `/${relPath}`;
    const base = this.stripExt(file.originalname);
    const safeBase = this.sanitizeName(base);
    const suffix = randomUUID().slice(0, 8);
    const name = this.cutToMax(`${safeBase}-${index + 1}-${suffix}`, 255);

    return {
      link,
      name,
    };
  }

  private async safeDeleteUploadedFiles(
    files: Express.Multer.File[],
  ): Promise<void> {
    await Promise.all(
      files.map(async (file) => {
        try {
          await unlink(join(file.destination, file.filename));
        } catch (err: unknown) {
          this.logger.warn(
            { err, filename: file.filename },
            'ImageLib upload: failed to cleanup file',
          );
        }
      }),
    );
  }

  private safeResolveUploadPath(link: string): string {
    const normalizedLink = link.startsWith('/') ? link.slice(1) : link;
    const uploadsRootAbs = getUploadsRootAbs() + sep;
    const absPath = resolve(process.cwd(), normalizedLink);

    if (!absPath.startsWith(uploadsRootAbs)) {
      this.logger.error(
        {
          link,
          absPath,
          uploadsRootAbs,
        },
        'Unsafe file link detected',
      );

      throw new InternalServerErrorException('Unsafe file path');
    }

    return absPath;
  }

  private buildUniqueConflictMessage(constraint?: string): string {
    if (!constraint) {
      return 'Unique constraint violation';
    }

    if (constraint.includes('link')) {
      return 'Image link already exists';
    }

    if (constraint.includes('name')) {
      return 'Image name already exists';
    }

    return 'Unique constraint violation';
  }

  private stripExt(originalName: string): string {
    const idx = originalName.lastIndexOf('.');

    return idx > 0 ? originalName.slice(0, idx) : originalName;
  }

  private sanitizeName(value: string): string {
    const trimmed = value.trim().replace(/\s+/g, ' ');
    const cleaned = trimmed.replace(/[^\p{L}\p{N}\s\-_.]/gu, '');

    return cleaned.length > 0 ? cleaned : 'image';
  }

  private cutToMax(value: string, max: number): string {
    return value.length <= max ? value : value.slice(0, max);
  }

  // async createManyFromUploadedFiles(
  //   files: Express.Multer.File[],
  // ): Promise<ImageLib[]> {
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('No files uploaded');
  //   }

  //   const rows: Array<Partial<ImageLib>> = files.map((file, index) =>
  //     this.mapFileToEntity(file, index),
  //   );

  //   try {
  //     return await this.repository.createMany(rows, 100);
  //   } catch (err) {
  //     await this.safeDeleteUploadedFiles(files);

  //     if (err instanceof QueryFailedError) {
  //       const pg = err as unknown as PgQueryFailed;
  //       if (pg.code === '23505') {
  //         throw new ConflictException(
  //           this.buildUniqueConflictMessage(pg.constraint),
  //         );
  //       }
  //     }

  //     this.logger.error({ err }, 'ImageLib upload: db save failed');
  //     throw new InternalServerErrorException('Failed to save uploaded images');
  //   }
  // }
  // private mapFileToEntity(
  //   file: Express.Multer.File,
  //   index: number,
  // ): Partial<ImageLib> {
  //   // Если ты раздаёшь статику из папки ./uploads с serveRoot='/uploads'
  //   // то link должен начинаться с /uploads/...
  //   const relPath = relative(
  //     process.cwd(),
  //     join(file.destination, file.filename),
  //   ).replaceAll('\\', '/');

  //   const link = `/${relPath}`;

  //   // name UNIQUE -> генерим уникально и безопасно
  //   const base = this.stripExt(file.originalname);
  //   const safeBase = this.sanitizeName(base);
  //   const suffix = randomUUID().slice(0, 8);
  //   const name = this.cutToMax(`${safeBase}-${index + 1}-${suffix}`, 255);

  //   return {
  //     link,
  //     name,
  //   };
  // }

  // private async safeDeleteUploadedFiles(
  //   files: Express.Multer.File[],
  // ): Promise<void> {
  //   await Promise.all(
  //     files.map(async (f) => {
  //       try {
  //         await unlink(join(f.destination, f.filename));
  //       } catch (e) {
  //         this.logger.warn(
  //           { err: e, filename: f.filename },
  //           'ImageLib upload: failed to cleanup file',
  //         );
  //       }
  //     }),
  //   );
  // }

  // private buildUniqueConflictMessage(constraint?: string): string {
  //   if (!constraint) return 'Unique constraint violation';
  //   if (constraint.includes('link')) return 'Image link already exists';
  //   if (constraint.includes('name')) return 'Image name already exists';
  //   return 'Unique constraint violation';
  // }

  // private stripExt(originalName: string): string {
  //   const idx = originalName.lastIndexOf('.');
  //   return idx > 0 ? originalName.slice(0, idx) : originalName;
  // }

  // private sanitizeName(value: string): string {
  //   const trimmed = value.trim().replace(/\s+/g, ' ');
  //   const cleaned = trimmed.replace(/[^\p{L}\p{N}\s\-_.]/gu, '');
  //   return cleaned.length ? cleaned : 'image';
  // }

  // private cutToMax(value: string, max: number): string {
  //   return value.length <= max ? value : value.slice(0, max);
  // }

  // /**
  //  * Удаляет запись из БД и пытается удалить локальный файл.
  //  * Безопасно: защищаемся от path traversal через проверку, что путь внутри ./uploads
  //  */
  // async removeWithFile(id: number): Promise<void> {
  //   const entity = await this.findById(id); // 404 если нет

  //   // 1) Удаляем запись в БД (источник истины)
  //   await this.remove(id);

  //   // 2) Пытаемся удалить файл (не делаем это "критичным", чтобы не ломать удаление записи)
  //   if (!entity.link) return;

  //   const absFilePath = this.safeResolveUploadPath(entity.link);
  //   try {
  //     await unlink(absFilePath);
  //   } catch (e) {
  //     // файл мог уже быть удалён — не фейлим запрос, но логируем
  //     this.logger.warn(
  //       { err: e, id, link: entity.link, absFilePath },
  //       'Failed to delete local file for ImageLib',
  //     );
  //   }
  // }

  // /**
  //  * Принимает link вида "/uploads/image-lib/2026/03/xxx.webp"
  //  * и превращает в абсолютный путь внутри <cwd>/uploads/**.
  //  * Если link пытается выйти из uploads — падаем.
  //  */
  // private safeResolveUploadPath(link: string): string {
  //   // Нормализуем: убираем ведущий "/", чтобы resolve не "сбросил" cwd
  //   const normalized = link.startsWith('/') ? link.slice(1) : link;

  //   const uploadsRoot = resolve(process.cwd(), 'uploads') + sep;
  //   const absPath = resolve(process.cwd(), normalized);

  //   if (!absPath.startsWith(uploadsRoot)) {
  //     // это попытка выйти из uploads или странный линк
  //     this.logger.error(
  //       { link, absPath, uploadsRoot },
  //       'Unsafe file link detected',
  //     );
  //     throw new InternalServerErrorException('Unsafe file path');
  //   }

  //   return absPath;
  // }
}
