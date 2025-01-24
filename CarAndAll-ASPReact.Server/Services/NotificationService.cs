using Newtonsoft.Json;
using System.Text;

public class NotificationService
{
    private readonly HttpClient _httpClient;

    public NotificationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task SendNotificationAsync(string email, string type, int? bedrijf, string title, string message)
    {
        var payload = new
        {
            email,
            type,
            bedrijf,
            title,
            message
        };

        var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("https://localhost:7159/api/notifications", content);

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Notificatie kon niet worden verstuurd.");
        }
    }
}