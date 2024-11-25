namespace CarAndAll_ASPReact.Server.Models
{
    public class ZakelijkeHuurder
    {
        public int ZakelijkeHuurderId { get; set; }
        public string Naam { get; set; }
        public string Email { get; set; }
        public int BedrijfId { get; set; }
        public Bedrijf Bedrijf { get; set; }
        public ICollection<Verhuuraanvraag> Verhuuraanvragen { get; set; }
    }
}
