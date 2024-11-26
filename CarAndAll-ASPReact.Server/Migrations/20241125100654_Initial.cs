using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarAndAll_ASPReact.Server.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bedrijven",
                columns: table => new
                {
                    BedrijfId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Adres = table.Column<string>(type: "TEXT", nullable: false),
                    KvkNummer = table.Column<string>(type: "TEXT", nullable: false),
                    Abonnementstype = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bedrijven", x => x.BedrijfId);
                });

            migrationBuilder.CreateTable(
                name: "Klant",
                columns: table => new
                {
                    KlantId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Adres = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Telefoonnummer = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Klant", x => x.KlantId);
                });

            migrationBuilder.CreateTable(
                name: "Voertuigen",
                columns: table => new
                {
                    VoertuigId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Merk = table.Column<string>(type: "TEXT", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Kenteken = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Voertuigen", x => x.VoertuigId);
                });

            migrationBuilder.CreateTable(
                name: "Abonnementen",
                columns: table => new
                {
                    AbonnementId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Startdatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Einddatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    BedrijfId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Abonnementen", x => x.AbonnementId);
                    table.ForeignKey(
                        name: "FK_Abonnementen_Bedrijven_BedrijfId",
                        column: x => x.BedrijfId,
                        principalTable: "Bedrijven",
                        principalColumn: "BedrijfId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ZakelijkeBeheerder",
                columns: table => new
                {
                    ZakelijkeBeheerderId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    BedrijfId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ZakelijkeBeheerder", x => x.ZakelijkeBeheerderId);
                    table.ForeignKey(
                        name: "FK_ZakelijkeBeheerder_Bedrijven_BedrijfId",
                        column: x => x.BedrijfId,
                        principalTable: "Bedrijven",
                        principalColumn: "BedrijfId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ZakelijkeHuurder",
                columns: table => new
                {
                    ZakelijkeHuurderId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    BedrijfId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ZakelijkeHuurder", x => x.ZakelijkeHuurderId);
                    table.ForeignKey(
                        name: "FK_ZakelijkeHuurder_Bedrijven_BedrijfId",
                        column: x => x.BedrijfId,
                        principalTable: "Bedrijven",
                        principalColumn: "BedrijfId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Verhuuraanvragen",
                columns: table => new
                {
                    VerhuuraanvraagId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Startdatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Einddatum = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    KlantId = table.Column<int>(type: "INTEGER", nullable: true),
                    ZakelijkeHuurderId = table.Column<int>(type: "INTEGER", nullable: true),
                    VoertuigId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Verhuuraanvragen", x => x.VerhuuraanvraagId);
                    table.ForeignKey(
                        name: "FK_Verhuuraanvragen_Klant_KlantId",
                        column: x => x.KlantId,
                        principalTable: "Klant",
                        principalColumn: "KlantId");
                    table.ForeignKey(
                        name: "FK_Verhuuraanvragen_Voertuigen_VoertuigId",
                        column: x => x.VoertuigId,
                        principalTable: "Voertuigen",
                        principalColumn: "VoertuigId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Verhuuraanvragen_ZakelijkeHuurder_ZakelijkeHuurderId",
                        column: x => x.ZakelijkeHuurderId,
                        principalTable: "ZakelijkeHuurder",
                        principalColumn: "ZakelijkeHuurderId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Abonnementen_BedrijfId",
                table: "Abonnementen",
                column: "BedrijfId");

            migrationBuilder.CreateIndex(
                name: "IX_Verhuuraanvragen_KlantId",
                table: "Verhuuraanvragen",
                column: "KlantId");

            migrationBuilder.CreateIndex(
                name: "IX_Verhuuraanvragen_VoertuigId",
                table: "Verhuuraanvragen",
                column: "VoertuigId");

            migrationBuilder.CreateIndex(
                name: "IX_Verhuuraanvragen_ZakelijkeHuurderId",
                table: "Verhuuraanvragen",
                column: "ZakelijkeHuurderId");

            migrationBuilder.CreateIndex(
                name: "IX_ZakelijkeBeheerder_BedrijfId",
                table: "ZakelijkeBeheerder",
                column: "BedrijfId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ZakelijkeHuurder_BedrijfId",
                table: "ZakelijkeHuurder",
                column: "BedrijfId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Abonnementen");

            migrationBuilder.DropTable(
                name: "Verhuuraanvragen");

            migrationBuilder.DropTable(
                name: "ZakelijkeBeheerder");

            migrationBuilder.DropTable(
                name: "Klant");

            migrationBuilder.DropTable(
                name: "Voertuigen");

            migrationBuilder.DropTable(
                name: "ZakelijkeHuurder");

            migrationBuilder.DropTable(
                name: "Bedrijven");
        }
    }
}
