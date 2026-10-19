using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

public enum ContactSubmissionStatus
{
    /// <summary>The message was delivered to at least one channel.</summary>
    Accepted,

    /// <summary>The honeypot was filled in; the message was dropped silently.</summary>
    Ignored,

    /// <summary>Every durable channel failed, so the message would be lost.</summary>
    DeliveryFailed,
}

public sealed record ContactSubmissionResult(ContactSubmissionStatus Status, string Id);

public interface IContactService
{
    Task<ContactSubmissionResult> SubmitAsync(ContactRequest request, CancellationToken cancellationToken);
}

public sealed class ContactService(
    IEnumerable<IContactNotifier> notifiers,
    TimeProvider timeProvider,
    ILogger<ContactService> logger) : IContactService
{
    private readonly IReadOnlyList<IContactNotifier> _notifiers = notifiers.ToList();

    public async Task<ContactSubmissionResult> SubmitAsync(ContactRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        var id = Guid.NewGuid().ToString("N");

        if (!string.IsNullOrWhiteSpace(request.Website))
        {
            logger.LogWarning("Contact submission {MessageId} dropped: honeypot field was filled in.", id);
            return new ContactSubmissionResult(ContactSubmissionStatus.Ignored, id);
        }

        var message = new ContactMessage(
            id,
            Normalize(request.Name),
            Normalize(request.Email),
            string.IsNullOrWhiteSpace(request.Company) ? null : Normalize(request.Company),
            (request.Message ?? string.Empty).Trim(),
            timeProvider.GetUtcNow());

        var durableAttempted = 0;
        var durableSucceeded = 0;

        foreach (var notifier in _notifiers)
        {
            if (notifier.IsDurable)
            {
                durableAttempted++;
            }

            try
            {
                await notifier.NotifyAsync(message, cancellationToken);
                if (notifier.IsDurable)
                {
                    durableSucceeded++;
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Contact channel {Channel} failed for message {MessageId}.", notifier.Name, id);
            }
        }

        if (durableAttempted > 0 && durableSucceeded == 0)
        {
            return new ContactSubmissionResult(ContactSubmissionStatus.DeliveryFailed, id);
        }

        return new ContactSubmissionResult(ContactSubmissionStatus.Accepted, id);
    }

    /// <summary>Trims and collapses runs of whitespace so headers and logs stay single-line.</summary>
    internal static string Normalize(string? value) =>
        string.Join(' ', (value ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
}
