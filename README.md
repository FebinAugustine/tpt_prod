# The Power Trainer

Protein supplement store application with Next.js frontend and NestJS backend.

## Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript + TailwindCSS
- **Backend:** NestJS 11 + MongoDB + Redis + JWT Auth
- **Deployment:** Docker + Traefik + Let's Encrypt SSL

## Quick Start (Development)

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- Domain pointed to your VPS
- Ports 80 and 443 open

### 1. Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

Required environment variables:
- `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` - MongoDB credentials
- `REDIS_PASSWORD` - Redis password
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `CLOUDINARY_*` - Cloudinary credentials
- `RAZORPAY_*` - Razorpay API keys
- `SMTP_*` - Gmail app password for emails

### 2. Deploy

```bash
# Build and start all containers
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### 3. Access

- **Frontend:** https://thepowertrainer.cloud
- **API:** https://api.thepowertrainer.cloud
- **Swagger Docs:** https://api.thepowertrainer.cloud/docs (non-production only)

## Architecture

```
├── traefik (port 80/443)
│   ├── Routes HTTPS traffic
│   └── Automatic SSL via Let's Encrypt
│
├── frontend (port 3000)
│   ├── Next.js application
│   └── Serves the main website
│
├── backend (port 5000)
│   ├── NestJS API
│   └── Handles auth, products, orders
│
├── mongodb (port 27017)
│   └── Database (internal network only)
│
└── redis (port 6379)
    └── Cache (internal network only)
```

## Environment Variables

### Root `.env` (Docker)

| Variable | Description |
|----------|-------------|
| `DOMAIN_NAME` | Production domain (thepowertrainer.cloud) |
| `LETSENCRYPT_EMAIL` | Email for SSL certificates |
| `MONGO_ROOT_USER/PASSWORD` | MongoDB admin credentials |
| `REDIS_PASSWORD` | Redis authentication |
| `JWT_SECRET/REFRESH_SECRET` | JWT signing secrets |
| `CLOUDINARY_*` | Cloudinary API credentials |
| `RAZORPAY_*` | Razorpay payment keys |
| `SMTP_*` | Email configuration |

### Backend `.env` (Local Development)

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tptappdb
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
LOG_CONSOLE_ENABLED=true
```

## Commands

```bash
# View all logs
docker-compose logs -f

# Stop all containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build --force-recreate

# Access MongoDB shell
docker exec -it mongodb mongosh -u $MONGO_ROOT_USER -p

# View Traefik dashboard
# Add to traefik labels: --api.insecure=true
```

## Production Checklist

- [ ] Replace all placeholder secrets in `.env`
- [ ] Configure MongoDB replica set or external database
- [ ] Configure Cloudinary credentials
- [ ] Configure Razorpay live keys
- [ ] Configure SMTP with app password
- [ ] Point DNS A record to VPS IP
- [ ] Open ports 80/443 in firewall