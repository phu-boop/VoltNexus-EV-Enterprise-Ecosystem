# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build-time arguments
ARG VITE_API_BASE_URL=VITE_API_BASE_URL_PLACEHOLDER
ARG VITE_RECAPTCHA_SITE_KEY=VITE_RECAPTCHA_SITE_KEY_PLACEHOLDER

# Set environment variables for Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built assets from builder stage
COPY --from=builder /app/dist .

# Copy custom nginx configuration if needed (optional but recommended for SPA)
# If you don't have a custom nginx.conf, you can create one or rely on default, 
# but for SPA routing (React Router), a custom conf is usually needed.
# For now, we'll use a simple inline configuration trick or just default.
# A better approach is to add a simple nginx.conf.

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy start script for dynamic PORT
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
