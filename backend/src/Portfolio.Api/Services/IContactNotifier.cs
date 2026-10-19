using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>A channel that receives contact messages (log, file, email...).</summary>
public interface IContactNotifier
{
    string Name { get; }

    /// <summary>True when the channel keeps the message somewhere a person can read it later.</summary>
    bool IsDurable { get; }

    Task NotifyAsync(ContactMessage message, CancellationToken cancellationToken);
}
