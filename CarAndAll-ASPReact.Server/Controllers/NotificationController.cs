using CarAndAll_ASPReact.Server.DTOs;
using CarAndAll_ASPReact.Server.Models;
using Humanizer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly CarAndAllDbContext _context;
        private readonly UserManager<User> _userManager;

        public NotificationController(CarAndAllDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized(new { Message = "Gebruiker is niet geauthoriseerd." });
            }

            var email = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { Message = "Gebruiker email niet gevonden." });
            }

            var notifications = await _context.Notificaties
                .Where(n => n.Email == email)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }


        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationDto dto)
        {
            var notification = new Notification
            {
                Email = dto.Email,
                Title = dto.Title,
                Message = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notificaties.Add(notification);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotifications), new { email = notification.Email }, notification);
        }

        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            if (!User.Identity.IsAuthenticated)
            {
                return Unauthorized(new { Message = "Gebruiker niet geauthoriseerd." });
            }

            var email = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { Message = "Gebruiker email niet gevonden." });
            }

            var notification = await _context.Notificaties.FindAsync(id);

            if (notification == null)
            {
                return NotFound();
            }

            if (!notification.Email.Equals(email))
            {
                return Unauthorized(new { Message = "Gebruiker heeft geen toegang tot deze informatie." });
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("deleteAll")]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return NotFound(new { Message = "Gebruiker niet gevonden." });
            }

            var notifications = _context.Notificaties.Where(n => n.Email == user.Email).ToList();

            if (!notifications.Any())
            {
                return NotFound(new { Message = "Geen notificaties gevonden." });
            }

            _context.Notificaties.RemoveRange(notifications);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Alle notifications zijn succesvol verwijderd." });
        }
    }
}
