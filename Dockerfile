# syntax=docker/dockerfile:1

# ---- Stage 1: build the React frontend ----
FROM node:20-bookworm-slim AS frontend
WORKDIR /app
# Content file is shared by both apps and imported by the frontend build.
COPY content/ ./content/
COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
RUN npm ci
COPY frontend/ ./
# Build the SPA to a local dist/ (the backend stage copies it into wwwroot).
RUN npm run build

# ---- Stage 2: build & publish the .NET API ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend
WORKDIR /src
COPY content/ ./content/
COPY backend/ ./backend/
# Bring in the SPA produced in stage 1 and place it in the API's wwwroot.
COPY --from=frontend /app/frontend/dist ./backend/src/Portfolio.Api/wwwroot
WORKDIR /src/backend
RUN dotnet restore src/Portfolio.Api/Portfolio.Api.csproj
RUN dotnet publish src/Portfolio.Api/Portfolio.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---- Stage 3: runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=backend /app/publish ./
# Persisted contact submissions live here (mount a volume).
RUN mkdir -p /app/App_Data
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    Contact__StorePath=/app/App_Data/contact-messages.jsonl
EXPOSE 8080
# Keep CORS tight by default; a same-origin SPA needs no extra origins.
ENTRYPOINT ["dotnet", "Portfolio.Api.dll"]
