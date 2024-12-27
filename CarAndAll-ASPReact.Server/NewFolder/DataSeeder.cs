using CarAndAll_ASPReact.Server.Models;

namespace CarAndAll_ASPReact.Server.NewFolder
{
    public class DataSeeder
    {
        private readonly CarAndAllDbContext _context;

        public DataSeeder(CarAndAllDbContext context)
        {
            _context = context;
        }

        public void SeedData()
        {
            Console.WriteLine("Start");

            string filePath = @"..\Items\voertuigen.txt";

            if (File.Exists(filePath))
            {
                string[] lines = File.ReadAllLines(filePath);
                List<Voertuig> voertuigen = new List<Voertuig>();

                foreach (string line in lines)
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    string[] parts = line.Split(new[] { ", " }, StringSplitOptions.None);

                    var voertuig = new Voertuig
                    {
                        Merk = GetValue(parts, "Merk:"),
                        Type = GetValue(parts, "Type:"),
                        Kenteken = GetValue(parts, "Kenteken:"),
                        Kleur = GetValue(parts, "Kleur:"),
                        Aanschafjaar = ConvertToInt(GetValue(parts, "Aanschafjaar")),
                        Soort = GetValue(parts, "Soort:"),
                        Status = "Beschikbaar",
                        Prijs = ConvertToDouble(GetValue(parts, "Prijs"))
                    };

                    voertuigen.Add(voertuig);
                }

                if (!_context.Voertuigen.Any()) // Check if the table is empty
                {
                    _context.Voertuigen.AddRange(voertuigen);
                    _context.SaveChanges();
                    Console.WriteLine("Database seeded with voertuigen data.");
                }
                else
                {
                    Console.WriteLine("Database already contains data. Skipping seed.");
                }
            }
            else
            {
                Console.WriteLine("File not found: " + filePath);
            }
        }

        static string GetValue(string[] parts, string key)
        {
            foreach (var part in parts)
            {
                if (part.StartsWith(key))
                {
                    return part.Substring(key.Length).Trim();
                }
            }
            return null;
        }

        static int ConvertToInt(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return 0; // Default value if the value is empty
            }

            value = value.Replace(": ", "").Trim(); // Remove ": " and any surrounding spaces

            //Console.WriteLine($"Aanschafjaar string after stripping: '{value}'"); // Debugging: Check the stripped value

            int result = 0; // Default value if the conversion fails
            if (int.TryParse(value, out result))
            {
                return result;
            }

            return 0; // Or another default value if the conversion fails
        }
        static double ConvertToDouble(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return 0.0; // Default value if the value is empty
            }

            value = value.Replace(": ", "").Trim(); // Remove ": " and any surrounding spaces

            // Console.WriteLine($"Value string after stripping: '{value}'"); // Debugging: Check the stripped value

            double result = 0.0; // Default value if the conversion fails
            if (double.TryParse(value, out result))
            {
                return Math.Round(result, 2); // Round the result to 2 decimal places
            }

            return 0.0; // Or another default value if the conversion fails
        }

    }
}
