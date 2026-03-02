import { BitrixConsultationLeadType } from './bitrix-consultation-lead.type';
import { BitrixAuditLeadType } from './form-free-audit.type';
import { BitrixTariffLeadType } from './form-tariff-lead.type';

export type BitrixLead =
  | BitrixAuditLeadType
  | BitrixConsultationLeadType
  | BitrixTariffLeadType;
