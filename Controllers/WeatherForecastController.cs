using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace TaskManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeatherForecastController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<WeatherForecastController> _logger;

    public WeatherForecastController(ILogger<WeatherForecastController> logger)
    {
        _logger = logger;
    }

    [ProducesResponseType(typeof(object),StatusCodes.Status200OK)]
    [HttpGet]
    public IActionResult Get(
        [FromQuery] WeatherForecast conditions,
        [FromQuery,Required] QueryParameters parameters)
    {
        IQueryable<WeatherForecast> datas = Enumerable.Range(1, 5).Select(index => new WeatherForecast
        {
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            TemperatureC = Random.Shared.Next(-20, 55),
            Summary = Summaries[Random.Shared.Next(Summaries.Length)]
        })
        .ToArray().AsQueryable();

        var tmp = datas
        .WhereIf(conditions.TemperatureC,t => t.TemperatureC >= conditions.TemperatureC);

        int totalCount = tmp.Count();

        var items = tmp
            .ApplySorting(parameters.OrderColumn, parameters.OrderDescending)
            .ApplyPaging(parameters.Page, parameters.PageSize)
            .ToList();


        return Ok(new { totalCount, items }); ;
    }
}
