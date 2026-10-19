using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

public class JsonPortfolioRepositoryTests
{
    private readonly JsonPortfolioRepository _repository = new(TestData.ContentFilePath());

    [Fact]
    public void LoadsTheSharedContentFile()
    {
        var content = _repository.GetContent();

        Assert.Equal("Nandhini L", content.Profile.Name);
        Assert.Equal(2, content.Experience.Count);
        Assert.Contains(content.Experience, e => e.Company == "Vertafore");
        Assert.Contains(content.Experience, e => e.Company == "Odessa Technologies");
        Assert.NotEmpty(content.Skills);
    }

    [Theory]
    [InlineData("sentinel")]
    [InlineData("SENTINEL")]
    public void FindProject_IsCaseInsensitive(string id)
    {
        var project = _repository.FindProject(id);

        Assert.NotNull(project);
        Assert.Equal("Sentinel", project.Name);
    }

    [Fact]
    public void FindProject_ReturnsNullForUnknownId()
    {
        Assert.Null(_repository.FindProject("does-not-exist"));
    }

    [Fact]
    public void ProjectsWithoutUrls_HaveNullLinks()
    {
        foreach (var project in _repository.GetContent().Projects)
        {
            Assert.NotNull(project.Links);
        }
    }

    [Fact]
    public void MissingFile_ThrowsWithHelpfulMessage()
    {
        var repository = new JsonPortfolioRepository("/no/such/portfolio.json");

        var error = Assert.Throws<FileNotFoundException>(() => repository.GetContent());
        Assert.Contains("Content:Path", error.Message);
    }

    [Fact]
    public void ContentWithoutProfileName_IsRejected()
    {
        Assert.Throws<InvalidOperationException>(() => JsonPortfolioRepository.Parse("""{ "profile": { "name": "" } }"""));
    }

    [Fact]
    public void MissingCollections_AreNormalizedToEmpty()
    {
        var content = JsonPortfolioRepository.Parse("""{ "profile": { "name": "Test" } }""");

        Assert.Empty(content.Projects);
        Assert.Empty(content.Skills);
        Assert.Empty(content.Education);
    }
}
