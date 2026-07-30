# JadeGuard Frontend

React and TypeScript dashboard shell powered by Vite.

```bash
npm install
npm run dev
```

Vite serves the application at <http://localhost:5173> and proxies `/api`
requests to the Spring Boot API at <http://localhost:8080>.

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
