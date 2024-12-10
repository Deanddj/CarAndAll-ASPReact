namespace CarAndAll_ASPReact.Server.Models
{
    public class Huurder : User
    {
        public string Telefoonnummer { get; set; }
        public string Adres { get; set; }
        public int? BedrijfId { get; set; }
        public Bedrijf? Bedrijf { get; set; }
        public ICollection<Verhuuraanvraag> Verhuuraanvragen { get; set; }
    }
}
