using BCrypt.Net;
using EmployeeTracker.Api.Contracts;
using EmployeeTracker.Api.Data;
using EmployeeTracker.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = nameof(UserRole.Manager))]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _db;

    public EmployeesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeResponse>>> GetAll()
    {
        var result = await _db.Employees.Include(e => e.User)
            .Select(e => new EmployeeResponse(e.Id, e.FirstName, e.LastName, e.Title, e.User.Email))
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeResponse>> GetById(int id)
    {
        var e = await _db.Employees.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
        if (e == null) return NotFound();
        return new EmployeeResponse(e.Id, e.FirstName, e.LastName, e.Title, e.User.Email);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeResponse>> Create(EmployeeCreateRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict("Email already exists");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Employee
        };
        var emp = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Title = request.Title,
            User = user
        };
        _db.Employees.Add(emp);
        await _db.SaveChangesAsync();
        var resp = new EmployeeResponse(emp.Id, emp.FirstName, emp.LastName, emp.Title, user.Email);
        return CreatedAtAction(nameof(GetById), new { id = emp.Id }, resp);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeResponse>> Update(int id, EmployeeUpdateRequest request)
    {
        var emp = await _db.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
        if (emp == null) return NotFound();
        emp.FirstName = request.FirstName;
        emp.LastName = request.LastName;
        emp.Title = request.Title;
        await _db.SaveChangesAsync();
        return new EmployeeResponse(emp.Id, emp.FirstName, emp.LastName, emp.Title, emp.User.Email);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var emp = await _db.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == id);
        if (emp == null) return NotFound();
        if (emp.User != null)
        {
            _db.Users.Remove(emp.User);
        }
        else
        {
            _db.Employees.Remove(emp);
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
