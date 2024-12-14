using CarAndAll_ASPReact.Server.DTOs;
using CarAndAll_ASPReact.Server.Models;
using Humanizer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.BlazorIdentity.Pages.Manage;
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
        private readonly NotificationService _notificationService;

        private static readonly List<string> AllowedNotificationTypes = new List<string>
    {
        "Bericht",
        "BedrijfVerzoek"
    };

        public NotificationController(CarAndAllDbContext context, UserManager<User> userManager, NotificationService notificationService)
        {
            _context = context;
            _userManager = userManager;
            _notificationService = notificationService;
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

            if (notifications == null || notifications.Count == 0)
            {
                return NotFound(new { Message = "Geen notificaties gevonden voor deze gebruiker." });
            }

            return Ok(notifications);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationDto dto)
        {
            if (!AllowedNotificationTypes.Contains(dto.Type))
            {
                return BadRequest(new { Message = "Type moet een van de volgende zijn: " + AllowedNotificationTypes});
            }

            var existingRequest = await _context.Notificaties
        .FirstOrDefaultAsync(n => n.Type == "BedrijfVerzoek" && n.Email == dto.Email);

            if (existingRequest != null)
            {
                return BadRequest(new { Message = "A invitation has already been sent to this user." });
            }

            var notification = new Notification
            {
                Email = dto.Email,
                Type = dto.Type,
                BedrijfId = dto.BedrijfId,
                Title = dto.Title,
                Message = dto.Message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notificaties.Add(notification);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotifications), new { email = notification.Email }, notification);
        }

        [HttpPut("{id}/accept")]
        public async Task<IActionResult> AcceptInvitation(int id)
        {
            var notification = await _context.Notificaties
                .FirstOrDefaultAsync(n => n.NotificationId == id);

            if (notification == null)
            {
                return NotFound(new { Message = "Notification not found." });
            }

            var bedrijfId = notification.BedrijfId;
            var email = notification.Email;

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return NotFound(new { Message = "User with the given email not found." });
            }

            var bedrijf = await _context.Bedrijven.Include(b => b.ZakelijkeBeheerder).FirstOrDefaultAsync(b => b.BedrijfId == bedrijfId);

            if (bedrijf == null)
            {
                return NotFound("Bedrijf not found.");
            }

            var huurder = user as Huurder;

            if (huurder == null)
            {
                return BadRequest("The user is not a Huurder.");
            }

            if (huurder.BedrijfId != null)
            {
                return BadRequest(new { Message = "Gebruiker is al lid van een bedrijf en kan zich niet aansluiten bij een ander bedrijf." });
            }

            if (bedrijf.Huurders == null)
            {
                bedrijf.Huurders = new List<Huurder>();
            }

            huurder.BedrijfId = bedrijfId; 
            huurder.Bedrijf = bedrijf;
            bedrijf.Huurders.Add(huurder);

            await _context.SaveChangesAsync();

            await DeleteNotification(notification.NotificationId);
            await _notificationService.SendNotificationAsync(email, "Bericht", null, "Verzoek geaccepteerd", $"U heeft de uitnodiging van '{bedrijf.Naam}' geaccepteerd.");
            await _notificationService.SendNotificationAsync(bedrijf.ZakelijkeBeheerder.Email, "Bericht", null, "Verzoek geaccepteerd", $"{huurder.Naam} ({email}) heeft uw bedrijf uitnodiging geaccepteerd.");

            return Ok("User successfully added to the Bedrijf.");
        }

        [HttpPut("{id}/decline")]
        public async Task<IActionResult> DeclineInvitation(int id)
        {
            var notification = await _context.Notificaties
                .FirstOrDefaultAsync(n => n.NotificationId == id);

            if (notification == null)
            {
                return NotFound("Notification not found.");
            }

            var bedrijfId = notification.BedrijfId;
            var email = notification.Email;

            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return NotFound("User with the given email not found.");
            }

            var bedrijf = await _context.Bedrijven.Include(b => b.ZakelijkeBeheerder).FirstOrDefaultAsync(b => b.BedrijfId == bedrijfId);

            if (bedrijf == null)
            {
                return NotFound("Bedrijf not found.");
            }

            var huurder = user as Huurder;

            if (huurder == null)
            {
                return BadRequest("The user is not a Huurder.");
            }

            await DeleteNotification(notification.NotificationId);
            await _notificationService.SendNotificationAsync(email, "Bericht", null, "Verzoek afgewezen", $"U heeft de uitnodiging van '{bedrijf.Naam}' afgewezen.");
            await _notificationService.SendNotificationAsync(bedrijf.ZakelijkeBeheerder.Email, "Bericht", null, "Verzoek afgewezen",$"{huurder.Naam} ({email}) heeft uw bedrijf uitnodiging afgewezen.");


            return Ok("User declined the invite.");
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

        [HttpDelete("{id}/delete")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return NotFound(new { Message = "Gebruiker niet gevonden." });
            }
            
            var notification = await _context.Notificaties.FirstOrDefaultAsync(n => n.NotificationId == id);

            if (notification == null)
            {
                return NotFound(new { Message = "Geen notificaties gevonden." });
            }

            if (!user.UserName.Equals(notification.Email))
            {
                return Unauthorized(new { Message = "Gebruiker heeft geen toegang tot deze informatie." });
            }

            _context.Notificaties.Remove(notification);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "De notificatie is succesvol verwijderd." });
        }
    }
}
