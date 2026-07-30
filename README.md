# JadeGuard

Transaction monitoring, risk scoring, and fraud-alert case management.

## Repository

```text
JavaNJade/
├── backend/              Spring Boot modular monolith
├── frontend/             React and TypeScript dashboard
├── generator/            Python transaction simulator
├── docs/                 Agreements and architecture
├── docker-compose.yml    Local MySQL
└── README.md
```

## Start here

Before implementation, the team should review and agree on the
[project baseline](docs/PROJECT_BASELINE.md). It defines the initial technology
stack, API contract, data model, alert lifecycle, Git workflow, and first demo.

The first milestone is intentionally small:

> Submit a transaction, validate and store it, evaluate one amount-threshold
> rule, calculate an explainable risk score, generate an alert, let an analyst
> close it, and record the complete audit history.

Architecture details are recorded in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Run the skeleton

Create local environment values:

```bash
cp .env.example .env
docker compose up -d mysql
```

JadeGuard publishes its MySQL container on host port `3307` to avoid conflicts
with locally installed MySQL servers. Inside the container, MySQL continues to
use its standard port `3306`.

Backend database overrides use `JADEGUARD_DB_URL`, `JADEGUARD_DB_USER`, and
`JADEGUARD_DB_PASSWORD` so unrelated IDE or shell database settings do not
silently change this application's connection.

Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

In another terminal, run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: <http://localhost:5173>
- Backend health: <http://localhost:8080/api/v1/system/health>
- Swagger UI: <http://localhost:8080/swagger-ui.html>

The generator currently supports dry-run scenarios:

```bash
cd generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generate.py high_amount --dry-run
```

Submitting generated transactions without `--dry-run` will work after the first
transaction-ingestion feature is implemented.

## Development order

1. Merge and protect this shared skeleton.
2. Implement transaction ingestion and persistence.
3. Add the first amount-threshold rule and risk explanation.
4. Generate an alert and implement its lifecycle.
5. Replace frontend placeholder modules with the first alert queue.
