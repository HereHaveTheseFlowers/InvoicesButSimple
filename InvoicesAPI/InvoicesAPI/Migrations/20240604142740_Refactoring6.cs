using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InvoicesAPI.Migrations
{
    /// <inheritdoc />
    public partial class Refactoring6 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Invoices",
                newName: "UserEmail");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserEmail",
                table: "Invoices",
                newName: "UserId");
        }
    }
}
