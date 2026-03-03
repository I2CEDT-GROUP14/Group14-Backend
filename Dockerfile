# --- deps stage: install only production dependencies ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# --- final stage: lean runtime image ---
FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5000
CMD ["node", "index.js"]
