using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarAndAll_ASPReact.Server.Migrations
{
    /// <inheritdoc />
    public partial class dbcontext_verhuuraanvragen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Bedrijven_BedrijfId1",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Bedrijven_ZakelijkeBeheerder_BedrijfId1",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_BedrijfId1",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ZakelijkeBeheerder_BedrijfId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ZakelijkeBeheerder_BedrijfId1",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "BedrijfId1",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ZakelijkeBeheerder_BedrijfId1",
                table: "AspNetUsers");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ZakelijkeBeheerder_BedrijfId",
                table: "AspNetUsers",
                column: "ZakelijkeBeheerder_BedrijfId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_ZakelijkeBeheerder_BedrijfId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<int>(
                name: "BedrijfId1",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ZakelijkeBeheerder_BedrijfId1",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_BedrijfId1",
                table: "AspNetUsers",
                column: "BedrijfId1");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ZakelijkeBeheerder_BedrijfId",
                table: "AspNetUsers",
                column: "ZakelijkeBeheerder_BedrijfId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_ZakelijkeBeheerder_BedrijfId1",
                table: "AspNetUsers",
                column: "ZakelijkeBeheerder_BedrijfId1",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Bedrijven_BedrijfId1",
                table: "AspNetUsers",
                column: "BedrijfId1",
                principalTable: "Bedrijven",
                principalColumn: "BedrijfId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Bedrijven_ZakelijkeBeheerder_BedrijfId1",
                table: "AspNetUsers",
                column: "ZakelijkeBeheerder_BedrijfId1",
                principalTable: "Bedrijven",
                principalColumn: "BedrijfId");
        }
    }
}
