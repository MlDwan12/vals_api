# =====================================================
# 1️⃣ BUILD STAGE
# =====================================================
FROM node:20-alpine AS builder

# Добавим утилиты для сборки
RUN apk add --no-cache bash git python3 make g++

WORKDIR /app

# Копируем lock-файлы и package.json для кэширования
COPY package.json yarn.lock ./

# Устанавливаем зависимости строго по lock-файлу
RUN yarn install --frozen-lockfile

# Копируем исходники
COPY . .

# Собираем проект NestJS
RUN yarn build

# Удаляем dev зависимости
RUN yarn install --production --frozen-lockfile

# =====================================================
# 2️⃣ RUNTIME STAGE (минимальный образ)
# =====================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Создаем пользователя без root прав
RUN addgroup -S app && adduser -S app -G app

# Копируем только нужное из builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Меняем владельца рабочей директории на нового пользователя
RUN chown -R app:app /app

# Переключаемся на непривилегированного пользователя
USER app

# Настройка корректного shutdown
STOPSIGNAL SIGTERM

# Запуск приложения
CMD ["node", "dist/main.js"]