export interface ClientLeadListItemDto {
  id: number;
  clientId: number;
  type: string;
  name: string | null;
  phoneRaw: string | null;
  emailRaw: string | null;
  message: string | null;
  comment: string | null;
  utm: Record<string, unknown> | null;
  serviceName: string | null;
  tariffName: string | null;
  period: string | null;
  monthlyPrice: number | null;
  totalPrice: number | null;
  bitrixLeadId: string | null;
  title: string | null;
  createdAt: Date;
}
