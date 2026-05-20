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

# DEPLOYMENT PROCESS

# Deployment Instructions for Hostinger KVM2 VPS

## Step 1: Fix DNS Records
Your current DNS has an incorrect CNAME record. Update as follows:

**Delete:**
- CNAME record: `www` → `thepowertrainer.cloud` (creates DNS loop)

**Add/Keep:**
- A record: `@` → `195.35.21.215` (keep - points root domain to VPS)
- A record: `www` → `195.35.21.215` (add - www subdomain to VPS)
- A record: `api` → `195.35.21.215` (add - API subdomain to VPS)

After DNS propagation (usually 5-30 mins):
- `thepowertrainer.cloud` → your VPS
- `www.thepowertrainer.cloud` → your VPS  
- `api.thepowertrainer.cloud` → your VPS

**************************************************************
# PRODUCTIO DEPLOYMENT STEPS
***************************************************************

Production deployment Process

## Step 2: Connect to VPS via SSH
```bash
ssh root@195.35.21.215
# (Use your Hostinger VPS password)
```

## Step 3: Install Required Software
```bash
# Update system
apt update && apt upgrade -y

# Install Docker and Docker Compose
apt install -y docker.io docker-compose-plugin

# Verify installation
docker --version
```


## Step 4: Clone Repository and Deploy
```bash
# Create directory for your app
mkdir -p /var/www/thepowertrainer.cloud
cd /var/www/thepowertrainer.cloud

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/proteinapp.git .
git clone https://github.com/FebinAugustine/tpt_prod.git
# OR if using SSH key:
# git clone git@github.com:your-username/proteinapp.git .

# Create .env file and edit
touch .env
nano .env

----------------------------------------------------------------------

## Step 5: Configure Firewall
```bash
# Install UFW if not present
apt install -y ufw

# Allow required ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 27017/tcp # MongoDB (optional - only if needed externally)
ufw allow 6379/tcp  # Redis (optional - only if needed externally)

# Enable firewall
ufw enable
```
----------------------------------------------------------------------
## Step 6: Start the Application
```bash
### Build and start all containers
docker compose up -d --build

### Check that services are running
docker compose ps

### View logs to verify startup
docker compose logs -f --tail=50


## Additional Steps If Needed
### 1. Stop and completely remove the current containers
docker compose down --remove-orphans

### 2. Force a rebuild of the frontend and backend without using image cache
docker compose build --no-cache frontend backend

### 3. Start the stack back up in detached mode
docker compose up -d
```

----------------------------------------------------------------------
## Troubleshooting

**If site doesn't load:**
```bash
# Check container logs
docker compose logs frontend
docker compose logs backend
docker compose logs traefik

# Test ports from inside container
docker-compose exec frontend curl -s http://localhost:3000 | head -5
docker-compose exec backend curl -s http://localhost:5000/api | head -5

# Check Traefik configuration
docker-compose logs traefik | grep -i error
```
------------------------------------------------------------------
**If SSL certificate issues:**
```bash
## acme issue resolve 
### 1. Stop the running containers
docker compose down
or
docker compose down -v

### 2. Delete the accidental 'acme.json' directory created by Docker
sudo rm -rf ./acme.json
### 3. Create a fresh, empty 'acme.json' file
touch ./acme.json
### 4. Apply the strict read/write permissions to the new file
chmod 600 ./acme.json

rm -f acme.json && touch acme.json && chmod 600 acme.json
```

----------------------------------------------------------------------

## Redis memmory fix:
```bash
### 1. Apply the fix immediately to the live system
sudo sysctl vm.overcommit_memory=1
### 2. Save it so it stays fixed if the server ever reboots
echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf
### Check
cat /proc/sys/vm/overcommit_memory
```

*************************************************************
## Step 7: Verify Deployment
### After DNS propagation:
1. Visit: `https://thepowertrainer.cloud` (should show frontend)
2. Visit: `https://api.thepowertrainer.cloud` (should show NestJS API)
3. Visit: `https://api.thepowertrainer.cloud/docs` (Swagger docs - dev only)
4. Check SSL certificate (padlock icon in browser)

## Step 8: Optional - Set up Auto-Renewal & Monitoring
```bash
# Set up automatic container restart policies (already in compose)
# Set up log rotation if needed
# Consider setting up monitoring with tools like:
# - docker stats (basic monitoring)
# - ctop (container top-like interface)
# - Add healthchecks to docker-compose.yml if needed
```
-------------------------------------------------------------------

```bash
# Enter a container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Backup MongoDB (run periodically)
docker exec mongodb mongodump --username=$MONGO_ROOT_USER --password=$MONGO_ROOT_PASSWORD --authenticationDatabase=admin --archive=/backup/mongodb-$(date +%F).archive
```

## The application will be available at:
- **Frontend:** https://thepowertrainer.cloud
- **API:** https://api.thepowertrainer.cloud  
- **Documentation:** https://api.thepowertrainer.cloud/docs (only in non-production)

# 1. Bring down the entire application network and destroy stuck volume bindings
docker compose down --volumes --remove-orphans

# 2. Delete Docker's internal compiler caches for the backend service completely
docker builder prune -a -f

# 3. Force Docker to rebuild your TypeScript files into JavaScript from scratch
docker compose build --no-cache backend

# 4. Spin up the entire infrastructure freshly in detached mode
docker compose up -d --force-recreate