using Backend.Data;
using Backend.Domain;
using Backend.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class TaskRepository(AppDbContext context) : ITaskRepository
{
    private readonly AppDbContext _context = context;

    public async Task<TaskEntity?> GetTaskByIdAsync(Guid id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task<IEnumerable<TaskEntity>> GetAllTasksAsync(bool? isCompleted = null)
    {
        var query = _context.Tasks.AsNoTracking();

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<TaskEntity> CreateTaskAsync(TaskEntity task)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<TaskEntity?> UpdateTaskAsync(TaskEntity task)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async Task<bool> DeleteTaskAsync(TaskEntity task)
    {
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return true;
    }
}
