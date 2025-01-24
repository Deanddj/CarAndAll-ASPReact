using CarAndAll_ASPReact.Server;
using CarAndAll_ASPReact.Server.Controllers;
using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System.IO;

public class VoertuigControllerTests
{
    private SqliteConnection _connection;
    private DbContextOptions<CarAndAllDbContext> _contextOptions;

    public VoertuigControllerTests()
    {
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<CarAndAllDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new CarAndAllDbContext(_contextOptions);

        if (context.Database.EnsureCreated())
        {
            using var viewCommand = context.Database.GetDbConnection().CreateCommand();
            viewCommand.CommandText = @"
                                        CREATE VIEW AllResources AS
                                        SELECT Url
                                        FROM Blogs;";
            viewCommand.ExecuteNonQuery();
        }

        context.Voertuigen.AddRange(
                new Voertuig { Soort = "Auto", Merk = "Volkswagen", Type = "Golf", Kenteken = "AB123CD", Kleur = "Blauw", Aanschafjaar = 2019, Prijs = 15000 },
                new Voertuig { Soort = "Auto", Merk = "BMW", Type = "X5", Kenteken = "XY987ZX", Kleur = "Zwart", Aanschafjaar = 2020, Prijs = 25000 }
            );
        context.SaveChanges();
    }

    private CarAndAllDbContext CreateContext() => new CarAndAllDbContext(_contextOptions);

    [Fact]
    public async Task ReturnsAllVoertuigen()
    {
        // Arrange
        using var context = CreateContext();
        var controller = new VoertuigController(context, null, null);

        // Act
        var result = await controller.GetVoertuigenMetVerhuurAanvragen();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var voertuigen = Assert.IsType<List<Voertuig>>(okResult.Value);

        Assert.Equal(2, voertuigen.Count);
    }
}