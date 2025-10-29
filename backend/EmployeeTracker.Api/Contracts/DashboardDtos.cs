namespace EmployeeTracker.Api.Contracts;

public record DashboardSummaryResponse(
    string Role,
    int Pending,
    int InProgress,
    int Completed,
    int Total
);
