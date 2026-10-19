using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Api.Controllers;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class ContactControllerTests
{
    private static ContactController CreateController(IContactService service)
    {
        var services = new ServiceCollection();
        services.AddSingleton<ProblemDetailsFactory, TestProblemDetailsFactory>();

        return new ContactController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { RequestServices = services.BuildServiceProvider() },
            },
        };
    }

    [Theory]
    [InlineData(ContactSubmissionStatus.Accepted)]
    [InlineData(ContactSubmissionStatus.Ignored)]
    public async Task AcceptedOrIgnored_Returns202WithReference(ContactSubmissionStatus status)
    {
        var controller = CreateController(new StubContactService(status));

        var result = await controller.Submit(TestData.ValidRequest(), CancellationToken.None);

        var accepted = Assert.IsType<AcceptedResult>(result);
        var body = Assert.IsType<ContactResponse>(accepted.Value);
        Assert.Equal("test-id", body.Id);
    }

    [Fact]
    public async Task DeliveryFailure_Returns503Problem()
    {
        var controller = CreateController(new StubContactService(ContactSubmissionStatus.DeliveryFailed));

        var result = await controller.Submit(TestData.ValidRequest(), CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, problem.StatusCode);
    }

    private sealed class TestProblemDetailsFactory : ProblemDetailsFactory
    {
        public override ProblemDetails CreateProblemDetails(
            HttpContext httpContext, int? statusCode = null, string? title = null, string? type = null,
            string? detail = null, string? instance = null) =>
            new() { Status = statusCode, Title = title, Detail = detail };

        public override ValidationProblemDetails CreateValidationProblemDetails(
            HttpContext httpContext, Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary modelStateDictionary,
            int? statusCode = null, string? title = null, string? type = null, string? detail = null, string? instance = null) =>
            new(modelStateDictionary) { Status = statusCode, Title = title, Detail = detail };
    }
}
