import { ServiceType } from 'src/shared/enums/service-solution.enum';
import { StageType } from '../stage/stage.type';

export interface ServiceSolutionType {
  //  extends BaseMetaFields
  id?: number;

  slug: string;
  type: ServiceType;

  title: string;
  title_full: string;
  description?: string;

  list?: string[];

  icon?: string;

  created_at?: Date;
  updated_at?: Date;

  // Связи через ID (для command слоя)
  subServiceIds?: number[];
  advantageIds?: number[];
  stages?: StageType[];
  // faqIds?: number[];
  // caseIds?: number[];
  // tariffIds?: number[];
  // categorySolutionIds?: number[];
}
