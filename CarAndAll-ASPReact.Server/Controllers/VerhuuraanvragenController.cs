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



    [HttpPut("goedkeuren/{id}")]
    public async Task<IActionResult> GoedkeurenAanvraag(int id, [FromBody] AanvraagKeuring aanvraagbody)
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

        aanvraag.Status = "Afgewezen";
        await _context.SaveChangesAsync();

        var voertuig = aanvraagbody.Voertuig;
        var message = $"Uw verzoek voor de {voertuig.Merk} {voertuig.Type} voor {aanvraagbody.StartDatum:dd-MM-yyyy} tot en met {aanvraagbody.EindDatum:dd-MM-yyyy} is afgekeurd";
        await _notificationService.SendNotificationAsync(aanvraagbody.Email, "Bericht", null, "Verhuurzoek Afgewezen", message);

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