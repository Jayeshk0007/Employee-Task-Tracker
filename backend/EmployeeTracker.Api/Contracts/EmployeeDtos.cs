namespace EmployeeTracker.Api.Contracts;

public record EmployeeCreateRequest(string FirstName, string LastName, string? Title, string Email, string Password);
public record EmployeeUpdateRequest(string FirstName, string LastName, string? Title);
public record EmployeeResponse(int Id, string FirstName, string LastName, string? Title, string Email);
