namespace CarAndAll_ASPReact.Server.Models
{
    public class Medewerker
    {
        public int MedewerkerId { get; set; }
        public string Naam { get; set; }
        public string Rol { get; set; } // bv: Backoffice of Frontoffice
        public string Email { get; set; }
    }
}
