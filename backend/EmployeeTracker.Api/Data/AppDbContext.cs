using EmployeeTracker.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace EmployeeTracker.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Activity> Activities => Set<Activity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<Employee>(e =>
        {
            e.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
            e.Property(x => x.LastName).IsRequired().HasMaxLength(100);
            e.HasOne(x => x.User)
                .WithOne(u => u.Employee!)
                .HasForeignKey<Employee>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskItem>(e =>
        {
            e.Property(x => x.Title).IsRequired().HasMaxLength(200);
            e.HasOne(x => x.AssignedTo)
                .WithMany(emp => emp.Tasks)
                .HasForeignKey(x => x.AssignedToEmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Activity>(e =>
        {
            e.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            e.Property(x => x.Type).IsRequired();
            e.Property(x => x.Message).IsRequired().HasMaxLength(512);
        });
    }
}
