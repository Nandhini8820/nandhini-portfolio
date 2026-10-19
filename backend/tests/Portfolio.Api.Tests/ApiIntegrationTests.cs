using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

/// <summary>Hosts the real API in memory and calls it over HTTP.</summary>
public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly RecordingNotifier _store = new("test-store", isDurable: true);

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
            {
                // Replace file/email delivery so tests never write to disk or send mail.
                services.RemoveAll<IContactNotifier>();
                services.AddSingleton<IContactNotifier>(_store);
            }));
    }

    [Fact]
    public async Task GetPortfolio_ReturnsProfile()
    {
        var client = _factory.CreateClient();

        using var json = JsonDocument.Parse(await client.GetStringAsync("/api/portfolio"));

        Assert.Equal("Nandhini L", json.RootElement.GetProperty("profile").GetProperty("name").GetString());
    }

    [Fact]
    public async Task GetProjects_ReturnsSentinel()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/projects/sentinel");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task UnknownProject_Returns404Problem()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/projects/unknown");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task InvalidContact_Returns400WithCamelCaseFieldErrors()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/contact", new { name = "", email = "bad", message = "short" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var errors = json.RootElement.GetProperty("errors");
        Assert.True(errors.TryGetProperty("name", out _));
        Assert.True(errors.TryGetProperty("email", out _));
        Assert.True(errors.TryGetProperty("message", out _));
    }

    [Fact]
    public async Task ValidContact_Returns202AndDelivers()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/contact", new
        {
            name = "Priya Raman",
            email = "priya@example.com",
            message = "Hi Nandhini, I would like to talk about a senior role.",
        });

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Contains(_store.Received, m => m.Email == "priya@example.com");
    }

    [Fact]
    public async Task UnknownApiRoute_Returns404()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/nothing-here");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Health_ReturnsHealthy()
    {
        var client = _factory.CreateClient();

        Assert.Equal("Healthy", await client.GetStringAsync("/health"));
    }
}
