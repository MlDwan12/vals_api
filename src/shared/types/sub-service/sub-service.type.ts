import { ServiceSolutionType } from '../service/service-solution.type';

export interface SubServiceType {
  id: number;
  slug: string;
  title: string;
  description?: string;
  icon?: string;
  sort?: number;
  createdAt: string;
  updatedAt: string;

  services: ServiceSolutionType[];
}

export type CreateSubServiceData = Pick<
  SubServiceType,
  'slug' | 'title' | 'description' | 'icon' | 'sort'
> & {
  serviceIds?: number[];
};

export type UpdateSubServiceData = Partial<CreateSubServiceData>;
