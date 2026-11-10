#  TypeORM / Express / TypeScript RESTful API boilerplate

[![CI][build-badge]][build-url]
[![TypeScript][typescript-badge]][typescript-url]
[![prettier][prettier-badge]][prettier-url]
![Heisenberg](misc/heisenberg.png)

## Швидкий старт (Windows)

> Розділ для студентів курсу «Конструювання програмного забезпечення». Нижче — оригінальний README бойлерплейта.

### 1. Що встановити

- [Git](https://git-scm.com/download/win)
- [Node.js](https://nodejs.org/) — версія LTS (npm встановиться разом із ним)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) з WSL 2. Після встановлення запустіть Docker Desktop і дочекайтеся статусу **Engine running**
- IDE: WebStorm або VS Code

Перевірка в PowerShell: `git --version`, `node -v`, `docker version` — кожна команда має вивести версію без помилок.

### 2. Склонувати й встановити залежності

```powershell
git clone <адреса цього репозиторію>
cd typeorm-express-typescript
npm install
```

### 3. Запустити базу даних (Docker)

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d db_postgres
```

PostgreSQL працює на `localhost:8432` (користувач `walter`, пароль `white`, база `boilerplate` — див. `.env`).

### 4. Створити таблиці й тестових користувачів (лише перший раз)

```powershell
npm run migration:run
npm run seed:run
```

### 5. Запустити API

```powershell
npm run dev
```

API доступне на <http://localhost:4000>. Щоб працювати з дебагером, запустіть npm-скрипт `dev` у режимі Debug у вашій IDE.

### 6. Перевірити

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/v1/auth/login -ContentType 'application/json' -Body '{"email":"admin@admin.com","password":"pass1"}'
```

У відповіді має бути `Token successfully created.` і токен `Bearer …`. Решту запитів зручно надсилати з Postman: колекція й оточення лежать у теці [`postman`](./postman). Тестові користувачі: `admin@admin.com` (адміністратор) і `standard@standard.com` (звичайний), пароль у всіх `pass1`.

### Усе в Docker (без запуску на хості)

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Контейнер сам виконає міграції та сиди й запустить API на порту 4000.

### Типові проблеми

- **`port is already allocated` / `address already in use`** — порт 8432 або 4000 зайнятий іншим контейнером чи програмою. Зупиніть її (Docker Desktop → Containers) або змініть порт: для бази — у `docker-compose.dev.yml` і `PG_PORT` у `.env`, для API — `PORT` у `.env`.
- **`error during connect` / `Cannot connect to the Docker daemon`** — Docker Desktop не запущено.
- **`ECONNREFUSED 127.0.0.1:8432`** — контейнер бази не запущено або він ще стартує. Перевірте `docker ps` і повторіть команду.
- **`password authentication failed`** — база вже була створена раніше з іншим паролем. Перестворити її (усі дані бази буде видалено): `docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v`, далі знову кроки 3–4.
- **Git не приймає коміт (`subject may not be empty`, `type may not be empty`)** — у репозиторії ввімкнено перевірку повідомлень комітів: пишіть у форматі `feat: додати сутність Product` чи `fix: виправити валідацію`.

---

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
