namespace EmployeeTracker.Api.Contracts;

public record ActivityResponse(DateTime CreatedAt, string Type, string Message);
