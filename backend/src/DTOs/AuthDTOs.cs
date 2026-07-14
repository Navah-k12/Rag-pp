using System.ComponentModel.DataAnnotations;

namespace StudyRAG.Api.DTOs;

public record RegisterRequest(
    [Required, MaxLength(100)] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(
    Guid Id,
    string Name,
    string Email,
    string Token,
    DateTime ExpiresAt
);
