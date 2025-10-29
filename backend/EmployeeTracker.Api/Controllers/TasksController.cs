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
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Manager))]
    public async Task<ActionResult<TaskResponse>> Create(TaskCreateRequest request)
    {
        var emp = await _db.Employees.FindAsync(request.AssignedToEmployeeId);
        if (emp == null) return BadRequest("Assigned employee not found");
        var t = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            AssignedToEmployeeId = request.AssignedToEmployeeId,
            Status = EmployeeTracker.Api.Domain.TaskStatus.Pending
        };
        _db.Tasks.Add(t);
        await _db.SaveChangesAsync();
        // log activity
        try
        {
            _db.Activities.Add(new Activity
            {
                Type = ActivityType.TaskCreated,
                Message = $"Task '{t.Title}' created and assigned to {emp.FirstName} {emp.LastName} (#{emp.Id})",
                TaskId = t.Id,
                EmployeeId = t.AssignedToEmployeeId
            });
            await _db.SaveChangesAsync();
        }
        catch { /* ignore activity logging failures */ }
        return CreatedAtAction(nameof(GetById), new { id = t.Id }, new TaskResponse(t.Id, t.Title, t.Description, t.Status, t.AssignedToEmployeeId));
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetMyTasks()
    {
        if (User.IsInRole(nameof(UserRole.Manager)))
        {
            var all = await _db.Tasks.Select(t => new TaskResponse(t.Id, t.Title, t.Description, t.Status, t.AssignedToEmployeeId)).ToListAsync();
            return Ok(all);
        }

        var empIdStr = User.Claims.FirstOrDefault(c => c.Type == "employeeId")?.Value;
        if (string.IsNullOrEmpty(empIdStr)) return Forbid();
        int empId = int.Parse(empIdStr);
        var mine = await _db.Tasks.Where(t => t.AssignedToEmployeeId == empId)
            .Select(t => new TaskResponse(t.Id, t.Title, t.Description, t.Status, t.AssignedToEmployeeId)).ToListAsync();
        return Ok(mine);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<TaskResponse>> GetById(int id)
    {
        var t = await _db.Tasks.FindAsync(id);
        if (t == null) return NotFound();

        if (!User.IsInRole(nameof(UserRole.Manager)))
        {
            var empIdStr = User.Claims.FirstOrDefault(c => c.Type == "employeeId")?.Value;
            if (string.IsNullOrEmpty(empIdStr)) return Forbid();
            if (t.AssignedToEmployeeId != int.Parse(empIdStr)) return Forbid();
        }
    return new TaskResponse(t.Id, t.Title, t.Description, t.Status, t.AssignedToEmployeeId);
    }

    [HttpPut("{id:int}/status")]
    [Authorize]
    public async Task<ActionResult<TaskResponse>> UpdateStatus(int id, TaskUpdateStatusRequest request)
    {
        var t = await _db.Tasks.FindAsync(id);
        if (t == null) return NotFound();

        // Policy: Managers cannot change status; only the assigned employee may update
        if (User.IsInRole(nameof(UserRole.Manager)))
        {
            return Forbid();
        }

        // Employees can only update their own assigned tasks
        var empIdStr = User.Claims.FirstOrDefault(c => c.Type == "employeeId")?.Value;
        if (string.IsNullOrEmpty(empIdStr)) return Forbid();
        if (t.AssignedToEmployeeId != int.Parse(empIdStr)) return Forbid();
        t.Status = request.Status;
        await _db.SaveChangesAsync();
        // log activity
        try
        {
            _db.Activities.Add(new Activity
            {
                Type = ActivityType.TaskStatusUpdated,
                Message = $"Task '{t.Title}' status changed to {t.Status}",
                TaskId = t.Id,
                EmployeeId = t.AssignedToEmployeeId
            });
            await _db.SaveChangesAsync();
        }
        catch { /* ignore activity logging failures */ }
        return new TaskResponse(t.Id, t.Title, t.Description, t.Status, t.AssignedToEmployeeId);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Manager))]
    public async Task<IActionResult> Delete(int id)
    {
        var t = await _db.Tasks.FindAsync(id);
        if (t == null) return NotFound();
        _db.Tasks.Remove(t);
        await _db.SaveChangesAsync();
        // log activity
        try
        {
            _db.Activities.Add(new Activity
            {
                Type = ActivityType.TaskDeleted,
                Message = $"Task '{t.Title}' deleted",
                TaskId = t.Id,
                EmployeeId = t.AssignedToEmployeeId
            });
            await _db.SaveChangesAsync();
        }
        catch { /* ignore activity logging failures */ }
        return NoContent();
    }
}
