import { LeadType } from 'src/shared/enums/lead-type.enum';
import { BaseBitrixLeadType } from './base-bitrix-lead.type';

export interface BitrixAuditLeadType extends BaseBitrixLeadType {
  type: LeadType.FREE_AUDIT;
  isTaskDefined: boolean;
}
