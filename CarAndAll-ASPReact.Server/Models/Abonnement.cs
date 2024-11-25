namespace CarAndAll_ASPReact.Server.Models
{
    public class Abonnement
    {
        public int AbonnementId { get; set; }
        public string Type { get; set; } // bv: "Pay as you go" of "Prepaid"
        public DateTime Startdatum { get; set; }
        public DateTime Einddatum { get; set; }
        public int BedrijfId { get; set; }
        public Bedrijf Bedrijf { get; set; }
    }
}
