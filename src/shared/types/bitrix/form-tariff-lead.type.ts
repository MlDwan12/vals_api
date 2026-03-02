import { LeadType } from 'src/shared/enums/lead-type.enum';

export interface BitrixTariffLeadType {
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  tariffName: string;
  tariffPrice: string;
  type: LeadType.TARIFF_REQUEST;
}
