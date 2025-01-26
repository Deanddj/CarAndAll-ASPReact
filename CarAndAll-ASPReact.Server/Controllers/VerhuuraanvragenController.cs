using CarAndAll_ASPReact.Server;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CarAndAll_ASPReact.Server.DTOs;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using System.Collections.Immutable;
using Microsoft.AspNetCore.Identity;

[ApiController]
[Route("api/[controller]")]
public class VerhuuraanvragenController : ControllerBase
{
    private readonly CarAndAllDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly UserManager<User> _userManager;


    public VerhuuraanvragenController(CarAndAllDbContext context, NotificationService notificationService, UserManager<User> userManager)
    {
        _context = context;
        _notificationService = notificationService;
        _userManager = userManager;

    }

    // Wordt gebruikt door back office medewerker alleen
    [HttpGet("alle-aanvragen")]
    public async Task<IActionResult> GetAanvragen()
    {
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

        var rol = medewerker.Rol;
        if (rol != "Backoffice")
        {
            return BadRequest("Je moet een back office medewerker zijn voor deze functie.");
        }

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

    [HttpGet("goedgekeurde-aanvragen")]
    public async Task<IActionResult> goedgekeurdeVerhuurAanvragen()
    {
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

        var rol = medewerker.Rol;
        if (rol != "Frontoffice")
        {
            return BadRequest("Je moet een front front medewerker zijn voor deze functie.");
        }

        var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("gebruiker niet gevonden");
            return Unauthorized(new { message = "Gebruiker niet ingelogd." });
        }

        var verhuuraanvragen = _context.Verhuuraanvragen
            .Include(va => va.Voertuig)
            .Include(va => va.Huurder)
            .Where(va => va.Status == "Goedgekeurd")
            .Select(va => new
            {
                va.VerhuuraanvraagId,
                va.Startdatum,
                va.Einddatum,
                va.Status,
                Voertuig = new
                {
                    va.Voertuig.VoertuigId,
                    va.Voertuig.Soort,
                    va.Voertuig.Merk,
                    va.Voertuig.Type,
                    va.Voertuig.Kenteken,
                    va.Voertuig.Kleur,
                    va.Voertuig.Aanschafjaar,
                    va.Voertuig.Status,
                    va.Voertuig.Prijs,
                },
                user = new
                {
                    va.Huurder.Id,
                    va.Huurder.Naam,
                    va.Huurder.Email
                }
            })
            .ToList();

        return Ok(verhuuraanvragen);
    }

    [HttpGet("uitgegeven-aanvragen")]
    public async Task<IActionResult> uitgegevenVerhuurAanvragen()
    {
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

        var rol = medewerker.Rol;
        if (rol != "Frontoffice")
        {
            return BadRequest("Je moet een front office medewerker zijn voor deze functie.");
        }

        var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("gebruiker niet gevonden");
            return Unauthorized(new { message = "Gebruiker niet ingelogd." });
        }

        var verhuuraanvragen = _context.Verhuuraanvragen
            .Include(va => va.Voertuig)
            .Include(va => va.Huurder)
            .Where(va => va.Status == "Uitgegeven")
            .Select(va => new
            {
                va.VerhuuraanvraagId,
                va.Startdatum,
                va.Einddatum,
                va.Status,
                Voertuig = new
                {
                    va.Voertuig.VoertuigId,
                    va.Voertuig.Soort,
                    va.Voertuig.Merk,
                    va.Voertuig.Type,
                    va.Voertuig.Kenteken,
                    va.Voertuig.Kleur,
                    va.Voertuig.Aanschafjaar,
                    va.Voertuig.Status,
                    va.Voertuig.Prijs,
                },
                user = new
                {
                    va.Huurder.Id,
                    va.Huurder.Naam,
                    va.Huurder.Email
                }
            })
            .ToList();

        return Ok(verhuuraanvragen);
    }

    [HttpPut("uitgave-voertuigen/{id}")]
    public async Task<IActionResult> uitgaveVoertuig(int id)
    {
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

        var rol = medewerker.Rol;
        if (rol != "Frontoffice")
        {
            return BadRequest("Je moet een front office medewerker zijn voor deze functie.");
        }

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

        return Ok(aanvraag);
    }

    [HttpPut("inname-voertuigen/{id}")]
    public async Task<IActionResult> innameVoertuig(int id, [FromBody] StatusDto status)
    {
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

        var rol = medewerker.Rol;
        if (rol != "Frontoffice")
        {
            return BadRequest("Je moet een front office medewerker zijn voor deze functie.");
        }

        var aanvraag = await _context.Verhuuraanvragen
            .FirstOrDefaultAsync(a => a.VerhuuraanvraagId == id);

        if (aanvraag == null)
        {
            return NotFound();
        }

        aanvraag.Status = "Afgehandeld";

        var voertuig = await _context.Voertuigen
            .FirstOrDefaultAsync(v => v.VoertuigId == aanvraag.VoertuigId);

        if (voertuig != null)
        {
            voertuig.Status = status.Status;
        }

        await _context.SaveChangesAsync();
        return Ok(aanvraag);
    }


    [HttpPut("goedkeuren/{id}")]
    public async Task<IActionResult> UitgevenAanvraag(int id, [FromBody] AanvraagKeuring aanvraagbody)
    {
        Console.WriteLine($"Aanvraag body: {aanvraagbody.Email}, {aanvraagbody.Voertuig.Merk}, {aanvraagbody.StartDatum}, {aanvraagbody.EindDatum}");
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

        var rol = medewerker.Rol;
        if (rol != "Backoffice")
        {
            return BadRequest("Je moet een back office medewerker zijn voor deze functie.");
        }

        aanvraag.Status = "Goedgekeurd";
        await _context.SaveChangesAsync();

        var voertuig = aanvraagbody.Voertuig;
        var message = $"Uw verzoek voor de {voertuig.Merk} {voertuig.Type} voor {aanvraagbody.StartDatum:dd-MM-yyyy} tot en met {aanvraagbody.EindDatum:dd-MM-yyyy} is goedgekeurd";


        await _notificationService.SendNotificationAsync(aanvraagbody.Email, "Bericht", null, "Verhuurzoek Goedgekeurd", message);


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

        var rol = medewerker.Rol;
        if (rol != "Backoffice")
        {
            return BadRequest("Je moet een back office medewerker zijn voor deze functie.");
        }
 

        aanvraag.Status = "Afgewezen";
        await _context.SaveChangesAsync();

        var voertuig = aanvraagbody.Voertuig;
        var message = $"Uw verzoek voor de {voertuig.Merk} {voertuig.Type} voor {aanvraagbody.StartDatum:dd-MM-yyyy} tot en met {aanvraagbody.EindDatum:dd-MM-yyyy} is afgekeurd";
        await _notificationService.SendNotificationAsync(aanvraagbody.Email, "Bericht", null, "Verhuurzoek Afgewezen", message);

        return Ok(aanvraag);
    }

    [HttpPost("create/schadeclaim/{voertuigId}")]
    public async Task<IActionResult> VoegSchadeClaimToe(int voertuigId, [FromBody] SchadeclaimDTO schadeclaim)
    {
        var voertuig = await _context.Voertuigen.FindAsync(voertuigId);
        if (voertuig == null)
        {
            return NotFound("Voertuig niet gevonden");
        }

        var nieuweSchadeclaim = new Schadeclaim
        {
            Commentaar = schadeclaim.Commentaar,
            Status = "In behandeling",
            Datum = schadeclaim.Datum,
            VoertuigId = voertuigId
        };

        _context.Schadeclaims.Add(nieuweSchadeclaim);
        await _context.SaveChangesAsync();

        return Ok(schadeclaim);
    }

    public class AanvraagKeuring
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public VoertuigDto Voertuig { get; set; }
        public DateTime StartDatum { get; set; }
        public DateTime EindDatum { get; set; }
    }

    public class HuurderDto
    {
        public int id { get; set; }
        public string naam { get; set; }
    }




}