using System;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;
using MateCode.Infrastructure.Services;

namespace MateCode.Tests.Services
{
    public class EncryptionUtilityTests
    {
        private readonly IConfiguration _mockConfig;
        private readonly EncryptionUtility _sut; // System Under Test

        public EncryptionUtilityTests()
        {
            _mockConfig = Substitute.For<IConfiguration>();
            _mockConfig["Security:MasterEncryptionKey"].Returns("TEST_MASTER_KEY_SUPER_SAFE_12345");
            _sut = new EncryptionUtility(_mockConfig);
        }

        [Fact]
        public void GenerateRandomKey_ShouldReturnValidBase64Key()
        {
            // Act
            var keyBase64 = _sut.GenerateRandomKey();

            // Assert
            Assert.False(string.IsNullOrEmpty(keyBase64));
            
            // Should be a valid base64 representation of 32 bytes (44 chars including padding)
            var bytes = Convert.FromBase64String(keyBase64);
            Assert.Equal(32, bytes.Length);
        }

        [Fact]
        public void EncryptAndDecryptAgencyKey_ShouldReturnOriginalKey()
        {
            // Arrange
            var originalAgencyKey = _sut.GenerateRandomKey();

            // Act
            var encrypted = _sut.EncryptAgencyKey(originalAgencyKey);
            var decrypted = _sut.DecryptAgencyKey(encrypted);

            // Assert
            Assert.NotEqual(originalAgencyKey, encrypted);
            Assert.Equal(originalAgencyKey, decrypted);
        }

        [Fact]
        public void EncryptAndDecryptText_ShouldReturnOriginalText()
        {
            // Arrange
            var key = _sut.GenerateRandomKey();
            var originalText = "Este es un secreto de desarrollo ultra confidencial para MateCode.";

            // Act
            var encrypted = _sut.Encrypt(originalText, key);
            var decrypted = _sut.Decrypt(encrypted, key);

            // Assert
            Assert.NotEqual(originalText, encrypted);
            Assert.Equal(originalText, decrypted);
        }

        [Fact]
        public void Decrypt_WithInvalidCipherText_ShouldThrowCryptographicException()
        {
            // Arrange
            var key = _sut.GenerateRandomKey();
            var invalidCipherText = Convert.ToBase64String(new byte[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18 });

            // Act & Assert
            Assert.ThrowsAny<Exception>(() => _sut.Decrypt(invalidCipherText, key));
        }

        [Fact]
        public void Encrypt_WithEmptyText_ShouldReturnEmptyString()
        {
            // Arrange
            var key = _sut.GenerateRandomKey();

            // Act
            var result = _sut.Encrypt(string.Empty, key);

            // Assert
            Assert.Equal(string.Empty, result);
        }
    }
}
