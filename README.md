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

## GitHub + Azure App Service (quick guide)

This repo can be deployed to Azure App Service using GitHub Actions. The project contains a sample GitHub Actions workflow that will build the Angular frontend, copy its production output into the API `wwwroot`, build/publish the API and deploy the result to an Azure Web App.

High-level steps:

1. Create a GitHub repository and push this project (see "Quick Git + GitHub steps" above).
2. In the Azure Portal create an App Service (Windows or Linux) configured for .NET 8.
3. In the App Service 'Overview' pane click "Get publish profile" and download the `.PublishSettings` file.
4. In your GitHub repo go to Settings → Secrets → Actions and add a secret named `AZURE_WEBAPP_PUBLISH_PROFILE` with the full contents of the publish profile XML file.
5. Push to the `main` branch — the `deploy-azure.yml` workflow will run and deploy the app.

If you prefer separate hosting (frontend + backend) you can modify the workflow to deploy the frontend to Azure Static Web Apps or another hosting target.

If you want, I can:

- Create the GitHub Actions workflow file for you (build + deploy both projects into a single App Service)
- Or create two separate workflows (API -> App Service, frontend -> Static Web Apps)
