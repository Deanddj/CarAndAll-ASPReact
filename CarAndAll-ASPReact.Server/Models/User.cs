using Microsoft.AspNetCore.Identity;

namespace CarAndAll_ASPReact.Server.Models
{
    public class User : IdentityUser
    {
        public string Naam { get; set; }
    }
}
