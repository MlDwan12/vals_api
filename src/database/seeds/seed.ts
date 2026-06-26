import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv();

import { DataSource } from 'typeorm';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

import { ServiceCategory } from '../../modules/service_categories/entities/service_category.entity';
import { Service } from '../../modules/services/entities/service.entity';
import { ServiceStep } from '../../modules/service_steps/entities/service_step.entity';
import { TariffPeriod } from '../../modules/tariff_periods/entities/tariff_period.entity';
import { Tariff } from '../../modules/tariffs/entities/tariff.entity';
import { Faq } from '../../modules/faq/entities/faq.entity';
import { Case } from '../../modules/cases/entities/case.entity';
import { Article } from '../../modules/articles/entities/article.entity';
import { Industry } from '../../modules/industry/entities/industry.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../modules/users/enums/user-role.enum';
import { BackgroundColor } from '../../shared/enums/backgroundColor.enum';
import { BillingCycle } from '../../shared/types/tariff/tariff.type';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'vals_api',
  entities: [join(__dirname, '../../modules/**/*.entity{.ts,.js}')],
  synchronize: false,
  logging: false,
});

async function seed() {
  await ds.initialize();
  console.log('Connected to DB');

  const alreadySeeded = await ds.getRepository(ServiceCategory).count();
  if (alreadySeeded > 0) {
    console.log('DB already has data — skipping seed');
    await ds.destroy();
    return;
  }

  // ─── Admin user ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await ds.getRepository(User).save({
    username: 'admin',
    password: passwordHash,
    role: UserRole.ADMIN,
  });
  console.log('Created admin user  (login: admin / Admin123!)');

  // ─── Industry ──────────────────────────────────────────────────────────────
  const industries = await ds.getRepository(Industry).save([
    { name: 'IT' },
    { name: 'FinTech' },
    { name: 'E-commerce' },
    { name: 'Медицина' },
  ]);
  console.log(`Created ${industries.length} industries`);

  // ─── Service categories ────────────────────────────────────────────────────
  const categories = await ds.getRepository(ServiceCategory).save([
    { name: 'Управление репутацией', description: 'ORM, SERM и управление отзывами' },
    { name: 'SEO-продвижение', description: 'Поисковая оптимизация и продвижение в поиске' },
    { name: 'Контент-маркетинг', description: 'Создание и дистрибуция контента' },
  ]);
  console.log(`Created ${categories.length} service categories`);

  const [catOrm, catSeo, catContent] = categories;

  // ─── Services ──────────────────────────────────────────────────────────────
  const services = await ds.getRepository(Service).save([
    {
      slug: 'orm',
      category: catOrm,
      title: 'ORM — управление репутацией',
      subtitle: 'Формируем положительный образ вашего бренда',
      description:
        'Комплексное управление репутацией в интернете: мониторинг упоминаний, работа с отзывами, вытеснение негатива из поисковой выдачи.',
      subDescription:
        'Мы используем проверенные методики SERM и ORM для формирования устойчивого положительного образа вашей компании в сети.',
      list: ['Мониторинг 24/7', 'Работа с отзывами на 50+ площадках', 'Прозрачная отчётность'],
      icon: 'orm-icon.svg',
      backgroundColor: BackgroundColor.BLUE,
    },
    {
      slug: 'seo-optimizaciya',
      category: catSeo,
      title: 'SEO-оптимизация',
      subtitle: 'Выводим сайты в топ поисковых систем',
      description:
        'Комплексное SEO-продвижение: технический аудит, работа с семантикой, оптимизация контента и наращивание ссылочной массы.',
      subDescription:
        'Продвигаем сайты по коммерческим запросам в Яндекс и Google. Результат — стабильный органический трафик и рост заявок.',
      list: ['Технический аудит сайта', 'Семантическое ядро', 'Ежемесячные отчёты'],
      icon: 'seo-icon.svg',
      backgroundColor: BackgroundColor.GREEN,
    },
    {
      slug: 'kontent-strategiya',
      category: catContent,
      title: 'Контент-стратегия',
      subtitle: 'Создаём контент, который продаёт',
      description:
        'Разрабатываем и реализуем контент-стратегию: SEO-статьи, кейсы, лендинги, email-рассылки и материалы для соцсетей.',
      subDescription:
        'Контент — основа доверия к бренду. Мы создаём полезные и экспертные материалы, которые привлекают органический трафик и конвертируют читателей в клиентов.',
      list: ['Контент-план на 3 месяца', 'SEO-оптимизированные тексты', 'Дистрибуция в соцсетях'],
      icon: 'content-icon.svg',
      backgroundColor: BackgroundColor.ORANGE,
    },
  ]);
  console.log(`Created ${services.length} services`);

  const [svcOrm, svcSeo, svcContent] = services;

  // ─── Service steps ─────────────────────────────────────────────────────────
  const stepsData: Partial<ServiceStep>[] = [
    // ORM
    { service: svcOrm, step: 1, title: 'Аудит репутации', description: 'Собираем все упоминания бренда и оцениваем текущий репутационный фон', time: '2-3 дня' },
    { service: svcOrm, step: 2, title: 'Стратегия', description: 'Формируем план работ: площадки, контент, приоритеты вытеснения', time: '3-5 дней' },
    { service: svcOrm, step: 3, title: 'Реализация', description: 'Размещаем позитивный контент, отвечаем на отзывы, вытесняем негатив', time: 'Ежемесячно' },
    // SEO
    { service: svcSeo, step: 1, title: 'Технический аудит', description: 'Анализируем скорость, структуру, индексацию и технические ошибки', time: '3-5 дней' },
    { service: svcSeo, step: 2, title: 'Семантика и структура', description: 'Собираем семантическое ядро и разрабатываем структуру сайта', time: '1-2 недели' },
    { service: svcSeo, step: 3, title: 'Оптимизация и продвижение', description: 'Оптимизируем страницы, наращиваем ссылки, публикуем контент', time: 'Ежемесячно' },
    // Контент
    { service: svcContent, step: 1, title: 'Анализ аудитории', description: 'Исследуем целевую аудиторию и конкурентов, определяем темы', time: '3-5 дней' },
    { service: svcContent, step: 2, title: 'Контент-план', description: 'Формируем редакционный план на 3 месяца с типами материалов', time: '1 неделя' },
    { service: svcContent, step: 3, title: 'Производство и дистрибуция', description: 'Создаём материалы и распространяем по каналам', time: 'Ежемесячно' },
  ];
  await ds.getRepository(ServiceStep).save(stepsData);
  console.log(`Created ${stepsData.length} service steps`);

  // ─── FAQ ───────────────────────────────────────────────────────────────────
  const faqData: Partial<Faq>[] = [
    { service: svcOrm, serviceId: svcOrm.id, question: 'Сколько времени занимает улучшение репутации?', answer: 'Первые результаты заметны через 1-2 месяца. Стабильный положительный фон формируется за 3-6 месяцев.' },
    { service: svcOrm, serviceId: svcOrm.id, question: 'Работаете ли вы с негативными отзывами на отзовиках?', answer: 'Да, мы работаем с 50+ площадками: Google, Яндекс Карты, Otzovik, Irecommend и другими.' },
    { service: svcSeo, serviceId: svcSeo.id, question: 'Когда будут первые позиции в поиске?', answer: 'Первые движения по позициям заметны через 2-3 месяца. Устойчивые позиции — через 4-8 месяцев.' },
    { service: svcSeo, serviceId: svcSeo.id, question: 'Гарантируете ли вы ТОП-10?', answer: 'Мы гарантируем профессиональную работу и соответствие лучшим практикам SEO, но не конкретные позиции, так как это зависит от алгоритмов поисковиков.' },
    { service: svcContent, serviceId: svcContent.id, question: 'Пишете ли вы тексты самостоятельно или нужно предоставить информацию?', answer: 'Мы проводим брифинг, изучаем тематику и пишем самостоятельно. Для сложных ниш можем привлечь ваших экспертов на согласование.' },
    { service: svcContent, serviceId: svcContent.id, question: 'Как быстро вы создаёте контент?', answer: 'SEO-статья занимает 3-5 рабочих дней с учётом оптимизации. Лендинг — 5-7 дней.' },
  ];
  await ds.getRepository(Faq).save(faqData);
  console.log(`Created ${faqData.length} FAQ items`);

  // ─── Tariff periods ────────────────────────────────────────────────────────
  const periods = await ds.getRepository(TariffPeriod).save([
    { months: 1,  discountPercent: 0  },
    { months: 3,  discountPercent: 5  },
    { months: 6,  discountPercent: 10 },
    { months: 12, discountPercent: 20 },
  ]);
  console.log(`Created ${periods.length} tariff periods`);

  const [p1, p3, p6, p12] = periods;

  function buildCycles(basePrice: number, activePeriods: TariffPeriod[]): BillingCycle[] {
    return activePeriods.map((p) => {
      const pricePerMonth = p.months === 1
        ? basePrice
        : Math.round(basePrice * (1 - p.discountPercent / 100));
      return {
        periodId: p.id,
        monthCount: p.months,
        pricePerMonth,
        discountPercent: p.discountPercent,
        totalPrice: pricePerMonth * p.months,
      };
    });
  }

  // ─── Tariffs ───────────────────────────────────────────────────────────────
  const tariffsData: Partial<Tariff>[] = [
    // ORM
    {
      service: svcOrm, name: 'Стандарт', from: 'Малый бизнес',
      features: 'Мониторинг упоминаний||Ответы на отзывы (до 30 шт/мес)||Ежемесячный отчёт',
      is_popular: false, order_index: 0, basePrice: 35000,
      billingCycles: buildCycles(35000, [p1, p3, p6, p12]),
    },
    {
      service: svcOrm, name: 'Бизнес', from: 'Средний и крупный бизнес',
      features: 'Мониторинг 24/7||Ответы на отзывы (до 100 шт/мес)||Размещение контента||Вытеснение негатива из ТОП-20||Еженедельный отчёт',
      is_popular: true, order_index: 1, basePrice: 75000,
      billingCycles: buildCycles(75000, [p1, p3, p6, p12]),
    },
    // SEO
    {
      service: svcSeo, name: 'Базовый', from: 'Информационные сайты',
      features: 'Технический аудит||Семантическое ядро (до 200 запросов)||Оптимизация 10 страниц в месяц',
      is_popular: false, order_index: 0, basePrice: 28000,
      billingCycles: buildCycles(28000, [p1, p3, p6, p12]),
    },
    {
      service: svcSeo, name: 'Профессиональный', from: 'Коммерческие сайты и интернет-магазины',
      features: 'Полный технический аудит||Семантическое ядро (до 1000 запросов)||Оптимизация до 30 страниц||Линкбилдинг||Конкурентный анализ',
      is_popular: true, order_index: 1, basePrice: 60000,
      billingCycles: buildCycles(60000, [p1, p3, p6, p12]),
    },
    // Контент
    {
      service: svcContent, name: 'Старт', from: 'Блоги и небольшие компании',
      features: 'Контент-план на месяц||4 SEO-статьи в месяц||Публикация на сайте',
      is_popular: false, order_index: 0, basePrice: 22000,
      billingCycles: buildCycles(22000, [p1, p3, p6, p12]),
    },
    {
      service: svcContent, name: 'Агентство', from: 'Компании с активным контент-маркетингом',
      features: 'Контент-план на 3 месяца||12 SEO-статей в месяц||2 лендинга||Email-рассылка||SMM-посты (8 шт/мес)||Дистрибуция по каналам',
      is_popular: true, order_index: 1, basePrice: 55000,
      billingCycles: buildCycles(55000, [p1, p3, p6, p12]),
    },
  ];
  await ds.getRepository(Tariff).save(tariffsData);
  console.log(`Created ${tariffsData.length} tariffs`);

  // ─── Cases ─────────────────────────────────────────────────────────────────
  const tiptapDoc = (text: string) => ({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  });

  const cases = await ds.getRepository(Case).save([
    {
      services: [svcOrm],
      industry: ['IT', 'E-commerce'],
      title: 'Восстановление репутации интернет-магазина после волны негатива',
      slug: 'vosstanovlenie-reputacii-internet-magazina',
      description: 'За 4 месяца подняли рейтинг с 2.3 до 4.6 на Яндекс Картах.',
      problem: 'Клиент обратился после серии негативных отзывов от конкурентов. Рейтинг упал до 2.3, конверсия снизилась на 35%.',
      result: 'За 4 месяца рейтинг восстановлен до 4.6. Органический трафик вырос на 28%. Конверсия вернулась к исходным значениям.',
      content: tiptapDoc('Подробное описание кейса по восстановлению репутации.'),
      contentHtml: '<p>Подробное описание кейса по восстановлению репутации.</p>',
      metaTitle: 'Кейс: восстановление репутации интернет-магазина',
      metaDescription: 'Как мы подняли рейтинг с 2.3 до 4.6 за 4 месяца',
      keywords: 'управление репутацией, ORM, кейс',
    },
    {
      services: [svcSeo],
      industry: ['FinTech'],
      title: 'SEO-продвижение финтех-стартапа: x3 органического трафика',
      slug: 'seo-prodvizhenie-fintech-startapa',
      description: 'Утроили органический трафик за 6 месяцев в нише финансовых услуг.',
      problem: 'Молодой финтех-стартап с нулевой SEO-историей. Конкуренты занимают ТОП по всем ключевым запросам уже несколько лет.',
      result: 'За 6 месяцев трафик вырос с 800 до 2700 уникальных посетителей в месяц. 47 запросов в ТОП-10 Яндекс.',
      content: tiptapDoc('Подробное описание кейса по SEO-продвижению финтех-стартапа.'),
      contentHtml: '<p>Подробное описание кейса по SEO-продвижению финтех-стартапа.</p>',
      metaTitle: 'Кейс: SEO для финтех-стартапа',
      metaDescription: 'Утроили органический трафик финтех-компании за 6 месяцев',
      keywords: 'SEO, финтех, продвижение, кейс',
    },
    {
      services: [svcContent, svcSeo],
      industry: ['IT'],
      title: 'Контент-стратегия для SaaS-продукта: 500+ лидов из блога',
      slug: 'kontent-strategiya-dlya-saas-produkta',
      description: 'Выстроили экспертный блог, который стал источником 500+ лидов в квартал.',
      problem: 'IT-компания тратила весь маркетинговый бюджет на платную рекламу. Органического трафика почти не было.',
      result: 'За 8 месяцев блог вышел на 15 000 уникальных читателей в месяц. 528 лидов за последний квартал — из органики.',
      content: tiptapDoc('Подробное описание кейса по контент-стратегии для SaaS.'),
      contentHtml: '<p>Подробное описание кейса по контент-стратегии для SaaS.</p>',
      metaTitle: 'Кейс: контент-маркетинг для SaaS',
      metaDescription: '500+ лидов из блога с нуля за 8 месяцев',
      keywords: 'контент-маркетинг, SaaS, блог, лиды, кейс',
    },
  ]);
  console.log(`Created ${cases.length} cases`);

  // ─── Articles ──────────────────────────────────────────────────────────────
  const articles = await ds.getRepository(Article).save([
    {
      slug: 'chto-takoe-orm-i-pochemu-eto-vazhno',
      title: 'Что такое ORM и почему это важно для бизнеса в 2025 году',
      description: 'Разбираем, что такое управление репутацией в интернете, зачем это нужно и как начать.',
      content: tiptapDoc('Управление репутацией (ORM) — это комплекс мер по формированию и защите образа компании в интернете...'),
      contentHtml: '<p>Управление репутацией (ORM) — это комплекс мер по формированию и защите образа компании в интернете...</p>',
      metaTitle: 'Что такое ORM — управление репутацией в интернете',
      metaDescription: 'Подробный гайд по ORM: что это, зачем нужно и как работает управление репутацией бренда',
      keywords: 'ORM, управление репутацией, репутация бренда',
    },
    {
      slug: 'top-10-seo-oshibok',
      title: 'Топ-10 SEO-ошибок, которые убивают ваш трафик',
      description: 'Разбираем самые частые ошибки в SEO-оптимизации и как их исправить.',
      content: tiptapDoc('Многие компании совершают одни и те же ошибки в SEO. Вот 10 самых критичных...'),
      contentHtml: '<p>Многие компании совершают одни и те же ошибки в SEO. Вот 10 самых критичных...</p>',
      metaTitle: 'Топ-10 SEO-ошибок | Vals Agency',
      metaDescription: 'Разбираем 10 самых частых ошибок SEO-оптимизации, которые снижают трафик сайта',
      keywords: 'SEO ошибки, оптимизация сайта, поисковое продвижение',
    },
    {
      slug: 'zachem-biznesu-kontent-marketing',
      title: 'Зачем бизнесу нужен контент-маркетинг в эпоху рекламных баннеров',
      description: 'Объясняем, почему контент — это долгосрочная инвестиция, а не затрата.',
      content: tiptapDoc('В мире, где пользователи игнорируют рекламу, контент-маркетинг становится главным инструментом привлечения...'),
      contentHtml: '<p>В мире, где пользователи игнорируют рекламу, контент-маркетинг становится главным инструментом привлечения...</p>',
      metaTitle: 'Зачем нужен контент-маркетинг для бизнеса',
      metaDescription: 'Почему контент-маркетинг эффективнее баннерной рекламы и как выстроить стратегию',
      keywords: 'контент-маркетинг, блог для бизнеса, органический трафик',
    },
  ]);
  console.log(`Created ${articles.length} articles`);

  console.log('\n✅ Seed completed successfully!');
  console.log('   Admin credentials: admin / Admin123!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
