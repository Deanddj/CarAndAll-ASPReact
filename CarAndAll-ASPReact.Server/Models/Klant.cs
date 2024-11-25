namespace CarAndAll_ASPReact.Server.Models
{
    public class Klant
    {
        public int KlantId { get; set; }
        public string Naam { get; set; }
        public string Adres { get; set; }
        public string Email { get; set; }
        public string Telefoonnummer { get; set; }
        public ICollection<Verhuuraanvraag> Verhuuraanvragen { get; set; }
    }
}
