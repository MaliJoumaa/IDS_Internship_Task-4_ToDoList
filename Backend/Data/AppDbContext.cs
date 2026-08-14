using Backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TaskEntity> Tasks => Set<TaskEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TaskEntity>(entity =>
        {
            entity.ToTable("Tasks");

            entity.HasKey(t => t.Id);

            entity.Property(t => t.Id)
                .ValueGeneratedOnAdd();

            entity.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(t => t.Description)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(t => t.CreatedAt)
                .IsRequired();

            entity.Property(t => t.UpdatedAt)
                .IsRequired();

            entity.Property(t => t.IsCompleted)
                .IsRequired()
                .HasDefaultValue(false);

            entity.HasIndex(t => t.IsCompleted);
            entity.HasIndex(t => t.CreatedAt);
        });
    }
}
