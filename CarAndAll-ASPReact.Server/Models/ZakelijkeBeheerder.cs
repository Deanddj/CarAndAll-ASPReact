namespace CarAndAll_ASPReact.Server.Models
{
    public class ZakelijkeBeheerder
    {
        public int ZakelijkeBeheerderId { get; set; }
        public string Naam { get; set; }
        public string Email { get; set; }
        public int BedrijfId { get; set; }
        public Bedrijf Bedrijf { get; set; }
    }
}
