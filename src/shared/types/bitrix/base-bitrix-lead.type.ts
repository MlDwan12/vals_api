import { LeadType } from 'src/shared/enums/lead-type.enum';

export interface BaseBitrixLeadType {
  name: string;
  phone: string;
  message?: string;
  type: LeadType;
}
