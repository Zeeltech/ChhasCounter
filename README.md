# Bulk Consumption Tracker — Chhas Counter 🥛

A full-stack web app to track shared bulk pack consumption (like Amul Buttermilk) and automatically split costs among household members.

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Backend  | Spring Boot 3.5 (Java 21) |
| Database | PostgreSQL 16             |
| Frontend | React 18 + Vite 5         |
| API      | REST JSON                 |

---

## Project Structure

```
ChhasCounter/
├── backend/          # Spring Boot backend
│   ├── src/main/java/com/chhas/tracker/
│   │   ├── entity/         # User, BulkPack, ConsumptionLog
│   │   ├── repository/     # JPA repositories
│   │   ├── service/        # Business logic
│   │   ├── controller/     # REST API controllers
│   │   ├── dto/            # Request/Response DTOs
│   │   └── config/         # CORS + exception handler
│   └── pom.xml
├── frontend/         # React + Vite frontend
│   └── src/
│       ├── api/        # Axios API calls
│       ├── components/ # ProgressBar, ConsumptionButtons, LogList, Toast
│       └── pages/      # Dashboard, PackDetail, NewPack, History, Users
├── docker-compose.yml  # PostgreSQL via Docker
└── README.md
```

---

## Running Locally

### Prerequisites

- Java 21+
- Maven 3.6+
- Node.js 18+
- Docker + Docker Compose

### Step 1 — Start PostgreSQL

```bash
docker compose up -d
```

Waits until healthy (~10s). Creates:

- Database: `chhas_db`
- User: `chhas_user` / Password: `chhas_pass`

### Step 2 — Start the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on http://localhost:8080/api

Spring Boot auto-creates all tables via `ddl-auto=update`.

### Step 3 — Start the Frontend

```bash
cd frontend
npm install        # first time only
npm run dev
```

Frontend runs on http://localhost:5173

Vite proxies `/api/*` requests to the backend automatically.

---

## API Reference

### Users

| Method | Path           | Description    |
| ------ | -------------- | -------------- |
| GET    | /api/users     | List all users |
| POST   | /api/users     | Create user    |
| DELETE | /api/users/:id | Delete user    |

### Packs

| Method | Path                   | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | /api/packs             | Create bulk pack     |
| GET    | /api/packs/active      | Get active packs     |
| GET    | /api/packs/history     | Get completed packs  |
| GET    | /api/packs/:id         | Get pack details     |
| GET    | /api/packs/:id/summary | Get cost summary     |
| POST   | /api/packs/:id/consume | Log consumption      |
| GET    | /api/packs/:id/logs    | Get consumption logs |
| DELETE | /api/packs/:id/undo    | Undo last log entry  |

### Consumption Logs

| Method | Path          | Description       |
| ------ | ------------- | ----------------- |
| PUT    | /api/logs/:id | Edit log quantity |
| DELETE | /api/logs/:id | Delete log entry  |

---

## Sample API Requests

### Create a user

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Raj"}'
```

### Create a bulk pack

```bash
curl -X POST http://localhost:8080/api/packs \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Amul Buttermilk",
    "totalQuantity": 30,
    "totalPrice": 750.00,
    "purchaseDate": "2026-03-30",
    "participantIds": [1, 2, 3]
  }'
```

### Log consumption

```bash
curl -X POST http://localhost:8080/api/packs/1/consume \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "quantity": 2}'
```

---

## Database Schema

```sql
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE bulk_packs (
  id            BIGSERIAL PRIMARY KEY,
  product_name  VARCHAR NOT NULL,
  total_quantity INT NOT NULL,
  total_price   NUMERIC(10,2) NOT NULL,
  purchase_date DATE NOT NULL,
  status        VARCHAR NOT NULL DEFAULT 'ACTIVE',
  created_at    TIMESTAMP NOT NULL
);

CREATE TABLE pack_participants (
  pack_id BIGINT REFERENCES bulk_packs(id),
  user_id BIGINT REFERENCES users(id),
  PRIMARY KEY (pack_id, user_id)
);

CREATE TABLE consumption_logs (
  id        BIGSERIAL PRIMARY KEY,
  pack_id   BIGINT REFERENCES bulk_packs(id),
  user_id   BIGINT REFERENCES users(id),
  quantity  INT NOT NULL,
  logged_at TIMESTAMP NOT NULL
);
```

---

## Features

- ✅ Create & manage users (up to 10)
- ✅ Create bulk packs with product, quantity, price, participants
- ✅ Log consumption with +1, +2, +5, or custom quantity
- ✅ Auto-complete when total consumed reaches total quantity
- ✅ Per-user cost calculation and settlement summary
- ✅ Undo last entry, edit and delete log entries
- ✅ Active pack dashboard with progress bar
- ✅ Completed packs history
- ✅ Mobile-friendly dark UI
- ✅ Auto-polling for real-time updates (8s interval)
