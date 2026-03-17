export const SERVICE_BASE_FIELDS = [
  'service.id',
  'service.slug',
  'service.title',
  'service.subtitle',
  'service.description',
  'service.subDescription',
  'service.list',
  'service.icon',
  'service.backgroundColor',
  'service.createdAt',
];

export const ARTICLE_BASE_FIELDS = [
  'articles.id',
  'articles.slug',
  'articles.title',
  'articles.description',
  'articles.metaTitle',
  'articles.metaDescription',
  'articles.keywords',
];

export const ARTICLE_MAIN_FIELDS = [
  'articles.id',
  'articles.slug',
  'articles.title',
  'articles.description',
  'articles.createdAt',
  'articles.updatedAt',
];

export const CASES_MAIN_FIELDS = [
  'cases.id',
  'cases.slug',
  'cases.title',
  'cases.description',
  'cases.problem',
  'cases.result',
  'cases.createdAt',
  'cases.updatedAt',
];

export const SERVICE_MAIN_FIELDS = [
  'service.id',
  'service.slug',
  'service.title',
  'service.createdAt',
  'service.updatedAt',
];

export const CATEGORY_FIELDS = [
  'category.id',
  'category.name',
  'category.description',
];

export const STAGE_FIELDS = [
  'stage.id',
  'stage.step',
  'stage.title',
  'stage.description',
  'stage.time',
];

export const TARIFF_FIELDS = [
  'tariffs.id',
  'tariffs.is_popular',
  'tariffs.name',
  'tariffs.from',
  'tariffs.billingCycles',
  'tariffs.features',
  'tariffs.order_index',
  'tariffs.basePrice'
];

export const FAQ_FIELDS = ['faq.id', 'faq.question', 'faq.answer'];
