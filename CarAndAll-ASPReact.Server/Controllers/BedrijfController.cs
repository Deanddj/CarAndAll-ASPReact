using CarAndAll_ASPReact.Server.Models;
using CarAndAll_ASPReact.Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [Route("api/bedrijf")]
    [ApiController]
    public class BedrijfController : ControllerBase
    {
        private readonly CarAndAllDbContext _context;
        private readonly UserManager<User> _userManager;

        public BedrijfController(CarAndAllDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpDelete("remove-user/{id}")]
        public async Task<IActionResult> RemoveUserFromCompany(string id)
        {
            var user = await _userManager.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            var zakelijkeBeheerder = user as ZakelijkeBeheerder;

            if (zakelijkeBeheerder == null)
            {
                return BadRequest("You must be a zakelijke beheerder.");
            }

            var bedrijfId = zakelijkeBeheerder.BedrijfId;

            if (bedrijfId == null)
            {
                return NotFound("Company not found.");
            }

            var bedrijf = await _context.Bedrijven
                .Include(b => b.Huurders)
                .FirstOrDefaultAsync(b => b.BedrijfId == bedrijfId);

            if (bedrijf == null)
            {
                return NotFound("Company not found.");
            }

            var huurderToRemove = bedrijf.Huurders.FirstOrDefault(h => h.Id == id);

            if (huurderToRemove == null)
            {
                return NotFound("User not found.");
            }

            bedrijf.Huurders.Remove(huurderToRemove);

            huurderToRemove.Bedrijf = null;
            huurderToRemove.BedrijfId = null;

            await _context.SaveChangesAsync();

            return Ok("User removed from the company.");
        }

        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetBedrijf(int id)
        {
            var bedrijf = await _context.Bedrijven
                .Where(b => b.BedrijfId == id)
                .Select(b => new
                {
                    b.BedrijfId,
                    b.Naam,
                    b.Adres,
                    b.Kvk,
                    b.Abonnementstype,
                    Huurders = b.Huurders.Select(h => new
                    {
                        h.Id,
                        h.Naam,
                        h.Telefoonnummer,
                        h.Adres,
                        h.Email
                    }),
                    ZakelijkeBeheerder = new
                    {
                        b.ZakelijkeBeheerder.Id,
                        b.ZakelijkeBeheerder.Naam,
                        b.ZakelijkeBeheerder.Email
                    },
                    Abonnementen = b.Abonnementen.Select(a => new
                    {
                        a.AbonnementId,
                        a.Type
                    })
                })
                .FirstOrDefaultAsync();

            if (bedrijf == null)
            {
                return NotFound("Bedrijf niet gevonden");
            }

            return Ok(bedrijf);
        }
    }
}