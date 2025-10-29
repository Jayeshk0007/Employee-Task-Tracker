namespace EmployeeTracker.Api.Contracts;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Role, string Email, int? EmployeeId);

public record RegisterRequest(
	string Email,
	string Password,
	string Role, // "Manager" or "Employee"
	string? FirstName,
	string? LastName,
	string? Title
);
