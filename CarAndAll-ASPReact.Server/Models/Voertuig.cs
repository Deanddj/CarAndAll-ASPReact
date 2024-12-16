namespace CarAndAll_ASPReact.Server.Models
{
    public class Voertuig
    {
        public int VoertuigId { get; set; }
        public string Soort { get; set; }
        public string Merk { get; set; }
        public string Type { get; set; }
        public string Kenteken { get; set; }
        public string Kleur {  get; set; }
        public int? Aanschafjaar {  get; set; }
        public string Status { get; set; } // bv: "Beschikbaar", "In reparatie" of "Verhuurd"
        public ICollection<Verhuuraanvraag> Verhuuraanvragen { get; set; }


    }
}
