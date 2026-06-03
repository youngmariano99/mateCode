using System;
using System.Net;

namespace MateCode.Core.Exceptions
{
    public class BaseApiException : Exception
    {
        public HttpStatusCode StatusCode { get; }
        public string ErrorCode { get; }
        public string UserFriendlyMessage { get; }

        public BaseApiException(
            HttpStatusCode statusCode, 
            string errorCode, 
            string message, 
            string userFriendlyMessage = null) 
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
            UserFriendlyMessage = userFriendlyMessage ?? message;
        }
    }
}
