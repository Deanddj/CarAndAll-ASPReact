namespace CarAndAll_ASPReact.Server.Models
{
    public class Bedrijf
    {
        public int BedrijfId { get; set; }
        public string Naam { get; set; }
        public string Adres { get; set; }
        public string KvkNummer { get; set; }
        public string Abonnementstype { get; set; }
        public ICollection<ZakelijkeHuurder> ZakelijkeHuurders { get; set; }
        public ZakelijkeBeheerder ZakelijkeBeheerder { get; set; }
        public ICollection<Abonnement> Abonnementen { get; set; }
    }
}
