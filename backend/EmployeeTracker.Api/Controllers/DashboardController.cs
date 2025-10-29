using EmployeeTracker.Api.Contracts;
using EmployeeTracker.Api.Data;
using EmployeeTracker.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardSummaryResponse>> Get()
    {
        var role = User.IsInRole(nameof(UserRole.Manager)) ? nameof(UserRole.Manager) : nameof(UserRole.Employee);

        int pending, inProgress, completed;

        if (role == nameof(UserRole.Manager))
        {
            pending = await _db.Tasks.CountAsync(t => t.Status == EmployeeTracker.Api.Domain.TaskStatus.Pending);
            inProgress = await _db.Tasks.CountAsync(t => t.Status == EmployeeTracker.Api.Domain.TaskStatus.InProgress);
            completed = await _db.Tasks.CountAsync(t => t.Status == EmployeeTracker.Api.Domain.TaskStatus.Completed);
        }
        else
        {
            var empIdStr = User.Claims.FirstOrDefault(c => c.Type == "employeeId")?.Value;
            if (string.IsNullOrWhiteSpace(empIdStr))
            {
                return Forbid();
            }
            var empId = int.Parse(empIdStr);
            pending = await _db.Tasks.CountAsync(t => t.AssignedToEmployeeId == empId && t.Status == EmployeeTracker.Api.Domain.TaskStatus.Pending);
            inProgress = await _db.Tasks.CountAsync(t => t.AssignedToEmployeeId == empId && t.Status == EmployeeTracker.Api.Domain.TaskStatus.InProgress);
            completed = await _db.Tasks.CountAsync(t => t.AssignedToEmployeeId == empId && t.Status == EmployeeTracker.Api.Domain.TaskStatus.Completed);
        }

        var total = pending + inProgress + completed;
        return Ok(new DashboardSummaryResponse(role, pending, inProgress, completed, total));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<ActivityResponse>>> Recent([FromQuery] int take = 10)
    {
        try
        {
            var isManager = User.IsInRole(nameof(UserRole.Manager));
            IQueryable<Activity> query = _db.Activities.OrderByDescending(a => a.CreatedAt);
            if (!isManager)
            {
                var empIdStr = User.Claims.FirstOrDefault(c => c.Type == "employeeId")?.Value;
                if (string.IsNullOrWhiteSpace(empIdStr)) return Forbid();
                var empId = int.Parse(empIdStr);
                query = query.Where(a => a.EmployeeId == empId).OrderByDescending(a => a.CreatedAt);
            }
            take = Math.Clamp(take, 1, 50);
            var items = await query.Take(take)
                .Select(a => new ActivityResponse(a.CreatedAt, a.Type.ToString(), a.Message))
                .ToListAsync();
            return Ok(items);
        }
        catch
        {
            // If Activities table doesn't exist yet, return empty list gracefully
            return Ok(Array.Empty<ActivityResponse>());
        }
    }
}
