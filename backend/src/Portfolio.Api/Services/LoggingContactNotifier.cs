using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>Records that a message arrived. Message bodies are not logged to keep personal data out of logs.</summary>
public sealed class LoggingContactNotifier(ILogger<LoggingContactNotifier> logger) : IContactNotifier
{
    public string Name => "log";

    public bool IsDurable => false;

    public Task NotifyAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Contact message {MessageId} received at {ReceivedAt} ({Length} characters).",
            message.Id, message.ReceivedAt, message.Message.Length);
        return Task.CompletedTask;
    }
}
