using CarAndAll_ASPReact.Server;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CarAndAll_ASPReact.Server.DTOs;
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.CodeAnalysis.Elfie.Serialization;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class VerhuuraanvragenController : ControllerBase
{
    private readonly CarAndAllDbContext _context;

    public VerhuuraanvragenController(CarAndAllDbContext context)
    {
        _context = context;
    }

    [HttpGet("voertuigen/{voertuigId}")]
    public IActionResult GetVerhuurAanvragenVoorVoertuig(int voertuigId)
    {
        var verhuuraanvragen = _context.Verhuuraanvragen
            .Where(va => va.VoertuigId == voertuigId && va.Status == "Goedgekeurd") //HANDMATIG NAAR GOEDGEKEURD IN DATBASE ZETTEN
            .Select(va => new { va.Startdatum, va.Einddatum })
            .ToList();

        if (verhuuraanvragen.Any())
        {
            Console.WriteLine("Diddy loves you");
        }
        else {
            Console.WriteLine("Diddy not love you");
        }
     return Ok(verhuuraanvragen);
    }

    [HttpGet("voertuigen/met-aanvragen")]
    public IActionResult GetVoertuigenMetVerhuurAanvragen()
    {
        var voertuigenMetAanvragen = _context.Voertuigen
            .Include(v => v.Verhuuraanvragen) 
            .Select(v => new
            {
                v.VoertuigId,
                v.Soort,
                v.Merk,
                v.Type,
                v.Kenteken,
                v.Kleur,
                v.Aanschafjaar,
                v.Status,
                v.Prijs,
                HeeftGoedgekeurdeAanvraag = v.Verhuuraanvragen.Any(va => va.Status == "Goedgekeurd")
            })
            .ToList();

        return Ok(voertuigenMetAanvragen);
    }



    [HttpPost]
    public async Task<IActionResult> CreateVerhuuraanvraag([FromBody] VerhuuraanvraagDto verhuuraanvraagDto)
    {
        Console.WriteLine("Diddy joined the party");
        try
        {
            //var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "da0f3284-095e-4ef9-9772-1e98837b4361";
            /*            Console.WriteLine("Hardcoded: fe00217b-090c-4cf6-81cf-d0b1f56c1fc9");
                        Console.WriteLine($"Huurderid is: {huurderId}");*/


            Console.WriteLine("Ontvangen VerhuuraanvraagDto:");
            Console.WriteLine($"Startdatum: {verhuuraanvraagDto.Startdatum}");
            Console.WriteLine($"Einddatum: {verhuuraanvraagDto.Einddatum}");
            Console.WriteLine($"VoertuigId: {verhuuraanvraagDto.VoertuigId}");

            if (verhuuraanvraagDto.Startdatum >= verhuuraanvraagDto.Einddatum)
            {
                return BadRequest(new { message = "De startdatum moet eerder zijn dan de einddatum." });
            }

            if (userId == null)
            {
                return BadRequest(new { Message = "UserId mag niet null zijn." });
            }

            var nieuweAanvraag = new Verhuuraanvraag
            {
                Startdatum = verhuuraanvraagDto.Startdatum,
                Einddatum = verhuuraanvraagDto.Einddatum,
                Status = "In behandeling",
                HuurderId = userId,
                VoertuigId = verhuuraanvraagDto.VoertuigId
            };

            try {
                _context.Verhuuraanvragen.Add(nieuweAanvraag);
            await _context.SaveChangesAsync();
            }

            catch(Exception e) {
                Console.WriteLine(e);
            }
 

            return CreatedAtAction(nameof(GetVerhuurAanvragenVoorVoertuig), new { voertuigId = nieuweAanvraag.VoertuigId }, nieuweAanvraag);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return StatusCode(500, new { message = "Er is iets misgegaan bij het verwerken van de aanvraag." });
        }
    }




}


