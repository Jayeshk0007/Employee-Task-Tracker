using EmployeeTracker.Api.Contracts;
using EmployeeTracker.Api.Data;
using EmployeeTracker.Api.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EmployeeTracker.Api.Domain;

namespace EmployeeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.Include(u => u.Employee).SingleOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized();
        }

        var token = _tokenService.CreateToken(user, user.Employee?.Id);
        return Ok(new LoginResponse(token, user.Role.ToString(), user.Email, user.Employee?.Id));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Role))
            return BadRequest("Email, password, and role are required");

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict("Email already exists");

        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role))
            return BadRequest("Invalid role. Allowed: Manager, Employee");

        var user = new User
        {
            Email = request.Email.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role
        };

        if (role == UserRole.Employee)
        {
            if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
                return BadRequest("FirstName and LastName are required for Employee role");

            var emp = new Employee
            {
                FirstName = request.FirstName!.Trim(),
                LastName = request.LastName!.Trim(),
                Title = string.IsNullOrWhiteSpace(request.Title) ? null : request.Title!.Trim(),
                User = user
            };
            _db.Employees.Add(emp);
        }
        else
        {
            _db.Users.Add(user);
        }

        await _db.SaveChangesAsync();

        var token = _tokenService.CreateToken(user, user.Employee?.Id);
        return Ok(new LoginResponse(token, user.Role.ToString(), user.Email, user.Employee?.Id));
    }
}
