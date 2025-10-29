namespace EmployeeTracker.Api.Domain;

public enum ActivityType
{
    TaskCreated = 1,
    TaskStatusUpdated = 2,
    TaskDeleted = 3
}

public class Activity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ActivityType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public int? TaskId { get; set; }
    public int? EmployeeId { get; set; }
}
