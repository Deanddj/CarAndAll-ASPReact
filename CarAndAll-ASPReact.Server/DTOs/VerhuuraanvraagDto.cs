namespace CarAndAll_ASPReact.Server.DTOs
{
    public class VerhuuraanvraagDto
    {
        public DateTime Startdatum { get; set; }
        public DateTime Einddatum { get; set; }
        public int VoertuigId { get; set; }
        public string VoertuigMerk { get; set; }
        public string VoertuigType { get; set; }
        public double VoertuigPrijs { get; set; }
    }

}
