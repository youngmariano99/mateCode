using System.Net;

namespace MateCode.Core.Exceptions
{
    public class NotFoundException : BaseApiException
    {
        public NotFoundException(string errorCode, string message, string userFriendlyMessage = null)
            : base(HttpStatusCode.NotFound, errorCode, message, userFriendlyMessage)
        {
        }
    }

    public class BadRequestException : BaseApiException
    {
        public BadRequestException(string errorCode, string message, string userFriendlyMessage = null)
            : base(HttpStatusCode.BadRequest, errorCode, message, userFriendlyMessage)
        {
        }
    }

    public class UnauthorizedException : BaseApiException
    {
        public UnauthorizedException(string errorCode, string message, string userFriendlyMessage = null)
            : base(HttpStatusCode.Unauthorized, errorCode, message, userFriendlyMessage)
        {
        }
    }

    public class ForbiddenException : BaseApiException
    {
        public ForbiddenException(string errorCode, string message, string userFriendlyMessage = null)
            : base(HttpStatusCode.Forbidden, errorCode, message, userFriendlyMessage)
        {
        }
    }

    public class ConflictException : BaseApiException
    {
        public ConflictException(string errorCode, string message, string userFriendlyMessage = null)
            : base(HttpStatusCode.Conflict, errorCode, message, userFriendlyMessage)
        {
        }
    }

    public class InternalServerException : BaseApiException
    {
        public InternalServerException(string errorCode, string message, string userFriendlyMessage = null)
            : base(HttpStatusCode.InternalServerError, errorCode, message, userFriendlyMessage)
        {
        }
    }
}
