using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Appends each message as one JSON line. Suitable for local use and single-instance hosting.
/// For multi-instance production hosting, replace with durable storage (see README).
/// </summary>
public sealed class FileContactStore : IContactNotifier
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly string _filePath;

    public FileContactStore(string filePath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(filePath);
        _filePath = filePath;
    }

    public string Name => "file";

    public bool IsDurable => true;

    public async Task NotifyAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        var line = JsonSerializer.Serialize(message, SerializerOptions) + Environment.NewLine;

        await _gate.WaitAsync(cancellationToken);
        try
        {
            var directory = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            await File.AppendAllTextAsync(_filePath, line, cancellationToken);
        }
        finally
        {
            _gate.Release();
        }
    }
}
