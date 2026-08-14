using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Requests;

public class UpdateTaskRequest
{
    [Required]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}
