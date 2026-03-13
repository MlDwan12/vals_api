import { ClientLeadEntity } from '../entities/client-lead.entity';
import { ClientLeadListItemDto } from '../dto/client-lead-list-item.dto';

interface BitrixEmailValue {
  VALUE: string;
  VALUE_TYPE: string;
}

interface BitrixPhoneValue {
  VALUE: string;
  VALUE_TYPE: string;
}

interface BitrixPayload {
  NAME?: string;
  EMAIL?: BitrixEmailValue[];
  PHONE?: BitrixPhoneValue[];
  TITLE?: string;
  COMMENTS?: string;
  SOURCE_ID?: string;
  UF_TARIFF_NAME?: number | string;
  UF_TARIFF_PRICE?: number | string;
  UF_CRM_CREATED_BY_API?: boolean;
}

export class ClientLeadMapper {
  static toListItem(entity: ClientLeadEntity): ClientLeadListItemDto {
    const bitrixPayload = this.asBitrixPayload(entity.bitrixPayload);

    const title = bitrixPayload?.TITLE ?? null;
    const comments = bitrixPayload?.COMMENTS ?? null;

    const serviceName = this.extractServiceName(title, comments);
    const tariffName = this.extractTariffName(comments);
    const period = this.extractPeriod(comments);
    const monthlyPrice = this.extractMonthlyPrice(comments);
    const totalPrice = this.extractTotalPrice(comments);

    return {
      id: entity.id,
      clientId: entity.clientId,
      type: entity.type,
      name: entity.name,
      phoneRaw: entity.phoneRaw,
      emailRaw: entity.emailRaw,
      message: entity.message,
      comment: entity.comment,
      utm: this.asRecord(entity.utm),
      serviceName,
      tariffName,
      period,
      monthlyPrice,
      totalPrice,
      bitrixLeadId: entity.bitrixLeadId,
      title,
      createdAt: entity.createdAt,
    };
  }

  static toList(entities: ClientLeadEntity[]): ClientLeadListItemDto[] {
    return entities.map((entity) => this.toListItem(entity));
  }

  private static asBitrixPayload(value: unknown): BitrixPayload | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as BitrixPayload;
  }

  private static asRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private static extractServiceName(
    title: string | null,
    comments: string | null,
  ): string | null {
    const sources: string[] = [title, comments].filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    for (const source of sources) {
      const match = source.match(
        /Выбрана услуга\s*-\s*(.+?)(?:\s+по тарифу:|$)/i,
      );
      if (match?.[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private static extractTariffName(comments: string | null): string | null {
    if (!comments) {
      return null;
    }

    const match = comments.match(/по тарифу:\s*(.+?)\s+на период/i);
    return match?.[1]?.trim() ?? null;
  }

  private static extractPeriod(comments: string | null): string | null {
    if (!comments) {
      return null;
    }

    const match = comments.match(/на период\s+(.+?)\.\s*Цена за месяц/i);
    return match?.[1]?.trim() ?? null;
  }

  private static extractMonthlyPrice(comments: string | null): number | null {
    if (!comments) {
      return null;
    }

    const match = comments.match(/Цена за месяц\s*-\s*([\d\s]+)\s*руб/i);
    return this.parsePrice(match?.[1] ?? null);
  }

  private static extractTotalPrice(comments: string | null): number | null {
    if (!comments) {
      return null;
    }

    const match = comments.match(/Общая стоимость:\s*([\d\s]+)\s*руб/i);
    return this.parsePrice(match?.[1] ?? null);
  }

  private static parsePrice(value: string | null): number | null {
    if (!value) {
      return null;
    }

    const normalized = value.replace(/\s+/g, '');
    if (!/^\d+$/.test(normalized)) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
}
