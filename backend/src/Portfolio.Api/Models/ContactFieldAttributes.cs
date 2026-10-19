using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Portfolio.Api.Models;

/// <summary>
/// Validates a text field and reports exactly one message per problem, so the form
/// never shows duplicate errors (the built-in Required + StringLength pair can both fire).
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class TextFieldAttribute(string label, int minLength, int maxLength, bool required = true) : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var text = (value as string)?.Trim() ?? string.Empty;
        var members = MemberNames(validationContext);

        if (text.Length == 0)
        {
            return required ? new ValidationResult($"Enter your {label.ToLowerInvariant()}.", members) : ValidationResult.Success;
        }

        if (text.Length < minLength)
        {
            return new ValidationResult($"{label} must be at least {minLength} characters.", members);
        }

        if (text.Length > maxLength)
        {
            return new ValidationResult($"{label} must be {maxLength} characters or fewer.", members);
        }

        return ValidationResult.Success;
    }

    internal static string[]? MemberNames(ValidationContext context) =>
        context.MemberName is null ? null : [context.MemberName];
}

[AttributeUsage(AttributeTargets.Property)]
public sealed partial class EmailFieldAttribute : ValidationAttribute
{
    public const int MaxLength = 254;

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        var text = (value as string)?.Trim() ?? string.Empty;
        var members = TextFieldAttribute.MemberNames(validationContext);

        if (text.Length == 0)
        {
            return new ValidationResult("Enter your email address.", members);
        }

        if (text.Length > MaxLength || !EmailPattern().IsMatch(text))
        {
            return new ValidationResult("Enter a valid email address, like name@example.com.", members);
        }

        return ValidationResult.Success;
    }

    // Deliberately simple: one @, no spaces, a dot in the domain. The same rule runs in the browser.
    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.CultureInvariant)]
    private static partial Regex EmailPattern();
}
