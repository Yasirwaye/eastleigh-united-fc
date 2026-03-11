# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Use npm install instead of npm ci (generates lock file if missing)
RUN npm install

# Copy tailwind config
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copy source code
COPY . .

# Build the app (includes Tailwind compilation)
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy updated nginx config (removes backend proxy for Railway)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]