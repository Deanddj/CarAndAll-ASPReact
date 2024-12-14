using CarAndAll_ASPReact.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace CarAndAll_ASPReact.Server.DTOs
{
    public class NotificationDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MaxLength(20)]
        public string Type { get; set; }

        public int? BedrijfId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; }

        [Required]
        [MaxLength(500)]
        public string Message { get; set; }
    }
}
