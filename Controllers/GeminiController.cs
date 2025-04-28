using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Net.Http.Headers;
using System.Text;

namespace GeminiApiDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeminiChatController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private static readonly Dictionary<string, List<Dictionary<string, string>>> _chatHistories = new();

        public GeminiChatController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [ProducesResponseType(typeof(object),StatusCodes.Status200OK)]
        [HttpPost("{chatId}")]
        public async Task<IActionResult> PostMessage(string chatId, [FromBody] UserMessage userMessage)
        {
            var client = new HttpClient();
            // setx GoogleAIAPIKey xxxxx 設定環境變數
            // set Google 確認是否成功
            var apiKey = Environment.GetEnvironmentVariable("GoogleAIAPIKey", EnvironmentVariableTarget.Machine);
            var request = new HttpRequestMessage(HttpMethod.Post, $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}");
            var payload = new GeminiRequest
            {
                Contents = new List<GeminiRequestPart>{
                    new GeminiRequestPart{
                        Parts = new List<GeminiRequestPartText>{
                            new GeminiRequestPartText{
                                Text = userMessage.Content
                            }
                        }
                    }
                }
            };
            var settings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            string payloadString = JsonConvert.SerializeObject(payload,settings);
            var content = new StringContent(payloadString, null, "application/json");
            request.Content = content;
            var response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            Console.WriteLine(await response.Content.ReadAsStringAsync()); response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            return Ok(responseContent);
            // var responseObject = JsonConvert.DeserializeObject<GeminiResponse>(responseContent);

            // _chatHistories[chatId].Add(new Dictionary<string, string>
            // {
            //     { "role", "model" },
            //     { "content", responseObject.Candidates[0].Content }
            // });

            // return Ok(responseObject.Candidates[0].Content);
        }
    }

    public class UserMessage
    {
        public string Content { get; set; }
        public string Prompt { get; set; }
    }

    public class GeminiRequest
    {
        public IEnumerable<GeminiRequestPart> Contents { get; set; }
    }

    public class GeminiRequestPart
    {
        public IEnumerable<GeminiRequestPartText> Parts { get; set; }
    }

    public class GeminiRequestPartText
    {
        public string Text { get; set; }
    }

    public class GeminiResponse
    {
        public List<Candidate> Candidates { get; set; }
    }

    public class Candidate
    {
        public string Content { get; set; }
    }
}
