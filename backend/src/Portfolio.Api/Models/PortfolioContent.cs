namespace Portfolio.Api.Models;

/// <summary>The complete portfolio, deserialized from content/portfolio.json.</summary>
public sealed record PortfolioContent(
    Profile Profile,
    Highlight Highlight,
    IReadOnlyList<SkillGroup> Skills,
    IReadOnlyList<Experience> Experience,
    IReadOnlyList<Project> Projects,
    IReadOnlyList<Recognition> Recognition,
    IReadOnlyList<Education> Education,
    FamiliarWith FamiliarWith);

public sealed record Profile(
    string Name,
    string Title,
    string Headline,
    string Summary,
    IReadOnlyList<string> FocusAreas,
    string Location,
    string Email,
    string? Phone,
    string Linkedin,
    string? Github,
    bool PhoneVisibleOnSite);

public sealed record Highlight(string From, string To, string Caption);

public sealed record FamiliarWith(string Label, string Note, IReadOnlyList<string> Items);

public sealed record SkillGroup(string Category, IReadOnlyList<string> Items);

public sealed record Experience(
    string Id,
    string Company,
    string Role,
    string Location,
    string Start,
    string End,
    IReadOnlyList<string> Highlights);

public sealed record Project(
    string Id,
    string Name,
    string Tagline,
    bool Featured,
    IReadOnlyList<string> Description,
    IReadOnlyList<string> Tech,
    ProjectLinks Links);

public sealed record ProjectLinks(string? Github, string? Demo);

public sealed record Recognition(string Title, string Description);

public sealed record Education(
    string Institution,
    string Degree,
    string Grade,
    string Location,
    string Start,
    string End);
