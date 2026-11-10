# SE backend boilerplate (Express · TypeORM · PostgreSQL · TypeScript)

REST API з JWT-авторизацією й ролями: бекенд для лабораторних курсу «Конструювання програмного забезпечення». Це форк [mkosir/typeorm-express-typescript](https://github.com/mkosir/typeorm-express-typescript) з виправленнями для навчання й Windows (див. [«Чим відрізняється від оригіналу»](#11-чим-відрізняється-від-оригіналу)). Фронтенд до нього: [se-frontend-boilerplate](https://github.com/University-of-Intelligent-Technologies/se-frontend-boilerplate).

## 1. Що встановити

|         | Windows                                                                                                                                                                                                            | macOS / Linux                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Git     | [git-scm.com](https://git-scm.com/download/win), налаштування за замовчуванням                                                                                                                                     | macOS: `xcode-select --install` або `brew install git`; Linux: пакет `git` |
| Node.js | [nodejs.org](https://nodejs.org/), **22 або 24 LTS** (перевірено на 20, 22, 24); npm встановиться разом                                                                                                            | те саме, або `nvm install 22`                                              |
| Docker  | [Docker Desktop](https://www.docker.com/products/docker-desktop/) з **WSL 2** (Windows 10 22H2 / 11, у BIOS увімкнена віртуалізація). Після встановлення запустіть Docker Desktop і дочекайтеся **Engine running** | macOS: Docker Desktop; Linux: Docker Engine + плагін `docker compose`      |
| IDE     | WebStorm або VS Code                                                                                                                                                                                               | те саме                                                                    |

Перевірка (PowerShell або термінал): `git --version`, `node -v`, `docker version`, `docker compose version` — кожна команда виводить версію без помилок.

## 2. Клонування

```bash
git clone https://github.com/University-of-Intelligent-Technologies/se-backend-boilerplate.git
cd se-backend-boilerplate
```

## 3. Запуск крок за кроком

```bash
npm install                                                             # 1. залежності
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db_postgres   # 2. база в Docker
npm run migration:run                                                   # 3. таблиці (лише перший раз)
npm run seed:run                                                        # 4. тестові користувачі (лише перший раз)
npm run dev                                                             # 5. API
```

У терміналі мають з'явитися `Server running on port 4000` і `Database connection success`. API: <http://localhost:4000/v1>. PostgreSQL слухає `localhost:8432` (користувач `walter`, пароль `white`, база `boilerplate`, усе в `.env`). Код перезапускається сам після збереження файлу.

**Перевірка.** Тестові користувачі: `admin@admin.com` (роль ADMINISTRATOR) і `standard@standard.com` (STANDARD), пароль у всіх `pass1`.

PowerShell (Windows):

```powershell
$r = Invoke-RestMethod -Method Post -Uri http://localhost:4000/v1/auth/login -ContentType 'application/json' -Body '{"email":"admin@admin.com","password":"pass1"}'
$r.data                                                                 # Bearer eyJ...
Invoke-RestMethod -Uri http://localhost:4000/v1/users -Headers @{ Authorization = $r.data }
```

curl (macOS / Linux):

```bash
curl -X POST http://localhost:4000/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@admin.com","password":"pass1"}'
curl http://localhost:4000/v1/users -H 'Authorization: Bearer <токен з попередньої відповіді>'
```

Зручніше — Postman: імпортуйте колекцію й оточення з теки [`postman`](./postman).

Маршрути: `POST /v1/auth/login`, `POST /v1/auth/register`, `POST /v1/auth/change-password`; `GET /v1/users` (лише адміністратор); `GET | PATCH | DELETE /v1/users/:id` (адміністратор або сам користувач).

Наступного разу достатньо кроків 2 і 5: дані бази зберігаються в томі Docker.

## 4. Запуск з дебагером

- **VS Code:** панель Run and Debug → конфігурація **«API: npm run dev (debug)»** → F5. Поставте брейкпоінт, наприклад у `src/controllers/auth/login.ts`, і надішліть запит на логін.
- **WebStorm:** відкрийте `package.json` → ▶ біля скрипту `dev` → **Debug 'dev'**.
- **Будь-яка IDE:** `npm run dev:debug` запускає API з інспектором на порту 9229; далі під'єднайтеся до нього (VS Code: «API: attach to npm run dev:debug»; WebStorm: Run → Attach to Node.js/Chrome, порт 9229, Reconnect automatically).

База має бути запущена (крок 2 вище).

## 5. З'єднання з фронтендом

- Адреса API: `http://localhost:4000/v1` (у фронтенді — змінна `VITE_API_URL`).
- CORS дозволено для будь-якого origin, тож фронтенд на `http://localhost:5173` працює без проксі.
- Логін повертає `{ "message": "...", "data": "Bearer <jwt>" }`. Значення `data` передавайте як є в заголовку `Authorization`.
- Токен живе 15 хвилин (`JWT_EXPIRATION` у `.env`). Кожна успішна відповідь на захищений маршрут містить оновлений токен у заголовку `token` — браузер його бачить (`Access-Control-Expose-Headers: token`).
- Коди помилок: `401` — немає токена або він недійсний/прострочений; `403` — бракує прав; `400` — помилка валідації (деталі в `errorsValidation`); **неправильні email чи пароль при логіні дають `404`**.

## 6. Усе в Docker

Якщо не потрібен дебагер на хості, усе можна запустити однією командою (замість кроків 2–5):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Контейнер дочекається бази, виконає міграції й сиди і запустить API на порту 4000 (код з теки проєкту, зміни підхоплюються). Зупинка — Ctrl+C. Тести в окремому контейнері:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec be_boilerplate_test npm test
```

Не запускайте одночасно цей режим і `npm run dev`: обидва займають порт 4000.

## 7. Без Docker: свій PostgreSQL

Якщо Docker не встановлюється, підійде локальний PostgreSQL 14+. Створіть користувача й базу (psql або pgAdmin → Query Tool), **кожну команду окремо**: разом вони дають помилку `CREATE DATABASE cannot run inside a transaction block`.

```sql
CREATE ROLE walter LOGIN PASSWORD 'white';
```

```sql
CREATE DATABASE boilerplate OWNER walter;
```

У `.env` змініть порт: `PG_PORT=5432` (`PG_HOST=localhost` лишається). Далі кроки 3–5 розділу «Запуск».

## 8. Корисні команди

| Команда                                                                  | Що робить                                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `npm run dev` / `npm run dev:debug`                                      | API з автоперезапуском / те саме з інспектором на 9229                     |
| `npm run lint` / `npm run lint-fix`                                      | ESLint і перевірка типів / автовиправлення                                 |
| `npm run build`, `npm start`                                             | збірка в `dist/` і запуск зібраного                                        |
| `npm test`                                                               | тести (потрібна база; зупиніть `npm run dev`, бо тести займають порт 4000) |
| `npm run migration:generate -- AddProducts`                              | згенерувати міграцію зі змін у сутностях                                   |
| `npm run migration:run` / `migration:revert`                             | застосувати / відкотити останню міграцію                                   |
| `npm run seed:run`                                                       | тестові дані                                                               |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml stop`    | зупинити контейнери (дані лишаються)                                       |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v` | видалити контейнери **разом із даними бази**                               |

## 9. Типові проблеми

- **`npm : File ...\npm.ps1 cannot be loaded because running scripts is disabled`** (PowerShell) — один раз виконайте `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` або працюйте в `cmd`.
- **`port is already allocated` / `EADDRINUSE`** — порт 8432 чи 4000 зайнятий (інший контейнер, інша копія проєкту, `npm run dev` в іншому вікні). Подивіться `docker ps`, зупиніть зайве; або змініть порт: API — `PORT` у `.env`, база — `ports` у `docker-compose.dev.yml` і `PG_PORT` у `.env`.
- **`error during connect` / `Cannot connect to the Docker daemon`** — Docker Desktop не запущено. **`WSL 2 is not installed`** — виконайте `wsl --install` у PowerShell від адміністратора й перезавантажтеся.
- **`ECONNREFUSED 127.0.0.1:8432`** — контейнер бази не запущено або він ще стартує: `docker ps`, потім повторіть.
- **`password authentication failed for user "walter"`** — том бази лишився від запуску з іншими налаштуваннями. Перестворіть (дані зникнуть): `docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v`, далі кроки 2–4.
- **Git не приймає коміт** (`subject may not be empty`, `type may not be empty`) — повідомлення мають бути у форматі Conventional Commits: `feat: add Product entity`, `fix: validate price`. Перед `git push` автоматично виконується `npm run build`, тож помилки компіляції не дадуть запушити.

## 10. Структура

`src/routes` — маршрути (`/v1/...`) → `src/middleware` (JWT, ролі, валідація) → `src/controllers` → `src/orm/entities` (сутності TypeORM); `src/orm/migrations` і `src/orm/seeds` — міграції й тестові дані; `.env` — налаштування.

## 11. Чим відрізняється від оригіналу

- Переноси рядків LF для всіх файлів (`.gitattributes`): скрипти в контейнерах не ламаються на Windows.
- База на порту 8432 (5432 часто зайнятий локальним PostgreSQL), дані в іменованому томі Docker, без фіксованих імен контейнерів.
- `npm run dev` на хості працює одразу: `.env` дивиться на `localhost:8432`, `cross-env` у скриптах, CLI TypeORM викликається так, що працює й на Windows.
- Сутність `User` узгоджена з міграцією: `migration:generate` на свіжій базі не знаходить змін.
- Без токена — 401 (а не 400), бракує прав — 403 (а не 401); оновлений токен у заголовку `token` видно браузеру.
- Відповіді з помилками без стеку й без тексту SQL; битий JSON у тілі запиту — 400 у тому самому форматі.
- `npm test` і `npm run lint` працюють на хості; Node 22 у Docker і CI; скрипт `dev:debug` і конфігурації VS Code.

---

## Оригінальний README (англійською)

[![CI][build-badge]][build-url]
[![TypeScript][typescript-badge]][typescript-url]
[![prettier][prettier-badge]][prettier-url]
![Heisenberg](misc/heisenberg.png)

Boilerplate with focus on best practices and painless developer experience:

- Minimal setup that can be extended 🔧
- Spin it up with single command 🌀
- TypeScript first
- RESTful APIs
- JWT authentication with role based authorization

## Requirements

- [Node v16+](https://nodejs.org/)
- [Docker](https://www.docker.com/)

## Running

_Easily set up a local development environment with single command!_

- clone the repo
- `npm run docker:dev` 🚀

Visit [localhost:4000](http://localhost:4000/) or if using Postman grab [config](/postman).

### _What happened_ 💥

Containers created:

- Postgres database container seeded with 💊 Breaking Bad characters in `Users` table (default credentials `user=walter`, `password=white` in [.env file](./.env))
- Node (v16 Alpine) container with running boilerplate RESTful API service
- and one Node container instance to run tests locally or in CI

## Features:

- [Express](https://github.com/expressjs/express) framework
- [TypeScript v4](https://github.com/microsoft/TypeScript) codebase
- [TypeORM](https://typeorm.io/) using Data Mapper pattern
- [Docker](https://www.docker.com/) environment:
  - Easily start local development using [Docker Compose](https://docs.docker.com/compose/) with single command `npm run docker:dev`
  - Connect to different staging or production environments `npm run docker:[stage|prod]`
  - Ready for **microservices** development and deployment.  
    Once API changes are made, just build and push new docker image with your favourite CI/CD tool  
    `docker build -t <username>/api-boilerplate:latest .`  
    `docker push <username>/api-boilerplate:latest`
  - Run unit, integration (or setup with your frontend E2E) tests as `docker exec -ti be_boilerplate_test sh` and `npm run test`
- Contract first REST API design:
  - never break API again with HTTP responses and requests payloads using [type definitions](./src/types/express/index.d.ts)
  - Consistent schema error [response](./src/utils/response/custom-error/types.ts). Your frontend will always know how to handle errors thrown in `try...catch` statements 💪
- JWT authentication and role based authorization using custom middleware
- Set local, stage or production [environmental variables](./config) with [type definitions](./src/types/ProcessEnv.d.ts)
- Logging with [morgan](https://github.com/expressjs/morgan)
- Unit and integration tests with [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/)
- Linting with [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/) code formatter
- Git hooks with [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- Automated npm & Docker dependency updates with [Renovate](https://github.com/renovatebot/renovate) (set to patch version only)
- Commit messages must meet [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format.  
  After staging changes just run `npm run commit` and get instant feedback on your commit message formatting and be prompted for required fields by [Commitizen](https://github.com/commitizen/cz-cli)

## Other awesome boilerplates:

Each boilerplate comes with it's own flavor of libraries and setup, check out others:

- [Express and TypeORM with TypeScript](https://github.com/typeorm/typescript-express-example)
- [Node.js, Express.js & TypeScript Boilerplate for Web Apps](https://github.com/jverhoelen/node-express-typescript-boilerplate)
- [Express boilerplate for building RESTful APIs](https://github.com/danielfsousa/express-rest-es2017-boilerplate)
- [A delightful way to building a RESTful API with NodeJs & TypeScript by @w3tecch](https://github.com/w3tecch/express-typescript-boilerplate)

[build-badge]: https://github.com/mkosir/express-typescript-typeorm-boilerplate/actions/workflows/main.yml/badge.svg
[build-url]: https://github.com/mkosir/express-typescript-typeorm-boilerplate/actions/workflows/main.yml
[typescript-badge]: https://badges.frapsoft.com/typescript/code/typescript.svg?v=101
[typescript-url]: https://github.com/microsoft/TypeScript
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier

## Contributing

All contributions are welcome!
