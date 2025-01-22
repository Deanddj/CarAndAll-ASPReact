using CarAndAll_ASPReact.Server.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarAndAll_ASPReact.Server.DTOs
{
    public class SchadeclaimDTO
    {
        public int schadeclaimId { get; set; }
        public string? Commentaar { get; set; }
        public string? Status { get; set; }
        public DateTime? Datum { get; set; }
    }
}
