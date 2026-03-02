import { LeadType } from 'src/shared/enums/lead-type.enum';
import { BaseBitrixLeadType } from './base-bitrix-lead.type';

export interface BitrixConsultationLeadType extends BaseBitrixLeadType {
  type: LeadType.FREE_CONSULTATION;
}
