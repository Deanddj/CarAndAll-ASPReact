using System;
using System.ComponentModel.DataAnnotations;

namespace CarAndAll_ASPReact.Server.DTOs
{
    public class NotificationDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MaxLength(100)] // Example: max length constraint for the title
        public string Title { get; set; }

        [Required]
        [MaxLength(500)] // Example: max length constraint for the message
        public string Message { get; set; }
    }
}
