# AsyncWorkers

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Это [Nx workspace](https://nx.dev) для проекта AsyncWorkers ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created.

## Приложения

### `backend` (NestJS)

Централизованное управление асинхронными задачами с возможностью отслеживания их прогресса в реальном времени через Server-Sent Events (SSE).

**Основные функции:**

*   **Управление задачами (Jobs):** Создание, получение списка, получение деталей, обновление статуса (включая отмену) задач.
*   **Хранение данных:** TypeORM для взаимодействия с реляционной базой данных.
*   **Мониторинг в реальном времени (SSE):**
    *   Подписка на обновления конкретной задачи: `GET /api/sse/:id`
    *   Подписка на обновления всех задач: `GET /api/sse/all` (события `job-updated`, `job-done`, `job-canceled`)
*   **API:**
    *   Базовая проверка: `GET /api`
    *   Создать задачу: `POST /api/jobs`
    *   Получить все задачи: `GET /api/jobs` (опционально фильтруется по `?status=`)
    *   Получить задачу по ID: `GET /api/jobs/:id`
    *   Получить сводку по задачам: `GET /api/jobs/summary`
    *   Запустить задачу: `POST /api/jobs/:id/start`
    *   Отменить задачу: `POST /api/jobs/:id/cancel`

**Технологии:** NestJS, TypeScript, TypeORM, Jest.

**Разработка:**

*   **Запуск в режиме разработки:**
    ```bash
    npx nx serve backend
    ```
*   **Сборка:**
    ```bash
    npx nx build backend
    ```
*   **Запуск unit-тестов:**
    ```bash
    npx nx test backend
    ```
*   **Запуск E2E-тестов:**
    ```bash
    npx nx e2e backend-e2e
    ```

### `frontend`

Интерфейс панели управления построен на **React** и **Vite** с использованием
**Tailwind CSS** и компонентов [shadcn/ui](https://ui.shadcn.com/). Данные
загружаются через **TanStack&nbsp;Query**, маршрутизация реализована при помощи
**React Router**.

**Запуск в режиме разработки:**

```bash
npx nx serve frontend
```

**Сборка:**

```bash
npx nx build frontend
```

Основные зависимости: React&nbsp;19, TanStack&nbsp;Query&nbsp;v5, shadcn/ui,
react-hook-form, zod, Zustand.

## Библиотеки

### `@async-workers/shared-types`

Содержит общие TypeScript типы, используемые совместно бэкендом и фронтендом (например: `JobStatus`, `Job`).

## Полезные команды

*   **Запустить граф зависимостей:**
    ```bash
    npx nx graph
    ```

## Установка

1.  Установите зависимости:
    ```bash
    npm install
    ```
    или
    ```bash
    yarn install
    ```

2. Для фронтенда можно настроить базовый URL API через переменную окружения
   `VITE_API_BASE_URL`. По умолчанию используется `/api`. Локальные значения
   можно задать в файле `apps/frontend/config/.local.env`.

## Лицензия

Этот проект распространяется под лицензией MIT. Полный текст лицензии 
(на английском и русском языках) можно найти в файле [LICENSE](./LICENSE).
