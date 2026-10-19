using Microsoft.AspNetCore.Mvc;
using Portfolio.Api.Models;
using Portfolio.Api.Services;

namespace Portfolio.Api.Controllers;

/// <summary>Read-only endpoints that serve the portfolio content.</summary>
[ApiController]
[Route("api")]
[Produces("application/json")]
[ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
public sealed class PortfolioController(IPortfolioRepository repository) : ControllerBase
{
    [HttpGet("portfolio")]
    [ProducesResponseType<PortfolioContent>(StatusCodes.Status200OK)]
    public ActionResult<PortfolioContent> GetPortfolio() => repository.GetContent();

    [HttpGet("skills")]
    [ProducesResponseType<IReadOnlyList<SkillGroup>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<SkillGroup>> GetSkills() => Ok(repository.GetContent().Skills);

    [HttpGet("experience")]
    [ProducesResponseType<IReadOnlyList<Experience>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<Experience>> GetExperience() => Ok(repository.GetContent().Experience);

    [HttpGet("projects")]
    [ProducesResponseType<IReadOnlyList<Project>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<Project>> GetProjects() => Ok(repository.GetContent().Projects);

    [HttpGet("projects/{id}")]
    [ProducesResponseType<Project>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public ActionResult<Project> GetProject(string id)
    {
        var project = repository.FindProject(id);
        if (project is null)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found",
                detail: $"No project has the id '{id}'.");
        }

        return project;
    }
}
