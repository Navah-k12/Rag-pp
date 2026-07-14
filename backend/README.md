# Backend — ASP.NET Core (StudyRAG.Api)

API REST para usuarios, autenticación y lógica de negocio.

## Stack

- .NET 10 / ASP.NET Core
- Entity Framework Core + PostgreSQL (Npgsql)
- JWT Authentication

## PostgreSQL

### Instalar

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install postgresql postgresql-client

# macOS (Homebrew)
brew install postgresql@16 && brew services start postgresql@16

# Docker (más rápido)
docker run -d --name studyrag-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=studyrag \
  -p 5432:5432 \
  postgres:16-alpine
```

### Crear la base de datos

```bash
sudo -u postgres psql -c "CREATE DATABASE studyrag;"
```

## Correr

```bash
cd backend/src
dotnet restore
dotnet build
dotnet run
```

El servidor arranca en `http://localhost:5054` (o el puerto que configure).

## Endpoints

| Método | Ruta             | Descripción               | Auth |
|--------|------------------|---------------------------|------|
| POST   | `/api/auth/register` | Registrar usuario nuevo   | No   |
| POST   | `/api/auth/login`    | Iniciar sesión (JWT)      | No   |
| GET    | `/api/auth/me`       | Obtener usuario actual    | Sí   |

### Ejemplo Register

```bash
curl -X POST http://localhost:5054/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rafa","email":"rafa@test.com","password":"123456"}'
```

### Ejemplo Login

```bash
curl -X POST http://localhost:5054/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rafa@test.com","password":"123456"}'
```

### Ejemplo Me (requiere token)

```bash
curl http://localhost:5054/api/auth/me \
  -H "Authorization: Bearer <TU_TOKEN>"
```

## Configuración

Edita `appsettings.json` para cambiar:
- `ConnectionStrings:Default` — cadena de conexión a PostgreSQL
- `Jwt:Key` — clave secreta para JWT (**cambiar en producción**)
- `Jwt:ExpireHours` — duración del token en horas
