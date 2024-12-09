using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using CarAndAll_ASPReact.Server.Models;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System;

namespace CarAndAll_ASPReact.Server.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;


        public AccountController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet("isAuthenticated")]
        public IActionResult IsAuthenticated()
        {
            if (User.Identity != null && User.Identity.IsAuthenticated)
            {
                return Ok(new { Message = "Authenticated" });
            }

            return Unauthorized(new { Message = "Not authenticated" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid login data.");
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null)
            {
                var result = await _signInManager.PasswordSignInAsync(user, model.Password, isPersistent: true, lockoutOnFailure: false);
                if (result.Succeeded)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, user.UserName),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.NameIdentifier, user.Id)
                    };

                    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var authProperties = new AuthenticationProperties
                    {
                        IsPersistent = true,
                        ExpiresUtc = DateTime.UtcNow.AddDays(1)
                    };

                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

                    return Ok(new { Message = "Login successful." });
                }
            }

            return Unauthorized(new { Message = "Invalid credentials." });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid registration data.");
            }

            var user = new User
            {
                UserName = model.Email,
                Email = model.Email,
                Adres = model.Adres,
                Telefoonnummer = model.Telefoonnummer,
                Kvk = model.Kvk
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                return Ok(new { Message = "User registered successfully." });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignOutAsync("Identity.Application");

            return Ok(new { Message = "Logged out successfully." });
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetUserDetails()
        {
            var userId = User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return NotFound(new { Message = "User ID not found in claims." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            bool isTelefoonnummerEmpty = string.IsNullOrEmpty(user.Telefoonnummer);
            bool isKvkEmpty = string.IsNullOrEmpty(user.Kvk);

            var userDetails = new
            {
                user.UserName,
                user.Email,
                user.Adres,
                user.Telefoonnummer,
                user.Kvk,
                isTelefoonnummerEmpty,
                isKvkEmpty
            };

            return Ok(userDetails);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateUserDetails([FromBody] UpdateUserModel model)
        {
            if (model == null)
            {
                return BadRequest(new { Message = "Invalid data." });
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            if (!string.IsNullOrEmpty(model.Email))
            {
                user.Email = model.Email;
            }
            if (!string.IsNullOrEmpty(model.Adres))
            {
                user.Adres = model.Adres;
            }
            if (!string.IsNullOrEmpty(model.Telefoonnummer))
            {
                user.Telefoonnummer = model.Telefoonnummer;
            }
            else
            {
                user.Telefoonnummer = null;
            }
            if (!string.IsNullOrEmpty(model.Kvk))
            {
                user.Kvk = model.Kvk;
            }
            else
            {
                user.Kvk = null;
            }

            if (string.IsNullOrEmpty(user.Telefoonnummer) && string.IsNullOrEmpty(user.Kvk))
            {
                return BadRequest(new { Message = "Either Telefoonnummer or KVK must be provided." });
            }

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { Message = "User details updated successfully." });
            }

            return BadRequest(new { Message = "Failed to update user details.", Errors = result.Errors });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUserAccount()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignOutAsync("Identity.Application");

            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return Ok(new { Message = "Account deleted successfully." });
            }

            return BadRequest(new { Message = "Failed to delete account.", Errors = result.Errors });
        }
    }
}

public class LoginModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class RegisterModel
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string Adres { get; set; }
    public string? Telefoonnummer { get; set; }
    public string? Kvk { get; set; }
}

public class UpdateUserModel
{
    public string Email { get; set; }
    public string Adres { get; set; }
    public string? Telefoonnummer { get; set; }
    public string? Kvk { get; set; }
}
