using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using CarAndAll_ASPReact.Server.Models;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.CodeAnalysis.Editing;
using NuGet.Protocol;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly CarAndAllDbContext _context;
        private readonly NotificationService _notificationService;

        public AccountController(CarAndAllDbContext context, UserManager<User> userManager, SignInManager<User> signInManager, NotificationService notificationService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _notificationService = notificationService;
        }

        [HttpGet("isAuthenticated")]
        public IActionResult IsAuthenticated()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return Ok(new { Message = "Geauthoriseerd" });
            }

            return Unauthorized(new { Message = "Niet geauthoriseerd" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (model == null)
            {
                return BadRequest("Ongeldige login details.");
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized();
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Wachtwoord, isPersistent: true, lockoutOnFailure: false);
            if (result.Succeeded)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Email, user.UserName),
                    new Claim(ClaimTypes.NameIdentifier, user.Id)
                };

                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties

                {
                    IsPersistent = true,
                    ExpiresUtc = DateTime.UtcNow.AddDays(1)
                };

                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                return Ok(new { Message = "Login succesvol." });
            }
            else
            {
                return Unauthorized();
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserModel model)
        {
            if (model == null)
            {
                return BadRequest("Ongeldige info.");
            }

            User user;

            if (model.AccountType == "particulier")
            {
                user = new Huurder
                {
                    UserName = model.Email,
                    Email = model.Email,
                    Naam = model.Naam,
                    Adres = model.Adres,
                    Telefoonnummer = model.Telefoonnummer,
                };
            }
            else if (model.AccountType == "zakelijk")
            {
                user = new ZakelijkeBeheerder
                {
                    UserName = model.Email,
                    Email = model.Email,
                    Naam = model.Naam,
                    Bedrijf = new()
                    {
                        Adres = model.BedrijfAdres,
                        Kvk = model.Kvk,
                        Naam = model.BedrijfNaam
                    }
                };
            }
            else
            {
                return BadRequest("Ongeldig account type.");
            }

            var userResult = await _userManager.CreateAsync(user, model.Wachtwoord);

            if (userResult.Succeeded)
            {
                await _notificationService.SendNotificationAsync(user.Email, "Bericht", null, "Account registratie", "Uw account is succesvol geregistreerd!");
                return Ok(new { Message = "Gebruiker succesvol geregistreerd." });
            }

            return BadRequest(userResult.ToJson());
        }


        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignOutAsync("Identity.Application");

            return Ok(new { Message = "Succesvol uitgelogd." });
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetUserDetails()
        {
            var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return NotFound(new { Message = "Gebruiker ID komt niet voor in claims, of gebruiker is niet ingelogd." });
            }

            var user = await _userManager.Users
                .Include(u => (u as ZakelijkeBeheerder).Bedrijf)
                .Include(u => (u as Huurder).Bedrijf)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { Message = "Gebruiker niet gevonden." });
            }

            if (user is ZakelijkeBeheerder zakelijkeBeheerder)
            {
                return Ok(new
                {
                    zakelijkeBeheerder.Id,
                    Type = nameof(ZakelijkeBeheerder),
                    zakelijkeBeheerder.UserName,
                    zakelijkeBeheerder.Naam,
                    Bedrijf = new
                    {
                        zakelijkeBeheerder.BedrijfId,
                        zakelijkeBeheerder.Bedrijf.Kvk,
                        zakelijkeBeheerder.Bedrijf.Adres,
                        zakelijkeBeheerder.Bedrijf.Naam
                    }
                });
            }
            else if (user is Medewerker medewerker)
            {
                return Ok(new
                {
                    medewerker.Id,
                    Type = nameof(Medewerker),
                    medewerker.UserName,
                    medewerker.Naam,
                    medewerker.Rol
                });
            }
            else if (user is Huurder huurder)
            {
                return Ok(new
                {
                    huurder.Id,
                    Type = nameof(Huurder),
                    huurder.UserName,
                    huurder.Naam,
                    huurder.Telefoonnummer,
                    huurder.Adres,
                    Bedrijf = huurder.Bedrijf != null ? new
                    {
                        huurder.BedrijfId,
                        huurder.Bedrijf.Kvk,
                        huurder.Bedrijf.Adres,
                        huurder.Bedrijf.Naam
                    } : null
                });
            }
            else
            {
                return Ok(new
                {
                    user.Id,
                    Type = nameof(User),
                    user.UserName,
                    user.Naam,
                });
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateUserDetails([FromBody] UpdateUserModel model)
        {
            if (model == null)
            {
                return BadRequest(new { Message = "Ongeldige info." });
            }

            var user = await _userManager.Users
       .Include(u => (u as ZakelijkeBeheerder).Bedrijf)
       .FirstOrDefaultAsync(u => u.Id == User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (user == null)
            {
                return NotFound(new { Message = "Gebruiker niet gevonden." });
            }

            if (!string.IsNullOrEmpty(model.Naam))
                user.Naam = model.Naam;

            if (!string.IsNullOrEmpty(model.Email))
                user.Email = model.Email;
                user.UserName = model.Email;

            switch (user)
            {
                case Huurder huurder:
                    if (!string.IsNullOrEmpty(model.Adres))
                        huurder.Adres = model.Adres;

                    if (!string.IsNullOrEmpty(model.Telefoonnummer))
                        huurder.Telefoonnummer = model.Telefoonnummer;

                    if (model.BedrijfId.HasValue)
                        huurder.BedrijfId = model.BedrijfId;

                    break;

                case ZakelijkeBeheerder beheerder:
                    if (model.Bedrijf != null)
                    {
                        if (!string.IsNullOrEmpty(model.Bedrijf.Naam))
                            beheerder.Bedrijf.Naam = model.Bedrijf.Naam;

                        if (!string.IsNullOrEmpty(model.Bedrijf.Adres))
                            beheerder.Bedrijf.Adres = model.Bedrijf.Adres;

                        if (!string.IsNullOrEmpty(model.Bedrijf.Kvk))
                            beheerder.Bedrijf.Kvk = model.Bedrijf.Kvk;
                    }
                    break;

                case Medewerker medewerker:
                    if (!string.IsNullOrEmpty(model.Rol))
                        medewerker.Rol = model.Rol;
                    break;
            }

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Ok(user);
            }

            return BadRequest(new { Message = "Gebruiker gegevens konden niet worden bijgewerkt", Errors = result.Errors });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUserAccount()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { Message = "Gebruiker niet gevonden." });
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignOutAsync("Identity.Application");


            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Account verwijderd." });
            }

            return BadRequest(new { Message = "Account kon niet worden verwijderd.", Errors = result.Errors });
        }
    }
}

//[HttpGet("account/{Id}")]

public class LoginModel
{
    public string Email { get; set; }
    public string Wachtwoord { get; set; }
}

public class RegisterUserModel
{
    public string Naam { get; set; }
    public string Email { get; set; }
    public string Wachtwoord { get; set; }
    public string Adres { get; set; }
    public string? Telefoonnummer { get; set; }
    public string? Kvk { get; set; }
    public string? BedrijfNaam { get; set; }
    public string? BedrijfAdres { get; set; }
    public string AccountType { get; set; }
}
public class UpdateUserModel
{
    public string Naam { get; set; }
    public string Email { get; set; }
    public string? Adres { get; set; }
    public string? Telefoonnummer { get; set; }
    public int? BedrijfId { get; set; }
    public BedrijfUpdateModel? Bedrijf { get; set; }
    public string? Rol { get; set; }
}

public class BedrijfUpdateModel
{
    public string Naam { get; set; }
    public string Adres { get; set; }
    public string Kvk { get; set; }
}
