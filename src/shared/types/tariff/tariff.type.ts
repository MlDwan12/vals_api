import { SubServiceType } from '../sub-service/sub-service.type';

export interface TariffType {
  id: number;
  serviceId: number;
  title: string;
  description?: string;
  price: number;
  period: string;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;

  subServices: SubServiceType[];
}

export type CreateTariffData = Pick<
  TariffType,
  'title' | 'description' | 'price' | 'period' | 'isPopular'
> & {
  serviceId: number;
  subServiceIds?: number[];
};

export type UpdateTariffData = Partial<CreateTariffData>;

export interface BillingCycle {
  periodId: number | null;
  monthCount: number | null;
  pricePerMonth: number | null;
  discountPercent: number | null;
  totalPrice: number;
}
