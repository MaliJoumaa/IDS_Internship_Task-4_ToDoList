using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Requests;

public class DeleteTaskRequest
{
    [Required]
    public Guid Id { get; set; }
}
