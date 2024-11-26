using CarAndAll_ASPReact.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace CarAndAll_ASPReact.Server
{
    public class CarAndAllDbContext : DbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.UseSqlite("Data Source=CarAndAll.db");
        }

        public DbSet<Bedrijf> Bedrijven { get; set; }
        public DbSet<Abonnement> Abonnementen { get; set; }
        public DbSet<Voertuig> Voertuigen { get; set; }
        public DbSet<Verhuuraanvraag> Verhuuraanvragen { get; set; }
    }
}
