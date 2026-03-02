export interface FaqType {
  id: number;
  service_id: number;
  question: string;
  answer: string;
  link?: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateFaqData = Pick<FaqType, 'question' | 'answer' | 'link'> & {
  serviceId: number;
};

export type UpdateFaqData = Partial<CreateFaqData>;
