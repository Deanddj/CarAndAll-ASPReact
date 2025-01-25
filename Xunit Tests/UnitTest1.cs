using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using CarAndAll_ASPReact.Server;
using CarAndAll_ASPReact.Server.Controllers;
using CarAndAll_ASPReact.Server.DTOs;
using CarAndAll_ASPReact.Server.Models;

public class VerhuuraanvragenControllerTests
{
    [Fact]
    public async Task VoegSchadeClaimToe_ReturnsOk_WhenVoertuigExists()
    {
        var options = new DbContextOptionsBuilder<CarAndAllDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new CarAndAllDbContext(options);

        var voertuig = new Voertuig
        {
            VoertuigId = 1,
            Soort = "Auto",
            Merk = "Tesla",
            Type = "Model S",
            Kenteken = "AB-123-CD",
            Kleur = "Zwart",
            Status = "Beschikbaar",
            Prijs = 80000
        };
        context.Voertuigen.Add(voertuig);
        await context.SaveChangesAsync();

        var controller = new VerhuuraanvragenController(context, null, null);

        var schadeclaim = new SchadeclaimDTO
        {
            Commentaar = "Kleine kras op de bumper",
            Datum = DateTime.UtcNow
        };

        var result = await controller.VoegSchadeClaimToe(voertuig.VoertuigId, schadeclaim);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnedClaim = Assert.IsType<SchadeclaimDTO>(okResult.Value);
        Assert.Equal(schadeclaim.Commentaar, returnedClaim.Commentaar);

        var savedClaim = await context.Schadeclaims.FirstOrDefaultAsync();
        Assert.NotNull(savedClaim);
        Assert.Equal(voertuig.VoertuigId, savedClaim.VoertuigId);
        Assert.Equal("In behandeling", savedClaim.Status);
        Assert.Equal(schadeclaim.Commentaar, savedClaim.Commentaar);
    }

    [Fact]
    public async Task VoegSchadeClaimToe_ReturnsNotFound_WhenVoertuigDoesNotExist()
    {
        var options = new DbContextOptionsBuilder<CarAndAllDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new CarAndAllDbContext(options);

        var controller = new VerhuuraanvragenController(context, null, null);

        var schadeclaim = new SchadeclaimDTO
        {
            Commentaar = "Kras op de deur",
            Datum = DateTime.UtcNow
        };

        var result = await controller.VoegSchadeClaimToe(999, schadeclaim);

        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Voertuig niet gevonden", notFoundResult.Value);
    }
}
