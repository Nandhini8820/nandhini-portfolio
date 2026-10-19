using System.Text.Json;
using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

/// <summary>
/// Reads the portfolio from a JSON file once and serves it from memory.
/// A database would add cost without benefit: the content changes only when the site is redeployed.
/// </summary>
public sealed class JsonPortfolioRepository : IPortfolioRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
    };

    private readonly Lazy<PortfolioContent> _content;

    public JsonPortfolioRepository(string filePath)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(filePath);
        _content = new Lazy<PortfolioContent>(() => Load(filePath), LazyThreadSafetyMode.ExecutionAndPublication);
    }

    public PortfolioContent GetContent() => _content.Value;

    public Project? FindProject(string id) =>
        GetContent().Projects.FirstOrDefault(p => string.Equals(p.Id, id, StringComparison.OrdinalIgnoreCase));

    internal static PortfolioContent Parse(string json)
    {
        var content = JsonSerializer.Deserialize<PortfolioContent>(json, SerializerOptions)
            ?? throw new InvalidOperationException("Portfolio content is empty.");

        if (content.Profile is null || string.IsNullOrWhiteSpace(content.Profile.Name))
        {
            throw new InvalidOperationException("Portfolio content must include a profile with a name.");
        }

        // Normalize optional collections so callers never receive null.
        return content with
        {
            Skills = content.Skills ?? [],
            Experience = content.Experience ?? [],
            Projects = content.Projects ?? [],
            Recognition = content.Recognition ?? [],
            Education = content.Education ?? [],
            FamiliarWith = content.FamiliarWith ?? new FamiliarWith(string.Empty, string.Empty, []),
        };
    }

    private static PortfolioContent Load(string filePath)
    {
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException(
                $"Portfolio content file was not found at '{filePath}'. Check the Content:Path setting.", filePath);
        }

        return Parse(File.ReadAllText(filePath));
    }
}
