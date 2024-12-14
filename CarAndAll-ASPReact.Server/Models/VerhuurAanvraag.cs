using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarAndAll_ASPReact.Server.Models
{
    public class Verhuuraanvraag
    {
        public int VerhuuraanvraagId { get; set; }
        public DateTime Startdatum { get; set; }
        public DateTime Einddatum { get; set; }
        public string Status { get; set; } // bv: "Goedgekeurd", "Afgewezen" of "In behandeling"
        [ForeignKey("HuurderId")]
        public string HuurderId { get; set; }

        [JsonIgnore]
        public Huurder Huurder { get; set; }
        [ForeignKey("VoertuigId")]
        public int VoertuigId { get; set; }
        [JsonIgnore]
        public Voertuig Voertuig { get; set; }
    }
}



/*using System.Text.Json.Serialization;

namespace CarAndAll_ASPReact.Server.Models
{
    public class Verhuuraanvraag
    {
        public int VerhuuraanvraagId { get; set; }
        public DateTime Startdatum { get; set; }
        public DateTime Einddatum { get; set; }
        public string Status { get; set; } // bv: "Goedgekeurd", "Afgewezen" of "In behandeling"
        public string HuurderId { get; set; }
        [JsonIgnore]
        public Huurder? Huurder { get; set; }
        public int VoertuigId { get; set; }
        [JsonIgnore]
        public Voertuig? Voertuig { get; set; }
    }
}
*/