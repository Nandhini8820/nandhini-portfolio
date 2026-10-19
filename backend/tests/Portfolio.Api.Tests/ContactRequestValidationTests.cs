using System.ComponentModel.DataAnnotations;
using Portfolio.Api.Models;

namespace Portfolio.Api.Tests;

public class ContactRequestValidationTests
{
    private static List<ValidationResult> Validate(ContactRequest request)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(request, new ValidationContext(request), results, validateAllProperties: true);
        return results;
    }

    [Fact]
    public void ValidRequest_HasNoErrors()
    {
        Assert.Empty(Validate(TestData.ValidRequest()));
    }

    [Fact]
    public void CompanyIsOptional()
    {
        var request = TestData.ValidRequest();
        request.Company = null;

        Assert.Empty(Validate(request));
    }

    [Theory]
    [InlineData(null, "Enter your name.")]
    [InlineData("", "Enter your name.")]
    [InlineData("   ", "Enter your name.")]
    [InlineData("A", "Name must be at least 2 characters.")]
    public void InvalidName_ReportsOneClearMessage(string? name, string expected)
    {
        var request = TestData.ValidRequest();
        request.Name = name;

        var error = Assert.Single(Validate(request));
        Assert.Equal(expected, error.ErrorMessage);
        Assert.Contains(nameof(ContactRequest.Name), error.MemberNames);
    }

    [Theory]
    [InlineData("", "Enter your email address.")]
    [InlineData("not-an-email", "Enter a valid email address, like name@example.com.")]
    [InlineData("name@domain", "Enter a valid email address, like name@example.com.")]
    [InlineData("two words@example.com", "Enter a valid email address, like name@example.com.")]
    public void InvalidEmail_ReportsOneClearMessage(string email, string expected)
    {
        var request = TestData.ValidRequest();
        request.Email = email;

        var error = Assert.Single(Validate(request));
        Assert.Equal(expected, error.ErrorMessage);
    }

    [Fact]
    public void ShortMessage_IsRejected()
    {
        var request = TestData.ValidRequest();
        request.Message = "Too short";

        var error = Assert.Single(Validate(request));
        Assert.Equal("Message must be at least 20 characters.", error.ErrorMessage);
    }

    [Fact]
    public void OverlongMessage_IsRejected()
    {
        var request = TestData.ValidRequest();
        request.Message = new string('a', 4001);

        var error = Assert.Single(Validate(request));
        Assert.Equal("Message must be 4000 characters or fewer.", error.ErrorMessage);
    }

    [Fact]
    public void EveryInvalidField_IsReportedTogether()
    {
        var request = new ContactRequest { Name = "", Email = "bad", Message = "short" };

        Assert.Equal(3, Validate(request).Count);
    }
}
