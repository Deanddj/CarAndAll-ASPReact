using CarAndAll_ASPReact.Server.DTOs;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System;
using System.Security.Claims;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoertuigController : ControllerBase
    {
        private readonly CarAndAllDbContext _context;
        private readonly UserManager<User> _userManager;

        public VoertuigController(CarAndAllDbContext context, UserManager<User> userManager)
        {
            _userManager = userManager;
            _context = context;
        }

        //Gegevens van 1 auto opvragen, met bijbehorende verhuuraanvragen erbij
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoertuig(int id)
        {
            Console.WriteLine("Voertuigcontroller id");
            var voertuig = await _context.Voertuigen
                .Include(v => v.Verhuuraanvragen)
                .FirstOrDefaultAsync(v => v.VoertuigId == id);

            if (voertuig == null)
            {
                return NotFound(new { message = "Voertuig niet gevonden" });
            }

            return Ok(voertuig);
        }

        //Alleen verhuuraanvragen van een auto opvragen
        [HttpGet("voertuigAanvragen/{voertuigId}")]
        public IActionResult GetVerhuurAanvragenVoorVoertuig(int voertuigId)
        {
            var verhuuraanvragen = _context.Verhuuraanvragen
                .Where(va => va.VoertuigId == voertuigId && va.Status == "Goedgekeurd") //HANDMATIG NAAR GOEDGEKEURD IN DATBASE ZETTEN
                .Select(va => new { va.Startdatum, va.Einddatum })
                .ToList();

            return Ok(verhuuraanvragen);
        }

        //Alle voertuigen met bijbehorende aanvragen opvragen
        [HttpGet("voertuigen/met-aanvragen")]
        public async Task<IActionResult> GetVoertuigenMetVerhuurAanvragen()
        {
            Console.WriteLine("hallo");
            // Haal de userId op uit de claims
            var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("gebruiker niet gevonden");
                return Unauthorized(new { message = "Gebruiker niet ingelogd." });
            }

            // Haal de user op inclusief bedrijfsinformatie
            var user = await _userManager.Users
                .Include(u => (u as ZakelijkeBeheerder).Bedrijf)
                .Include(u => (u as Huurder).Bedrijf)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                Console.WriteLine("user niet gevonden");
                return NotFound(new { message = "Gebruiker niet gevonden." });
            }

            // Controleer of de gebruiker een bedrijf heeft
            var heeftBedrijf = (user as Huurder)?.Bedrijf != null;
            Console.WriteLine(heeftBedrijf);

            // Filter voertuigen afhankelijk van of de gebruiker een bedrijf heeft
            var voertuigenMetAanvragen = _context.Voertuigen
                .Include(v => v.Verhuuraanvragen)
                .Where(v => !heeftBedrijf || v.Soort == "Auto") // Alleen voertuigen met type 'Auto' als de gebruiker een bedrijf heeft
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
                    HeeftGoedgekeurdeAanvraag = v.Verhuuraanvragen.Any(va => va.Status == "Goedgekeurd"),
                    Verhuuraanvragen = v.Verhuuraanvragen
                        .Where(va => va.Status == "Goedgekeurd") // Filter alleen de goedgekeurde verhuuraanvragen
                        .Select(va => new
                        {
                            va.VerhuuraanvraagId,
                            va.Startdatum,
                            va.Einddatum
                        })
                        .ToList()
                })
                .ToList();
            return Ok(voertuigenMetAanvragen);
        }

        //cookies
        [HttpGet("claims")]
        public IActionResult GetClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(claims);
        }

        //verhuuraanvraag van een auto insturen
        [HttpPost]
        public async Task<IActionResult> CreateVerhuuraanvraag([FromBody] VerhuuraanvraagDto verhuuraanvraagDto)
        {

            try
            {
                var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
                Console.WriteLine($"De userId met de lijn van Dean is: {userId}");



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

                try
                {
                    _context.Verhuuraanvragen.Add(nieuweAanvraag);
                    await _context.SaveChangesAsync();
                }

                catch (Exception e)
                {
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
}