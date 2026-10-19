using Portfolio.Api.Models;

namespace Portfolio.Api.Services;

public interface IPortfolioRepository
{
    PortfolioContent GetContent();

    Project? FindProject(string id);
}
