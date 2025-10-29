using EmployeeTracker.Api.Contracts;
using EmployeeTracker.Api.Data;
using EmployeeTracker.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EmployeeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
	private readonly AppDbContext _db;

	public ProfileController(AppDbContext db)
	{
		_db = db;
	}

	[HttpGet]
	public async Task<ActionResult<ProfileResponse>> Get()
	{
		var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("sub");
		if (string.IsNullOrWhiteSpace(userIdStr)) return Forbid();
		var userId = int.Parse(userIdStr);

		var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
		if (user == null) return NotFound();

		if (user.Role == UserRole.Employee)
		{
			var emp = await _db.Employees.Include(e => e.User).FirstOrDefaultAsync(e => e.UserId == user.Id);
			if (emp == null)
			{
				return new ProfileResponse(user.Id, user.Email, user.Role.ToString(), null, null, null, null);
			}
			return new ProfileResponse(user.Id, user.Email, user.Role.ToString(), emp.Id, emp.FirstName, emp.LastName, emp.Title);
		}
		else
		{
			return new ProfileResponse(user.Id, user.Email, user.Role.ToString(), null, null, null, null);
		}
	}
}
