namespace EmployeeTracker.Api.Contracts;

public record ProfileResponse(
    int UserId,
    string Email,
    string Role,
    int? EmployeeId,
    string? FirstName,
    string? LastName,
    string? Title
);
