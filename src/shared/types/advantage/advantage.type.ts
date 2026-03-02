export interface AdvantageType {
  id: number;
  service_id: number;

  title: string;

  description: string;

  icon?: string;

  note?: string;
}

export type CreateAdvantageData = Pick<
  AdvantageType,
  'service_id' | 'title' | 'description' | 'note' | 'icon'
> & {};

export type UpdateAdvantageData = Partial<CreateAdvantageData>;
