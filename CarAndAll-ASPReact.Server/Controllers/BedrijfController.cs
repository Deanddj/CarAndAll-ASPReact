using CarAndAll_ASPReact.Server.Models;
using CarAndAll_ASPReact.Server;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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

        //[HttpPost("add/{id}")]
        //public async Task<IActionResult> AddUser(int id)
        //{
        //    var user = await _userManager.FindByIdAsync(id.ToString());

        //    if (user == null)
        //    {
        //        return NotFound("User not found");
        //    }

        //}
    }
}