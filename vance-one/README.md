# Vance One — Docker deployment demo

This small project demonstrates deploying a Node/Express API and a static client with Docker Compose using an external MongoDB.

Services
- `server` — Express API (port 6666)
- `client` — Nginx-served static UI (port 7777)

Quick start (requires Docker and docker-compose):

1. Copy `.env.example` to `.env` and set `MONGO_URL` to your hosted MongoDB connection string.

```bash
cp .env.example .env
# then edit .env and set MONGO_URL
```

2. Build and start the services (the compose file expects a remote MongoDB):

```bash
docker compose up --build
```

3. Open the client UI: http://localhost:7777

Server API: http://localhost:6666/api/todos

Client features
- Add todos
- Edit todo titles inline
- Toggle completion
- Filter by all, active, or completed
- Search tasks
- Mark all done
- Clear completed

Notes
- The Nginx config proxies `/api` to the `server` container so the browser can use same-origin calls to `/api`.
- Provide a `MONGO_URL` environment variable in `.env` pointing to your hosted MongoDB instance.
