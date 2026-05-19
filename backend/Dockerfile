# --- STAGE 1: Build Phase ---
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for Nest CLI build compilation)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate the optimized production build (creates the transpiled 'dist' directory)
RUN npm run build

# --- STAGE 2: Secure Production Phase ---
FROM node:22-alpine AS production

# Install tini to handle Linux kernel signals and process terminations gracefully
RUN apk add --no-cache tini

WORKDIR /usr/src/app

# Enforce standard Node production optimization flags
ENV NODE_ENV=production

# Drop root privileges early to execute the installation within a low-privilege sandbox account
USER node

# Copy only production runtime dependencies with the correct user ownership immediately
COPY --from=builder --chown=node:node /usr/src/app/package*.json ./

# Run npm ci (it will naturally create files owned by 'node' with zero overhead)
RUN npm ci --omit=dev

# Copy the transpiled javascript from the build stage with correct ownership
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Expose internal proxy routing port
EXPOSE 5000

# Use tini as the entrypoint wrapper to intercept and clean up zombie processes on PID 1
ENTRYPOINT ["/sbin/tini", "--"]

# Execute the entry point application using vanilla node directly
CMD ["node", "dist/main.js"]
