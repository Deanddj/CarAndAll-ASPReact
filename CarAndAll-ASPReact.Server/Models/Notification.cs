using System;
using System.ComponentModel.DataAnnotations;

namespace CarAndAll_ASPReact.Server.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        public string Type { get; set; }
        public int? BedrijfId { get; set; }
        public string Email { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
