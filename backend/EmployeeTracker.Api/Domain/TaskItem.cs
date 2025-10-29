namespace EmployeeTracker.Api.Domain;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int AssignedToEmployeeId { get; set; }
    public Employee AssignedTo { get; set; } = null!;
}
