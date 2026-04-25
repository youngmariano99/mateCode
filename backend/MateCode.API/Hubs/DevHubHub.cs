using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MateCode.API.Hubs
{
    public class UserPresence
    {
        public string UserId { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string ZonaActual { get; set; } = "pasillo"; // pasillo, focus_backend, focus_frontend, reunion
        public ActivityInfo? ActividadActual { get; set; }
        public DialogBubble? GloboDialogo { get; set; }
    }

    public class ActivityInfo
    {
        public string Tipo { get; set; } = string.Empty; // ticket, bug, decision
        public string Id { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
    }

    public class DialogBubble
    {
        public string Texto { get; set; } = string.Empty;
        public string Tipo { get; set; } = "info"; // info, accion, alerta
        public long ExpiraEn { get; set; }
    }

    public class DevHubHub : Hub
    {
        public async Task JoinProjectGroup(string projectId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, projectId);
            await Clients.Group(projectId).SendAsync("UserJoined", Context.ConnectionId);
        }

        public async Task UpdatePresence(string projectId, UserPresence presence)
        {
            await Clients.Group(projectId).SendAsync("PresenceUpdated", presence);
        }

        public async Task ConvocarReunion(string projectId, string entidadId, string tipo, string creadorId)
        {
            await Clients.Group(projectId).SendAsync("EmergencyMeetingCalled", entidadId, tipo, creadorId);
        }

        public async Task UnirseAReunion(string projectId, string reunionId)
        {
            await Clients.Group(projectId).SendAsync("UserJoinedMeeting", reunionId, Context.ConnectionId);
        }

        public async Task FinalizarReunion(string projectId)
        {
            await Clients.Group(projectId).SendAsync("MeetingEnded");
        }

        public async Task SetFocusMode(string projectId, string ticketId, string userAvatarUrl, string userName)
        {
            await Clients.Group(projectId).SendAsync("UserFocused", ticketId, userAvatarUrl, userName);
        }

        public async Task ClearFocusMode(string projectId, string ticketId)
        {
            await Clients.Group(projectId).SendAsync("UserUnfocused", ticketId, Context.ConnectionId);
        }

        public async Task LeaveProjectGroup(string projectId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, projectId);
        }
    }
}
