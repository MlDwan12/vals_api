/** Лёгкая проекция для подписи автора (алиас `author`) — используется при джойне к статьям/кейсам. */
export const EMPLOYEE_SHORT_FIELDS = [
  'author.id',
  'author.slug',
  'author.name',
  'author.photoUrl',
  'author.position',
  'author.experience',
];

/** Список для страницы «Команда» и админ-таблицы (алиас `employee`) — без тяжёлых bio/bioHtml/meta. */
export const EMPLOYEE_MAIN_FIELDS = [
  'employee.id',
  'employee.slug',
  'employee.name',
  'employee.position',
  'employee.photoUrl',
  'employee.shortBio',
  'employee.experience',
  'employee.priority',
  'employee.isVisible',
  'employee.createdAt',
  'employee.updatedAt',
];
