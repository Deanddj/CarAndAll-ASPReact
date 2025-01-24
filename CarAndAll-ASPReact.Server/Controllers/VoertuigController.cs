using CarAndAll_ASPReact.Server.DTOs;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System;
using System.Globalization;
using System.Security.Claims;
using System.Text.Json;
using static CarAndAll_ASPReact.Server.Controllers.VoertuigController;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoertuigController : ControllerBase
    {
        private readonly CarAndAllDbContext _context;
        private readonly NotificationService _notificationService;
        private readonly UserManager<User> _userManager;

        public VoertuigController(CarAndAllDbContext context, NotificationService notificationService, UserManager<User> userManager)
        {
            _userManager = userManager;
            _context = context;
            _notificationService = notificationService;
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

        //Alle verhuuraanvragen
        [HttpGet("verhuuraanvragen/op/{userId}")]
        public async Task<IActionResult> GetAlleVerhuuraanvragen(string userId)
        {
            var verhuuraanvraag = await _context.Voertuigen
                .Include(v => v.Verhuuraanvragen)
                .Where(v => v.Verhuuraanvragen.Any(va => va.HuurderId == userId)) // Filteren op aanvragen van de gebruiker
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
                    HeeftGoedgekeurdeAanvraag = v.Verhuuraanvragen.Any(va => va.HuurderId == userId && va.Status == "Goedgekeurd"),
                    Verhuuraanvragen = v.Verhuuraanvragen
                        .Where(va => va.HuurderId == userId) // Alleen aanvragen van de gebruiker
                        .Select(va => new
                        {
                            va.VerhuuraanvraagId,
                            va.Startdatum,
                            va.Einddatum,
                            va.Status
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(verhuuraanvraag);
        }

        //Alle voertuigen met bijbehorende aanvragen opvragen
        [HttpGet("voertuigen/met-aanvragen")]
        public async Task<IActionResult> GetVoertuigenMetVerhuurAanvragen()
        {
            var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("gebruiker niet gevonden");
                return Unauthorized(new { message = "Gebruiker niet ingelogd." });
            }

            var user = await _userManager.Users
                .Include(u => (u as ZakelijkeBeheerder).Bedrijf)
                .Include(u => (u as Huurder).Bedrijf)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                Console.WriteLine("user niet gevonden");
                return NotFound(new { message = "Gebruiker niet gevonden." });
            }

            var heeftBedrijf = (user as Huurder)?.Bedrijf != null;
            Console.WriteLine(heeftBedrijf);

            var voertuigenMetAanvragen = _context.Voertuigen
                .Include(v => v.Verhuuraanvragen)
                .Where(v => !heeftBedrijf || v.Soort == "Auto")
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
                    v.Afbeelding,
                    HeeftGoedgekeurdeAanvraag = v.Verhuuraanvragen.Any(va => va.Status == "Goedgekeurd"),
                    Verhuuraanvragen = v.Verhuuraanvragen
                        .Where(va => va.Status == "Goedgekeurd")
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

        // Alleen voertuigen ophalen waar de user een verhuuraanvraag van heeft gemaakt
        [HttpGet("voertuigen/met-aanvragen/van-user")]
        public async Task<IActionResult> GetVoertuigenMetVerhuurAanvragenVanUser()
        {
            var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Gebruiker is niet ingelogd.");
            }

            var voertuigenMetAanvragen = await _context.Voertuigen
                .Include(v => v.Verhuuraanvragen)
                .Where(v => v.Verhuuraanvragen.Any(va => va.HuurderId == userId)) // Filteren op aanvragen van de gebruiker
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
                    HeeftGoedgekeurdeAanvraag = v.Verhuuraanvragen.Any(va => va.HuurderId == userId && va.Status == "Goedgekeurd"),
                    Verhuuraanvragen = v.Verhuuraanvragen
                        .Where(va => va.HuurderId == userId) // Alleen aanvragen van de gebruiker
                        .Select(va => new
                        {
                            va.VerhuuraanvraagId,
                            va.Startdatum,
                            va.Einddatum,
                            va.Status
                        })
                        .ToList()
                })
                .ToListAsync();

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
            var requestBody = JsonSerializer.Serialize(verhuuraanvraagDto);
            Console.WriteLine($"Inkomende JSON: {requestBody}");
            try
            {
                var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

                var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));

                if (user == null)
                {
                    return Unauthorized("User not found.");
                }

                var huurder = user as Huurder;

                if (huurder == null)
                {
                    return BadRequest("Je moet een huurder zijn voor deze functie.");
                }


                var StartDatum = verhuuraanvraagDto.Startdatum;
                var EindDatum = verhuuraanvraagDto.Einddatum;

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
                    Startdatum = StartDatum,
                    Einddatum = EindDatum,
                    Status = "In behandeling",
                    HuurderId = userId,
                    VoertuigId = verhuuraanvraagDto.VoertuigId
                };

                try
                {
                    _context.Verhuuraanvragen.Add(nieuweAanvraag);
                    await _context.SaveChangesAsync();

                    string _voertuigMerk = verhuuraanvraagDto.VoertuigMerk;
                    string _voertuigType = verhuuraanvraagDto.VoertuigType;
                    double _voertuigPrijs = verhuuraanvraagDto.VoertuigPrijs;
                    string message = $"Uw verhuurverzoek voor: {_voertuigMerk} {_voertuigType} van {StartDatum.ToString("dd-MM-yyyy")} t/m {EindDatum.ToString("dd-MM-yyyy")} is verzonden en wordt spoedig behandeld door een medewerker. Wanneer deze wordt geaccepteerd bedraagt de huurprijs per dag: €{_voertuigPrijs}";

                    Console.WriteLine(message);
                    await _notificationService.SendNotificationAsync(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email)?.Value, "Bericht", null, "Verhuurzoek Inzending", message);
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

        //voertuig status updaten
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] VehicleModel vehicleModel)
        {
            if (vehicleModel == null)
            {
                return BadRequest(new { Message = "Ongeldige info." });
            }

            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.Id == User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (user == null)
            {
                return NotFound(new { Message = "Gebruiker niet gevonden." });
            }

            switch (user)
            {
                case Medewerker medewerker:
                    var existingVehicle = await _context.Voertuigen.FirstOrDefaultAsync(v => v.VoertuigId == id);
                    if (existingVehicle == null)
                    {
                        return NotFound(new { Message = "Voertuig niet gevonden." });
                    }

                    existingVehicle.Soort = vehicleModel.Soort;
                    existingVehicle.Merk = vehicleModel.Merk;
                    existingVehicle.Type = vehicleModel.Type;
                    existingVehicle.Kenteken = vehicleModel.Kenteken;
                    existingVehicle.Kleur = vehicleModel.Kleur;
                    existingVehicle.Aanschafjaar = vehicleModel.Aanschafjaar;
                    existingVehicle.Status = vehicleModel.Status ?? existingVehicle.Status;
                    existingVehicle.Prijs = vehicleModel.Prijs;

                    _context.Voertuigen.Update(existingVehicle);
                    await _context.SaveChangesAsync();

                    return Ok(new { Message = "Voertuig succesvol bijgewerkt." });

                default:
                    return Unauthorized("Niet geauthoriseerd.");
            }
        }

        //voertuig toevoegen in database
        [HttpPost("voertuig/database/add")]
        public async Task<IActionResult> AddVoertuig([FromBody] VehicleModel vehicleModel)
        {
            if (_context.Voertuigen.Any(v => v.Kenteken == vehicleModel.Kenteken))
            {
                return BadRequest("Een voertuig met dit kenteken bestaat al.");
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


            Voertuig voertuig = new Voertuig
            {
                Soort = vehicleModel.Soort,
                Merk = vehicleModel.Merk,
                Type = vehicleModel.Type,
                Kenteken = vehicleModel.Kenteken,
                Kleur = vehicleModel.Kleur,
                Aanschafjaar = vehicleModel.Aanschafjaar,
                Status = "Beschikbaar",
                Prijs = vehicleModel.Prijs
            };
            
            _context.Voertuigen.Add(voertuig);
            _context.SaveChanges();

            return Ok("Voertuig toegevoegd.");
        }

        //Voertuig uit de database verwijderen
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoertuig(int id)
        {
            var voertuig = _context.Voertuigen.Find(id);
            if (voertuig == null)
            {
                return NotFound("Voertuig niet gevonden.");
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

            _context.Voertuigen.Remove(voertuig);
            _context.SaveChanges();

            return Ok("Voertuig verwijderd.");
        }

        //Status veranderen van voertuig in database
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string nieuweStatus)
        {
            var geldigeStatussen = new[] { "Beschikbaar", "In reparatie", "Verhuurd" };

            if (!geldigeStatussen.Contains(nieuweStatus))
            {
                return BadRequest("Ongeldige status. Geldige statussen zijn: Beschikbaar, In reparatie, Verhuurd.");
            }

            var voertuig = _context.Voertuigen.Find(id);
            if (voertuig == null)
            {
                return NotFound($"Voertuig met ID {id} niet gevonden.");
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

            voertuig.Status = nieuweStatus;
            _context.SaveChanges();

            return Ok($"De status van voertuig met ID {id} is gewijzigd naar '{nieuweStatus}'.");
        }

        public class VehicleModel
        {
            public string Soort { get; set; }
            public string Merk { get; set; }
            public string Type { get; set; }
            public string Kenteken { get; set; }
            public string? Status { get; set; }
            public string Kleur { get; set; }
            public int Aanschafjaar { get; set; }
            public int Prijs { get; set; }
        }
    }
}