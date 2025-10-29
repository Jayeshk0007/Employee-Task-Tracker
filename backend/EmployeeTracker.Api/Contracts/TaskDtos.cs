namespace EmployeeTracker.Api.Contracts;

public record TaskCreateRequest(string Title, string? Description, int AssignedToEmployeeId);
public record TaskUpdateStatusRequest(EmployeeTracker.Api.Domain.TaskStatus Status);
public record TaskResponse(int Id, string Title, string? Description, EmployeeTracker.Api.Domain.TaskStatus Status, int AssignedToEmployeeId);
