using CarAndAll_ASPReact.Server.Models;
using CarAndAll_ASPReact.Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CarAndAll_ASPReact.Server.DTOs;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class VerhuuraanvragenControllerTst : ControllerBase
{
    private readonly CarAndAllDbContext _context;
    private readonly UserManager<User> _userManager;

    // Constructor zonder NotificationService
    public VerhuuraanvragenControllerTst(CarAndAllDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet("alle-aanvragen")]
    public async Task<IActionResult> GetAanvragen()
    {
        var verhuuraanvragen = await _context.Verhuuraanvragen
            .Include(va => va.Voertuig)
            .Select(va => new
            {
                va.VerhuuraanvraagId,
                va.Startdatum,
                va.Einddatum,
                va.Status,
                va.HuurderId,
                Voertuig = new
                {
                    va.Voertuig.VoertuigId,
                    va.Voertuig.Merk,
                    va.Voertuig.Type,
                    va.Voertuig.Kenteken,
                    va.Voertuig.Kleur
                }
            })
            .ToListAsync();

        return Ok(verhuuraanvragen);
    }

    [HttpPut("uitgave-voertuigen/{id}")]
    public async Task<IActionResult> uitgaveVoertuig(int id)
    {
        var aanvraag = await _context.Verhuuraanvragen
            .FirstOrDefaultAsync(a => a.VerhuuraanvraagId == id);

        if (aanvraag == null)
        {
            return NotFound();
        }

        aanvraag.Status = "Uitgegeven";

        var voertuig = await _context.Voertuigen
            .FirstOrDefaultAsync(v => v.VoertuigId == aanvraag.VoertuigId);

        if (voertuig != null)
        {
            voertuig.Status = "Verhuurd";
        }

        await _context.SaveChangesAsync();

        // De notificatiecode is nu uitgeschakeld
        // Bijvoorbeeld: 
        // await _notificationService.SendNotificationAsync(aanvraagbody.Email, "Bericht", null, "Verhuurzoek Goedgekeurd", message);

        return Ok(aanvraag);
    }

    [HttpPut("goedkeuren/{id}")]
    public async Task<IActionResult> UitgevenAanvraag(int id, [FromBody] AanvraagKeuring aanvraagbody)
    {
        var aanvraag = await _context.Verhuuraanvragen
            .FirstOrDefaultAsync(a => a.VerhuuraanvraagId == id);

        if (aanvraag == null)
        {
            return NotFound();
        }

        var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));

        if (user == null)
        {
            return Unauthorized("User not found.");
        }

        var medewerker = user as Medewerker;

        if (medewerker == null)
        {
            return BadRequest("Je moet een medewerker zijn voor deze functie.");
        }

        aanvraag.Status = "Goedgekeurd";
        await _context.SaveChangesAsync();

        // De notificatiecode is nu uitgeschakeld
        // Bijvoorbeeld: 
        // await _notificationService.SendNotificationAsync(aanvraagbody.Email, "Bericht", null, "Verhuurzoek Goedgekeurd", message);

        return Ok(aanvraag);
    }

    [HttpPut("afkeuren/{id}")]
    public async Task<IActionResult> AfkeurenAanvraag(int id, [FromBody] AanvraagKeuring aanvraagbody)
    {
        var aanvraag = await _context.Verhuuraanvragen
            .FirstOrDefaultAsync(a => a.VerhuuraanvraagId == id);

        if (aanvraag == null)
        {
            return NotFound();
        }

        var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));

        if (user == null)
        {
            return Unauthorized("User not found.");
        }

        var medewerker = user as Medewerker;

        if (medewerker == null)
        {
            return BadRequest("Je moet een medewerker zijn voor deze functie.");
        }

        aanvraag.Status = "Afgewezen";
        await _context.SaveChangesAsync();

        // De notificatiecode is nu uitgeschakeld
        // Bijvoorbeeld: 
        // await _notificationService.SendNotificationAsync(aanvraagbody.Email, "Bericht", null, "Verhuurzoek Afgewezen", message);

        return Ok(aanvraag);
    }

    public class AanvraagKeuring
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public VoertuigDto Voertuig { get; set; }
        public DateTime StartDatum { get; set; }
        public DateTime EindDatum { get; set; }
    }
}
