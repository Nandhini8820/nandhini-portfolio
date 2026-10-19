namespace Portfolio.Api.Models;

/// <summary>A message sent from the portfolio's contact form. Limits match frontend/src/lib/validation.ts.</summary>
public sealed class ContactRequest
{
    [TextField("Name", minLength: 2, maxLength: 100)]
    public string? Name { get; set; }

    [EmailField]
    public string? Email { get; set; }

    [TextField("Company", minLength: 0, maxLength: 120, required: false)]
    public string? Company { get; set; }

    [TextField("Message", minLength: 20, maxLength: 4000)]
    public string? Message { get; set; }

    /// <summary>Honeypot field. Hidden from people; bots tend to fill it in.</summary>
    public string? Website { get; set; }
}

/// <summary>A validated, trimmed contact message ready for delivery.</summary>
public sealed record ContactMessage(
    string Id,
    string Name,
    string Email,
    string? Company,
    string Message,
    DateTimeOffset ReceivedAt);

public sealed record ContactResponse(string Id, string Message);
