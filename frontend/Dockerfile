# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Force cache bust by changing order
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm install

# Copy source code AFTER installing deps
COPY . .

# Build the app (includes Tailwind compilation)
# Force rebuild - cache bust v10
RUN npm run build --production

# Production stage with nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Copy updated nginx config (removes backend proxy for Railway)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]