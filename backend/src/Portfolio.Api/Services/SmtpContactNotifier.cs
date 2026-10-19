using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Portfolio.Api.Models;
using Portfolio.Api.Options;

namespace Portfolio.Api.Services;

/// <summary>
/// Sends each message by email. Registered only when the Smtp section is configured;
/// credentials come from user secrets or environment variables, never from source control.
/// </summary>
public sealed class SmtpContactNotifier(IOptions<SmtpOptions> options) : IContactNotifier
{
    private readonly SmtpOptions _options = options.Value;

    public string Name => "smtp";

    public bool IsDurable => true;

    public async Task NotifyAsync(ContactMessage message, CancellationToken cancellationToken)
    {
        using var mail = new MailMessage(_options.FromAddress, _options.ToAddress)
        {
            Subject = $"Portfolio contact from {message.Name}",
            Body = BuildBody(message),
            IsBodyHtml = false,
        };
        mail.ReplyToList.Add(new MailAddress(message.Email, message.Name));

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.EnableSsl,
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(_options.Username, _options.Password);
        }

        await client.SendMailAsync(mail, cancellationToken);
    }

    internal static string BuildBody(ContactMessage message) =>
        $"""
        Name: {message.Name}
        Email: {message.Email}
        Company: {message.Company ?? "(not given)"}
        Received: {message.ReceivedAt:u}
        Reference: {message.Id}

        {message.Message}
        """;
}
