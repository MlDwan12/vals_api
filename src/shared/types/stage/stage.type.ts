export interface StageType {
  id: number;
  order: number;
  title: string;
  subtitle: string;
  timeline?: string;
  icon?: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateStageData = Pick<
  StageType,
  'order' | 'title' | 'subtitle' | 'timeline' | 'icon' | 'isActive'
> & {
  serviceId: number;
};

export type UpdateStageData = Partial<CreateStageData>;
