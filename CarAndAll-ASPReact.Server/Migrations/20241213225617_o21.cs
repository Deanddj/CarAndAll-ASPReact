using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarAndAll_ASPReact.Server.Migrations
{
    /// <inheritdoc />
    public partial class o21 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BedrijfId",
                table: "Notificaties",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BedrijfId",
                table: "Notificaties");
        }
    }
}
