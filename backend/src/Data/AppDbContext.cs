using Microsoft.EntityFrameworkCore;
using StudyRAG.Api.Models;

namespace StudyRAG.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(200);
            e.Property(u => u.Name).HasMaxLength(100);
            e.Property(u => u.PasswordHash).HasMaxLength(500);
        });
    }
}
