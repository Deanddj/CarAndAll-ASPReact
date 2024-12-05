using Microsoft.AspNetCore.Identity;

namespace CarAndAll_ASPReact.Server.Models
{
    public class User : IdentityUser
    {
        public string? Telefoonnummer { get; set; }
        public string Adres { get; set; }
        public string? Kvk { get; set; }
    }
}
