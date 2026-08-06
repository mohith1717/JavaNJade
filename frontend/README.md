# JadeGuard Frontend

React and TypeScript dashboard shell powered by Vite.

```bash
npm install
npm run dev
```

Vite serves the application at <http://localhost:5173> and proxies `/api`
requests to the Spring Boot API at <http://localhost:8080>.

## Validation

Run the frontend role/session tests and create the production bundle with:

```bash
npm run test:run
npm run build
```

`npm test` starts Vitest in watch mode while developing. The production build
includes TypeScript checking before Vite creates `dist/`.

Authenticated sessions are stored in browser local storage. JadeGuard validates
the token at startup, schedules logout at the JWT expiry time, and also clears
the session whenever an API request returns `401 Unauthorized`.

As features grow, organize `src` by product area:

```text
src/
├── app/
├── features/
│   ├── transactions/
│   ├── alerts/
│   ├── investigations/
│   ├── rules/
│   ├── reports/
│   └── audit/
├── shared/
└── main.tsx
```
