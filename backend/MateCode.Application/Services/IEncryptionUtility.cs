namespace MateCode.Application.Services
{
    public interface IEncryptionUtility
    {
        /// <summary>
        /// Encripta un texto plano usando una clave de cifrado simétrica (Base64).
        /// </summary>
        string Encrypt(string plainText, string keyBase64);

        /// <summary>
        /// Desencripta un texto cifrado usando una clave de cifrado simétrica (Base64).
        /// </summary>
        string Decrypt(string cipherTextBase64, string keyBase64);

        /// <summary>
        /// Genera una clave criptográfica aleatoria de 256 bits codificada en Base64.
        /// </summary>
        string GenerateRandomKey();

        /// <summary>
        /// Encripta la clave de una agencia usando la clave maestra de entorno.
        /// </summary>
        string EncryptAgencyKey(string agencyKeyBase64);

        /// <summary>
        /// Desencripta la clave de una agencia usando la clave maestra de entorno.
        /// </summary>
        string DecryptAgencyKey(string encryptedAgencyKeyBase64);
    }
}
