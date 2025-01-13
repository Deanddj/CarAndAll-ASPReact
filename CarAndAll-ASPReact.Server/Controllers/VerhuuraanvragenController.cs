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

[ApiController]
[Route("api/[controller]")]
public class VerhuuraanvragenController : ControllerBase
{
    private readonly CarAndAllDbContext _context;

    public VerhuuraanvragenController(CarAndAllDbContext context)
    {
        _context = context;
    }


    [HttpGet("alle-aanvragen")]
    public async Task<IActionResult> getaanvragen()
    {
        var verhuuraanvragen = await _context.Verhuuraanvragen
        .ToListAsync();

        return Ok(verhuuraanvragen);
    }

    [HttpPut("goedkeuren/{id}")]
    public async Task<IActionResult> GoedkeurenAanvraag(int id)
    {
        var aanvraag = await _context.Verhuuraanvragen
            .FirstOrDefaultAsync(a => a.VerhuuraanvraagId == id);

        if (aanvraag == null)
        {
            return NotFound();
        }

        aanvraag.Status = "Goedgekeurd";
        await _context.SaveChangesAsync();

        return Ok(aanvraag);
    }

    [HttpPut("afkeuren/{id}")]
    public async Task<IActionResult> AfkeurenAanvraag(int id)
    {
        var aanvraag = await _context.Verhuuraanvragen
            .FirstOrDefaultAsync(a => a.VerhuuraanvraagId == id);

        if (aanvraag == null)
        {
            return NotFound();
        }

        aanvraag.Status = "Afgekeurd";
        await _context.SaveChangesAsync();

        return Ok(aanvraag);
    }





}