# Deploy SOPHIA on a Vultr Ubuntu server

This Compose setup runs the Next.js frontend, FastAPI backend, and PostgreSQL on one server. Only the frontend is published to the internet; the API and database stay on the private Docker network.

## 1. Create the server

Create a Vultr Cloud Compute instance with Ubuntu 24.04. Allow inbound SSH (port 22) and HTTP (port 80) in the Vultr firewall. Do not open ports 3000, 5432, or 8000.

## 2. Install Docker and get the project

Connect to the server over SSH, then run:

```bash
sudo apt update
sudo apt install -y git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
```

Log out and reconnect so the Docker group change takes effect. Then clone the repository:

```bash
git clone YOUR_REPOSITORY_URL sophia
cd sophia
```

## 3. Configure and launch

```bash
cp deploy.env.example .env
openssl rand -hex 32
nano .env
```

Paste the generated password as `POSTGRES_PASSWORD`, replace `YOUR_SERVER_IP` in `FRONTEND_ORIGIN` with the server's public IP, and save. Keep `.env` private; never commit it. The Tavily key is optional and is only needed for `/api/research`.

Build and start all services:

```bash
docker compose up -d --build
docker compose ps
```

Open `http://YOUR_SERVER_IP` in a browser. To inspect startup errors:

```bash
docker compose logs --tail=100
```

The sample jobs are seeded automatically when the backend starts. PostgreSQL data persists in the `sophia_pgdata` Docker volume.

## Important limitations

This initial setup uses HTTP. Add a domain and HTTPS before sharing it publicly. The project does not have authentication, so do not enter real candidate data or treat the deployment as a secure production service. Back up the database volume before upgrades or server changes.
