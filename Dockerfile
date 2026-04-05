# build
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# produção
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html