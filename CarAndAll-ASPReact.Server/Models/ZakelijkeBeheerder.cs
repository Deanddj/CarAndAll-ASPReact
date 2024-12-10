namespace CarAndAll_ASPReact.Server.Models
{
    public class ZakelijkeBeheerder : User
    {
        public int BedrijfId { get; set; }
        public Bedrijf Bedrijf { get; set; }
    }
}
