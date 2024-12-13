using System.Text.Json.Serialization;

namespace CarAndAll_ASPReact.Server.Models
{
    public class Verhuuraanvraag
    {
        public int VerhuuraanvraagId { get; set; }
        public DateTime Startdatum { get; set; }
        public DateTime Einddatum { get; set; }
        public string Status { get; set; } // bv: "Goedgekeurd", "Afgewezen" of "In behandeling"
        public string HuurderId { get; set; }
        public Huurder Huurder { get; set; }
        public int VoertuigId { get; set; }

        [JsonIgnore]
        public Voertuig Voertuig { get; set; }
    }
}
