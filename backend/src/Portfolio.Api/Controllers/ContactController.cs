using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/contact")]
[Produces("application/json")]
public sealed class ContactController(IContactService contactService) : ControllerBase
{
    public const string RateLimitPolicy = "contact";

    /// <summary>
    /// Accepts a contact message. Invalid input returns 400 with field errors
    /// (handled automatically by [ApiController]); too many requests return 429.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicy)]
    [ProducesResponseType<ContactResponse>(StatusCodes.Status202Accepted)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Submit([FromBody] ContactRequest request, CancellationToken cancellationToken)
    {
        var result = await contactService.SubmitAsync(request, cancellationToken);

        return result.Status switch
        {
            // Bots get the same response as people so the honeypot is not revealed.
            ContactSubmissionStatus.Accepted or ContactSubmissionStatus.Ignored =>
                Accepted(new ContactResponse(result.Id, "Thanks for reaching out. Your message has been sent.")),
            _ => Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Message not delivered",
                detail: "Your message couldn’t be delivered right now. Please try again later or email me directly."),
        };
    }
}
