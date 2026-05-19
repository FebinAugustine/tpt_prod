# --- STAGE 1: Build Phase ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- STAGE 2: Secure Production Phase ---
FROM node:22-alpine AS production

RUN apk add --no-cache tini

# FIX: Create the directory and assign ownership to 'node' BEFORE switching users
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Drop root privileges safely now that the directory permissions are set
USER node

# Copy only production runtime dependencies with the correct user ownership
COPY --from=builder --chown=node:node /usr/src/app/package*.json ./

# Run npm ci (This will now succeed without any permission errors)
RUN npm ci --omit=dev

# Copy the transpiled javascript from the build stage with correct ownership
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

EXPOSE 5000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
