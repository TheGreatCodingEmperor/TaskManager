using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;

namespace ChatGptApiDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private static readonly Dictionary<string, List<Message>> ChatSessions = new();
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _apiKey = "xxx";
        private readonly string _apiUrl = "https://api.openai.com/v1/chat/completions";

        public ChatController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            if (!ChatSessions.ContainsKey(request.SessionId))
            {
                ChatSessions[request.SessionId] = new List<Message>
                {
                    new Message { Role = "system", Content = request.SystemPrompt ?? "你是一個智慧助手。" }
                };
            }

            ChatSessions[request.SessionId].Add(new Message { Role = "user", Content = request.UserInput });

            var payload = new
            {
                model = "gpt-3.5-turbo",
                messages = ChatSessions[request.SessionId],
                // tools = new[]
                // {
                //     new { type = "web_search" } // 啟用網頁搜尋功能 4o
                // }
            };

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync(_apiUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, responseString);
            }

            var chatResponse = JsonConvert.DeserializeObject<ChatResponse>(responseString);
            var assistantMessage = chatResponse?.Choices?.FirstOrDefault()?.Message;

            if (assistantMessage != null)
            {
                ChatSessions[request.SessionId].Add(assistantMessage);
                return Ok(assistantMessage.Content);
            }

            return BadRequest("無法取得回應。");
        }
    }

    public class ChatRequest
    {
        public string SessionId { get; set; } = Guid.NewGuid().ToString();
        public string UserInput { get; set; } = string.Empty;
        public string? SystemPrompt { get; set; }
    }

    public class Message
    {
        [JsonProperty("role")]
        public string Role { get; set; } = string.Empty;

        [JsonProperty("content")]
        public string Content { get; set; } = string.Empty;
    }

    public class ChatResponse
    {
        [JsonProperty("choices")]
        public List<Choice>? Choices { get; set; }
    }

    public class Choice
    {
        [JsonProperty("message")]
        public Message? Message { get; set; }
    }
}
