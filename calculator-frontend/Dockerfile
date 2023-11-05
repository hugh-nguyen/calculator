# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM node:14-alpine as build

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Build the app for production.
RUN npm run build

# Use the official nginx image for a production web server.
# https://hub.docker.com/_/nginx
FROM nginx:stable-alpine

# Copy static assets from builder stage.
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to the Docker host, so we can access it
# from the outside.
EXPOSE 80

# The base image runs nginx with CMD ["nginx", "-g", "daemon off;"],
# so we don't need to add a CMD instruction.
