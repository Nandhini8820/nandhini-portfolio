using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public sealed class ContactChannelTests : IDisposable
{
    private readonly string _directory = Path.Combine(Path.GetTempPath(), "portfolio-tests-" + Guid.NewGuid().ToString("N"));

    private static ContactMessage Message() =>
        new("abc123", "Priya Raman", "priya@example.com", null, "Hello from a test message.", TestData.Now);

    [Fact]
    public async Task FileStore_AppendsOneJsonLinePerMessage()
    {
        var path = Path.Combine(_directory, "nested", "messages.jsonl");
        var store = new FileContactStore(path);

        await store.NotifyAsync(Message(), CancellationToken.None);
        await store.NotifyAsync(Message(), CancellationToken.None);

        var lines = await File.ReadAllLinesAsync(path);
        Assert.Equal(2, lines.Length);
        Assert.Contains("\"email\":\"priya@example.com\"", lines[0]);
    }

    [Fact]
    public void SmtpBody_IncludesSenderDetailsAndMessage()
    {
        var body = SmtpContactNotifier.BuildBody(Message());

        Assert.Contains("Name: Priya Raman", body);
        Assert.Contains("Company: (not given)", body);
        Assert.Contains("Reference: abc123", body);
        Assert.Contains("Hello from a test message.", body);
    }

    public void Dispose()
    {
        if (Directory.Exists(_directory))
        {
            Directory.Delete(_directory, recursive: true);
        }
    }
}
