FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Build the app
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
