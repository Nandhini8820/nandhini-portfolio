using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class ContactServiceTests
{
    [Fact]
    public async Task ValidMessage_IsDeliveredToEveryChannel()
    {
        var log = new RecordingNotifier("log", isDurable: false);
        var file = new RecordingNotifier("file", isDurable: true);
        var service = TestData.CreateService(log, file);

        var result = await service.SubmitAsync(TestData.ValidRequest(), CancellationToken.None);

        Assert.Equal(ContactSubmissionStatus.Accepted, result.Status);
        Assert.Single(log.Received);
        var delivered = Assert.Single(file.Received);
        Assert.Equal(result.Id, delivered.Id);
        Assert.Equal(TestData.Now, delivered.ReceivedAt);
    }

    [Fact]
    public async Task Fields_AreTrimmedAndWhitespaceCollapsed()
    {
        var file = new RecordingNotifier("file", isDurable: true);
        var service = TestData.CreateService(file);
        var request = TestData.ValidRequest();
        request.Name = "  Priya \n  Raman ";
        request.Email = " priya@example.com ";
        request.Company = "   ";

        await service.SubmitAsync(request, CancellationToken.None);

        var delivered = Assert.Single(file.Received);
        Assert.Equal("Priya Raman", delivered.Name);
        Assert.Equal("priya@example.com", delivered.Email);
        Assert.Null(delivered.Company);
    }

    [Fact]
    public async Task FilledHoneypot_IsIgnoredWithoutDelivery()
    {
        var file = new RecordingNotifier("file", isDurable: true);
        var service = TestData.CreateService(file);
        var request = TestData.ValidRequest();
        request.Website = "https://spam.example";

        var result = await service.SubmitAsync(request, CancellationToken.None);

        Assert.Equal(ContactSubmissionStatus.Ignored, result.Status);
        Assert.Empty(file.Received);
    }

    [Fact]
    public async Task AllDurableChannelsFailing_ReportsDeliveryFailed()
    {
        var log = new RecordingNotifier("log", isDurable: false);
        var smtp = new RecordingNotifier("smtp", isDurable: true, shouldFail: true);
        var service = TestData.CreateService(log, smtp);

        var result = await service.SubmitAsync(TestData.ValidRequest(), CancellationToken.None);

        Assert.Equal(ContactSubmissionStatus.DeliveryFailed, result.Status);
        Assert.Single(log.Received);
    }

    [Fact]
    public async Task OneDurableChannelSucceeding_IsEnough()
    {
        var smtp = new RecordingNotifier("smtp", isDurable: true, shouldFail: true);
        var file = new RecordingNotifier("file", isDurable: true);
        var service = TestData.CreateService(smtp, file);

        var result = await service.SubmitAsync(TestData.ValidRequest(), CancellationToken.None);

        Assert.Equal(ContactSubmissionStatus.Accepted, result.Status);
        Assert.Single(file.Received);
    }

    [Fact]
    public async Task OnlyLogging_StillAccepts()
    {
        var log = new RecordingNotifier("log", isDurable: false);
        var service = TestData.CreateService(log);

        var result = await service.SubmitAsync(TestData.ValidRequest(), CancellationToken.None);

        Assert.Equal(ContactSubmissionStatus.Accepted, result.Status);
    }

    [Theory]
    [InlineData("  a   b  ", "a b")]
    [InlineData("line\r\nbreak", "line break")]
    [InlineData(null, "")]
    public void Normalize_CollapsesWhitespace(string? input, string expected)
    {
        Assert.Equal(expected, ContactService.Normalize(input));
    }
}
