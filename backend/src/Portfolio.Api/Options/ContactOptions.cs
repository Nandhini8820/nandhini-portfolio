namespace Portfolio.Api.Options;

public sealed class ContactOptions
{
    public const string SectionName = "Contact";

    /// <summary>When true, each submission is appended as one JSON line to <see cref="StorePath"/>.</summary>
    public bool StoreSubmissions { get; set; } = true;

    public string StorePath { get; set; } = "App_Data/contact-messages.jsonl";

    /// <summary>Maximum contact submissions per client IP per minute.</summary>
    public int PermitLimitPerMinute { get; set; } = 5;
}

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string ToAddress { get; set; } = string.Empty;

    /// <summary>Email is sent only when the host and both addresses are configured.</summary>
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Host) &&
        !string.IsNullOrWhiteSpace(FromAddress) &&
        !string.IsNullOrWhiteSpace(ToAddress);
}

public sealed class CorsSettings
{
    public const string SectionName = "Cors";
    public const string PolicyName = "Frontend";

    public string[] AllowedOrigins { get; set; } = [];
}

public sealed class ContentOptions
{
    public const string SectionName = "Content";

    public string Path { get; set; } = "Data/portfolio.json";
}
