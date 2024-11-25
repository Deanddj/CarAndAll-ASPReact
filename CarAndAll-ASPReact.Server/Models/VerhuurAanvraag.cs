namespace CarAndAll_ASPReact.Server.Models
{
    public class Verhuuraanvraag
    {
        public int VerhuuraanvraagId { get; set; }
        public DateTime Startdatum { get; set; }
        public DateTime Einddatum { get; set; }
        public string Status { get; set; } // bv: "Goedgekeurd", "Afgewezen" of "In behandeling"
        public int? KlantId { get; set; }
        public Klant Klant { get; set; }

        public int? ZakelijkeHuurderId { get; set; }
        public ZakelijkeHuurder ZakelijkeHuurder { get; set; }
        public int VoertuigId { get; set; }
        public Voertuig Voertuig { get; set; }
    }
}
