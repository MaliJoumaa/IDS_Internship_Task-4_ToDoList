using Backend.DTOs.Requests;
using Backend.DTOs.Responses;
using Backend.Interfaces.IService;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controller;

[ApiController]
[Route("api/tasks")]
public class TaskController(ITaskService service) : ControllerBase
{
    private readonly ITaskService _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetAllTasks([FromQuery] bool? isCompleted)
    {
        var tasks = await _service.GetAllTasksAsync(isCompleted);

        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> GetTaskById(Guid id)
    {
        var task = await _service.GetTaskByIdAsync(id);

        if (task == null)
        {
            return NotFound();
        }

        return Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask(CreateTaskRequest request)
    {
        var created = await _service.CreateTaskAsync(request);

        return CreatedAtAction(nameof(GetTaskById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(Guid id, UpdateTaskRequest request)
    {
        if (id != request.Id)
        {
            return BadRequest("The id in the route does not match the id in the body.");
        }

        var updated = await _service.UpdateTaskAsync(request);

        if (updated == null)
        {
            return NotFound();
        }

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var deleted = await _service.DeleteTaskAsync(new DeleteTaskRequest { Id = id });

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
