# ============================
# 1. Build React App (Vite)
# ============================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json + package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source (bao gồm .env.production)
COPY . .

# Build-time arguments
ARG VITE_API_BASE_URL=VITE_API_BASE_URL_PLACEHOLDER
ARG VITE_CUSTOMER_SERVICE_URL=VITE_CUSTOMER_SERVICE_URL_PLACEHOLDER

# Set environment variables for Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CUSTOMER_SERVICE_URL=$VITE_CUSTOMER_SERVICE_URL

# Build với mode production (sẽ tự động đọc .env.production)
RUN npm run build

# ============================
# 2. Serve với Nginx
# ============================
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy start script for dynamic PORT
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]