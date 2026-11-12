namespace LagStore.Api.Services
{
    public interface IProductImageStorage
    {
        /// <summary>Salvează poza și întoarce calea ei publică, sau un mesaj de eroare dacă fișierul nu e acceptat.</summary>
        Task<(string? Url, string? Error)> SaveAsync(IFormFile file);

        /// <summary>Șterge de pe disc poza cu calea dată, dacă există.</summary>
        void Delete(string? imageUrl);
    }

    public class ProductImageStorage : IProductImageStorage
    {
        public const long MaxBytes = 5 * 1024 * 1024;
        public const string UrlPrefix = "/uploads/products/";

        private readonly string _folder;

        public ProductImageStorage(IWebHostEnvironment env)
        {
            _folder = Path.Combine(env.ContentRootPath, "wwwroot", "uploads", "products");
            Directory.CreateDirectory(_folder);
        }

        public async Task<(string? Url, string? Error)> SaveAsync(IFormFile file)
        {
            if (file.Length == 0)
                return (null, "Fișierul este gol.");
            if (file.Length > MaxBytes)
                return (null, "Poza poate avea maxim 5 MB.");

            // Tipul se stabilește din primii octeți ai fișierului, nu din numele lui
            var header = new byte[12];
            await using (var stream = file.OpenReadStream())
            {
                var read = await stream.ReadAsync(header);
                if (read < header.Length)
                    return (null, "Fișierul nu este o imagine validă.");
            }

            var extension = DetectExtension(header);
            if (extension == null)
                return (null, "Sunt acceptate doar poze JPG, PNG sau WEBP.");

            // Nume nou, aleatoriu: nu folosim niciodată numele trimis de utilizator
            var fileName = $"{Guid.NewGuid():N}{extension}";
            await using (var output = File.Create(Path.Combine(_folder, fileName)))
            {
                await file.CopyToAsync(output);
            }

            return (UrlPrefix + fileName, null);
        }

        public void Delete(string? imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl) || !imageUrl.StartsWith(UrlPrefix))
                return;

            // GetFileName elimină orice „../”, deci nu se poate ieși din folderul de poze
            var path = Path.Combine(_folder, Path.GetFileName(imageUrl));
            if (File.Exists(path))
                File.Delete(path);
        }

        private static string? DetectExtension(byte[] h)
        {
            if (h[0] == 0xFF && h[1] == 0xD8 && h[2] == 0xFF)
                return ".jpg";
            if (h[0] == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47)
                return ".png";
            if (h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F' &&
                h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P')
                return ".webp";
            return null;
        }
    }
}
