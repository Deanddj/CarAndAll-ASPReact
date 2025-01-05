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
public class VerhuuraanvragenController : ControllerBase
{
    private readonly CarAndAllDbContext _context;

    public VerhuuraanvragenController(CarAndAllDbContext context)
    {
        _context = context;
    }

   




}


