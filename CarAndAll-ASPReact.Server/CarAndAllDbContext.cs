using CarAndAll_ASPReact.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace CarAndAll_ASPReact.Server
{
    public class CarAndAllDbContext : IdentityDbContext<User>
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            optionsBuilder.UseSqlite("Data Source=CarAndAll.db");
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Medewerker>()
            .HasBaseType<User>();

            builder.Entity<Verhuuraanvraag>()
            .HasOne(va => va.Voertuig)
            .WithMany(v => v.Verhuuraanvragen)
            .HasForeignKey(va => va.VoertuigId);

        }
        public DbSet<Bedrijf> Bedrijven { get; set; }
        public DbSet<Abonnement> Abonnementen { get; set; }
        public DbSet<Voertuig> Voertuigen { get; set; }
        public DbSet<Verhuuraanvraag> Verhuuraanvragen { get; set; }
        public DbSet<Notification> Notificaties { get; set; }
    }
}
