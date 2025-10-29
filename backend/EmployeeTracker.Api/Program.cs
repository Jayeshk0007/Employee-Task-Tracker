using System.Text;
using EmployeeTracker.Api.Data;
using EmployeeTracker.Api.Domain;
using EmployeeTracker.Api.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers().AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "EmployeeTracker API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            }, new string[] {}
        }
    });
});

// DbContext (provider switch)
var provider = builder.Configuration["DatabaseProvider"] ?? "SqlServer";
if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
{
    var sqliteConn = builder.Configuration.GetConnectionString("Sqlite") ?? "Data Source=employee-tracker-dev.db";
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite(sqliteConn));
}
else
{
    var conn = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(conn));
}

// JWT settings and auth
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection("Jwt").Bind(jwtSettings);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
    };
});

builder.Services.AddAuthorization();

// CORS (open for dev)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Migrate DB and seed admin/employee
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        var manager = new User
        {
            Email = "manager@demo.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            Role = UserRole.Manager
        };
        var employeeUser = new User
        {
            Email = "employee@demo.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pass@123"),
            Role = UserRole.Employee
        };
        var emp = new Employee
        {
            FirstName = "Demo",
            LastName = "Employee",
            Title = "Engineer",
            User = employeeUser
        };
        db.Users.Add(manager);
        db.Employees.Add(emp);
        db.SaveChanges();
    }
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
