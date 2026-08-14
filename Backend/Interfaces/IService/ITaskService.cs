using Backend.DTOs.Requests;
using Backend.DTOs.Responses;

namespace Backend.Interfaces.IService;

public interface ITaskService
{
    Task<TaskResponse?> GetTaskByIdAsync(Guid id);
    Task<IEnumerable<TaskResponse>> GetAllTasksAsync(bool? isCompleted = null);
    Task<TaskResponse> CreateTaskAsync(CreateTaskRequest request);
    Task<TaskResponse?> UpdateTaskAsync(UpdateTaskRequest request);
    Task<bool> DeleteTaskAsync(DeleteTaskRequest request);
}
