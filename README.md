# Employee Task Tracker

A simple full-stack app for managing employees and tasks.

- Backend: .NET 8 Web API + EF Core + JWT Auth
- Frontend: Angular (to be added)
- Database: SQL Server / Azure SQL
- CI: Azure DevOps Pipelines

## Backend: run locally

Prereqs: .NET 8 SDK, SQL Server (local or container), PowerShell.

1. Configure connection string in `backend/EmployeeTracker.Api/appsettings.Development.json` (default uses `(localdb)` for dev).
2. Create and apply EF Core migrations:
   - The first run will auto-create DB using `Database.Migrate()`.
3. Run API:
   - Use `dotnet run` in `backend/EmployeeTracker.Api`.
4. Open Swagger at https://localhost:5001/swagger or http://localhost:5000/swagger.

Default seeded users:
- Manager: `manager@demo.local` / `Pass@123`
- Employee: `employee@demo.local` / `Pass@123`

## Frontend

Angular app will be scaffolded under `frontend/employee-tracker-ui` and configured to use the API URL from environment settings.

## Azure DevOps Pipeline

An `azure-pipelines.yml` is included to build backend and (later) frontend, run tests, and publish artifacts. Add service connections to deploy to Azure App Service if available.

## Modules

- Authentication: JWT-based login for Manager/Employee roles.
- Employee Management: Manager-only CRUD.
- Task Management: Assign and update task status.

## License

MIT