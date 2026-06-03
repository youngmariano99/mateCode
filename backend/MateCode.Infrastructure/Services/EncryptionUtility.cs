using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using MateCode.Application.Services;

namespace MateCode.Infrastructure.Services
{
    public class EncryptionUtility : IEncryptionUtility
    {
        private readonly byte[] _masterKeyBytes;

        public EncryptionUtility(IConfiguration configuration)
        {
            var rawMasterKey = configuration["Security:MasterEncryptionKey"] 
                ?? "CLAVE_MAESTRA_POR_DEFECTO_MATECODE_DESARROLLO_LOCAL_998877665544";
            
            // Usamos SHA256 para obtener un arreglo de bytes determinista de 32 bytes (256 bits)
            using (var sha256 = SHA256.Create())
            {
                _masterKeyBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawMasterKey));
            }
        }

        public string GenerateRandomKey()
        {
            byte[] keyBytes = new byte[32]; // 256 bits
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(keyBytes);
            }
            return Convert.ToBase64String(keyBytes);
        }

        public string EncryptAgencyKey(string agencyKeyBase64)
        {
            // Cifra la llave de la agencia usando la llave maestra
            byte[] plainBytes = Convert.FromBase64String(agencyKeyBase64);
            byte[] encryptedBytes = EncryptAes(plainBytes, _masterKeyBytes);
            return Convert.ToBase64String(encryptedBytes);
        }

        public string DecryptAgencyKey(string encryptedAgencyKeyBase64)
        {
            // Descifra la llave de la agencia usando la llave maestra
            byte[] cipherBytes = Convert.FromBase64String(encryptedAgencyKeyBase64);
            byte[] decryptedBytes = DecryptAes(cipherBytes, _masterKeyBytes);
            return Convert.ToBase64String(decryptedBytes);
        }

        public string Encrypt(string plainText, string keyBase64)
        {
            if (string.IsNullOrEmpty(plainText)) return string.Empty;
            
            byte[] keyBytes = Convert.FromBase64String(keyBase64);
            byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
            byte[] encryptedBytes = EncryptAes(plainBytes, keyBytes);
            return Convert.ToBase64String(encryptedBytes);
        }

        public string Decrypt(string cipherTextBase64, string keyBase64)
        {
            if (string.IsNullOrEmpty(cipherTextBase64)) return string.Empty;

            byte[] keyBytes = Convert.FromBase64String(keyBase64);
            byte[] cipherBytes = Convert.FromBase64String(cipherTextBase64);
            byte[] decryptedBytes = DecryptAes(cipherBytes, keyBytes);
            return Encoding.UTF8.GetString(decryptedBytes);
        }

        // --- MÉTODOS AUXILIARES AES-256-CBC ---

        private byte[] EncryptAes(byte[] plainBytes, byte[] keyBytes)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = keyBytes;
                aes.GenerateIV(); // Generar IV aleatorio por cifrado
                
                using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
                using (var ms = new MemoryStream())
                {
                    // Escribimos primero el IV (16 bytes) para guardarlo junto al ciphertext
                    ms.Write(aes.IV, 0, aes.IV.Length);

                    using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                    {
                        cs.Write(plainBytes, 0, plainBytes.Length);
                        cs.FlushFinalBlock();
                    }
                    return ms.ToArray();
                }
            }
        }

        private byte[] DecryptAes(byte[] cipherBytesWithIv, byte[] keyBytes)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = keyBytes;
                
                // Extraer el IV (los primeros 16 bytes)
                byte[] iv = new byte[16];
                if (cipherBytesWithIv.Length < 16)
                {
                    throw new CryptographicException("Ciphertext inválido o muy corto (falta IV).");
                }
                Array.Copy(cipherBytesWithIv, 0, iv, 0, 16);
                aes.IV = iv;

                // El resto es el ciphertext
                int cipherSize = cipherBytesWithIv.Length - 16;
                byte[] cipherBytes = new byte[cipherSize];
                Array.Copy(cipherBytesWithIv, 16, cipherBytes, 0, cipherSize);

                using (var decryptor = aes.CreateDecryptor(aes.Key, aes.IV))
                using (var ms = new MemoryStream())
                {
                    using (var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.FlushFinalBlock();
                    }
                    return ms.ToArray();
                }
            }
        }
    }
}
