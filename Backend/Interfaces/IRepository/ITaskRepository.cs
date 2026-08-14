using Backend.Domain;

namespace Backend.Interfaces.IRepository;

public interface ITaskRepository
{
    Task<TaskEntity?> GetTaskByIdAsync(Guid id);
    Task<IEnumerable<TaskEntity>> GetAllTasksAsync(bool? isCompleted = null);
    Task<TaskEntity> CreateTaskAsync(TaskEntity task);
    Task<TaskEntity?> UpdateTaskAsync(TaskEntity task);
    Task<bool> DeleteTaskAsync(TaskEntity task);
}