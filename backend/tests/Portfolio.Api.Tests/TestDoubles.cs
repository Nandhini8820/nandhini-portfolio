using Microsoft.Extensions.Logging.Abstractions;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

internal sealed class RecordingNotifier(string name, bool isDurable, bool shouldFail = false) : IContactNotifier
{
    public List<ContactMessage> Received { get; } = [];

    public string Name => name;

    public bool IsDurable => isDurable;

    public Task NotifyAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        if (shouldFail)
        {
            throw new InvalidOperationException($"{name} is unavailable");
        }

        Received.Add(message);
        return Task.CompletedTask;
    }
}

internal sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => now;
}

internal sealed class StubContactService(ContactSubmissionStatus status) : IContactService
{
    public ContactRequest? LastRequest { get; private set; }

    public Task<ContactSubmissionResult> SubmitAsync(ContactRequest request, CancellationToken cancellationToken)
    {
        LastRequest = request;
        return Task.FromResult(new ContactSubmissionResult(status, "test-id"));
    }
}

internal static class TestData
{
    public static readonly DateTimeOffset Now = new(2026, 10, 19, 9, 30, 0, TimeSpan.Zero);

    public static ContactRequest ValidRequest() => new()
    {
        Name = "Priya Raman",
        Email = "priya@example.com",
        Company = "Example Corp",
        Message = "Hi Nandhini, I would like to talk about a senior engineer role.",
    };

    public static ContactService CreateService(params IContactNotifier[] notifiers) =>
        new(notifiers, new FixedTimeProvider(Now), NullLogger<ContactService>.Instance);

    /// <summary>
    /// Finds the shared content file: first the copy placed next to the compiled API,
    /// then by walking up from the test output folder to the repository's content folder.
    /// </summary>
    public static string ContentFilePath()
    {
        var copied = Path.Combine(AppContext.BaseDirectory, "Data", "portfolio.json");
        if (File.Exists(copied))
        {
            return copied;
        }

        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            var candidate = Path.Combine(directory.FullName, "content", "portfolio.json");
            if (File.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new FileNotFoundException("Could not locate content/portfolio.json from the test directory.");
    }
}
