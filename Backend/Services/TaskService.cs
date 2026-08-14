using Backend.Domain;
using Backend.DTOs.Requests;
using Backend.DTOs.Responses;
using Backend.Interfaces.IRepository;
using Backend.Interfaces.IService;

namespace Backend.Services;

public class TaskService(ITaskRepository repository) : ITaskService
{
    private readonly ITaskRepository _repository = repository;

    public async Task<TaskResponse?> GetTaskByIdAsync(Guid id)
    {
        var task = await _repository.GetTaskByIdAsync(id);

        return task == null ? null : ToResponse(task);
    }

    public async Task<IEnumerable<TaskResponse>> GetAllTasksAsync(bool? isCompleted = null)
    {
        var tasks = await _repository.GetAllTasksAsync(isCompleted);

        return tasks.Select(ToResponse).ToList();
    }

    public async Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request)
    {
        var now = DateTime.UtcNow;

        var task = new TaskEntity
        {
            Title = request.Title,
            Description = request.Description,
            CreatedAt = now,
            UpdatedAt = now,
            IsCompleted = false
        };

        var created = await _repository.CreateTaskAsync(task);

        return ToResponse(created);
    }

    public async Task<TaskResponse?> UpdateTaskAsync(UpdateTaskRequest request)
    {
        var task = await _repository.GetTaskByIdAsync(request.Id);

        if (task == null)
        {
            return null;
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.IsCompleted = request.IsCompleted;
        task.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateTaskAsync(task);

        return updated == null ? null : ToResponse(updated);
    }

    public async Task<bool> DeleteTaskAsync(DeleteTaskRequest request)
    {
        var task = await _repository.GetTaskByIdAsync(request.Id);

        if (task == null)
        {
            return false;
        }

        return await _repository.DeleteTaskAsync(task);
    }

    private static TaskResponse ToResponse(TaskEntity task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            // MySQL returns DateTimes with Kind=Unspecified, which serializes without the
            // trailing "Z" and is then parsed as *local* time by the browser. These values
            // are always stored as UTC, so say so explicitly.
            CreatedAt = DateTime.SpecifyKind(task.CreatedAt, DateTimeKind.Utc),
            UpdatedAt = DateTime.SpecifyKind(task.UpdatedAt, DateTimeKind.Utc),
            IsCompleted = task.IsCompleted
        };
    }
}
