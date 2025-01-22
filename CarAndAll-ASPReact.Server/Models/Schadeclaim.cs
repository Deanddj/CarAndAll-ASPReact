using System.ComponentModel.DataAnnotations.Schema;

namespace CarAndAll_ASPReact.Server.Models
{
    public class Schadeclaim
    {
        public int schadeclaimId { get; set; }
        public string? Commentaar { get; set; }
        public string? Status {get; set; }
        public DateTime? Datum { get; set; }
        [ForeignKey("VoertuigId")]
        public int VoertuigId { get; set; }

        public Voertuig Voertuig { get; set; }
    }
}
