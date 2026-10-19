using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.Extensions.Options;
using Portfolio.Api.Controllers;
using Portfolio.Api.Options;
using Portfolio.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------- Configuration ----------
builder.Services.AddOptions<ContentOptions>().Bind(builder.Configuration.GetSection(ContentOptions.SectionName));
builder.Services.AddOptions<ContactOptions>()
    .Bind(builder.Configuration.GetSection(ContactOptions.SectionName))
    .Validate(o => o.PermitLimitPerMinute > 0, "Contact:PermitLimitPerMinute must be greater than 0.")
    .ValidateOnStart();
builder.Services.AddOptions<SmtpOptions>().Bind(builder.Configuration.GetSection(SmtpOptions.SectionName));
var corsSettings = builder.Configuration.GetSection(CorsSettings.SectionName).Get<CorsSettings>() ?? new CorsSettings();

// ---------- MVC, problem details and validation ----------
builder.Services
    .AddControllers(options =>
    {
        // Report validation errors with the JSON (camelCase) field names the frontend sends.
        options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
    });
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton(TimeProvider.System);

// ---------- CORS: only the configured frontend origins ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsSettings.PolicyName, policy =>
    {
        if (corsSettings.AllowedOrigins.Length > 0)
        {
            policy.WithOrigins(corsSettings.AllowedOrigins)
                .WithMethods("GET", "POST")
                .WithHeaders("Content-Type", "Accept");
        }
    });
});

// ---------- Rate limiting for the contact form ----------
var permitLimit = builder.Configuration.GetValue<int?>($"{ContactOptions.SectionName}:PermitLimitPerMinute") ?? 5;
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(ContactController.RateLimitPolicy, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    options.OnRejected = async (context, cancellationToken) =>
    {
        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Too many messages",
            Detail = "You’ve sent several messages in a short time. Wait a minute and try again.",
        };
        context.HttpContext.Response.Headers.RetryAfter = "60";
        await context.HttpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
    };
});

// ---------- Application services ----------
builder.Services.AddSingleton<IPortfolioRepository>(sp =>
{
    var path = sp.GetRequiredService<IOptions<ContentOptions>>().Value.Path;
    // The content file is copied next to the compiled app, so resolve relative paths from there.
    var fullPath = Path.IsPathRooted(path) ? path : Path.Combine(AppContext.BaseDirectory, path);
    return new JsonPortfolioRepository(fullPath);
});

builder.Services.AddSingleton<IContactNotifier, LoggingContactNotifier>();

var contactOptions = builder.Configuration.GetSection(ContactOptions.SectionName).Get<ContactOptions>() ?? new ContactOptions();
if (contactOptions.StoreSubmissions)
{
    builder.Services.AddSingleton<IContactNotifier>(sp =>
    {
        var env = sp.GetRequiredService<IHostEnvironment>();
        var path = Path.IsPathRooted(contactOptions.StorePath)
            ? contactOptions.StorePath
            : Path.Combine(env.ContentRootPath, contactOptions.StorePath);
        return new FileContactStore(path);
    });
}

var smtpOptions = builder.Configuration.GetSection(SmtpOptions.SectionName).Get<SmtpOptions>() ?? new SmtpOptions();
if (smtpOptions.IsConfigured)
{
    builder.Services.AddSingleton<IContactNotifier, SmtpContactNotifier>();
}

builder.Services.AddScoped<IContactService, ContactService>();

var app = builder.Build();

if (!contactOptions.StoreSubmissions && !smtpOptions.IsConfigured)
{
    app.Logger.LogWarning(
        "No durable contact channel is configured. Messages will only be logged. Configure Smtp or Contact:StoreSubmissions.");
}

// ---------- HTTP pipeline ----------
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseStatusCodePages();

app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers.XContentTypeOptions = "nosniff";
    headers.XFrameOptions = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

// Serves the built React app when it has been copied into wwwroot (single-host deployment).
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors(CorsSettings.PolicyName);
app.UseRateLimiter();

app.MapControllers();
app.MapHealthChecks("/health");

// Unknown API routes return a JSON 404 instead of the React page.
app.Map("/api/{**rest}", (HttpContext context) => Results.Problem(
    statusCode: StatusCodes.Status404NotFound,
    title: "Endpoint not found",
    detail: $"No API endpoint matches '{context.Request.Path}'."));

if (File.Exists(Path.Combine(app.Environment.WebRootPath ?? string.Empty, "index.html")))
{
    app.MapFallbackToFile("index.html");
}

app.Run();

/// <summary>Exposed so integration tests can host the API with WebApplicationFactory.</summary>
public partial class Program;
