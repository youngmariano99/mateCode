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
        private readonly MateCode.Infrastructure.Persistence.AppDbContext _context;

        public DevHubHub(MateCode.Infrastructure.Persistence.AppDbContext context)
        {
            _context = context;
        }

        public async Task JoinProjectGroup(string projectId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, projectId);
            await Clients.Group(projectId).SendAsync("UserJoined", Context.ConnectionId);
        }

        public async Task UpdatePresence(string projectId, UserPresence presence)
        {
            // Opcional: Podríamos loguear el cambio de zona si quisiéramos auditoría de movimiento exacta
            // Por ahora solo hacemos broadcast para mantener performance
            await Clients.Group(projectId).SendAsync("PresenceUpdated", presence);
        }

        public async Task LogMovement(string projectId, string userId, string nombre, string zonaAnterior, string zonaNueva)
        {
            try 
            {
                if (zonaAnterior == zonaNueva) return;
                if (!Guid.TryParse(projectId, out var pId) || !Guid.TryParse(userId, out var uId)) return;

                var log = new MateCode.Core.Entities.LogActividad
                {
                    ProyectoId = pId,
                    UsuarioId = uId,
                    NombreUsuario = nombre,
                    TipoEvento = "ENTRADA_SALA",
                    Detalles = System.Text.Json.JsonSerializer.SerializeToElement(new { sala = zonaNueva, desde = zonaAnterior }),
                    Fecha = System.DateTime.UtcNow
                };

                _context.LogsActividad.Add(log);
                await _context.SaveChangesAsync();

                await Clients.Group(projectId).SendAsync("ActivityLogged", log);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"[SignalR Error] LogMovement: {ex.Message}");
                if (ex.InnerException != null) System.Console.WriteLine($"Inner: {ex.InnerException.Message}");
            }
        }

        public async Task ConvocarReunion(string projectId, string tema, string nombreCreador, string creadorId, string reunionId = "")
        {
            try 
            {
                if (!Guid.TryParse(projectId, out var pId) || !Guid.TryParse(creadorId, out var cId)) return;

                var log = new MateCode.Core.Entities.LogActividad
                {
                    ProyectoId = pId,
                    UsuarioId = cId,
                    NombreUsuario = nombreCreador,
                    TipoEvento = "INICIO_REUNION",
                    Detalles = System.Text.Json.JsonSerializer.SerializeToElement(new { tema = tema, reunionId = reunionId }),
                    Fecha = System.DateTime.UtcNow
                };

                _context.LogsActividad.Add(log);
                await _context.SaveChangesAsync();

                await Clients.Group(projectId).SendAsync("EmergencyMeetingCalled", new {
                    Tema = tema,
                    NombreCreador = nombreCreador,
                    CreadorId = creadorId,
                    ReunionId = reunionId,
                    Timestamp = System.DateTime.UtcNow
                });

                await Clients.Group(projectId).SendAsync("ActivityLogged", log);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"[SignalR Error] ConvocarReunion: {ex.Message}");
            }
        }

        public async Task SendGlobalMessage(string projectId, string userId, string nombre, string text)
        {
            try 
            {
                if (!Guid.TryParse(projectId, out var pId) || !Guid.TryParse(userId, out var uId)) return;

                var mensaje = new MateCode.Core.Entities.MensajeGlobal
                {
                    ProyectoId = pId,
                    UsuarioId = uId,
                    NombreUsuario = nombre,
                    Contenido = text,
                    Fecha = System.DateTime.UtcNow
                };

                _context.MensajesGlobales.Add(mensaje);
                await _context.SaveChangesAsync();

                await Clients.Group(projectId).SendAsync("ReceiveGlobalMessage", new {
                    NombreUsuario = nombre,
                    Contenido = text,
                    UsuarioId = userId,
                    Fecha = mensaje.Fecha
                });

                // También lo agregamos al feed de actividad
                var log = new MateCode.Core.Entities.LogActividad
                {
                    ProyectoId = pId,
                    UsuarioId = uId,
                    NombreUsuario = nombre,
                    TipoEvento = "CHAT_ENVIADO",
                    Detalles = System.Text.Json.JsonSerializer.SerializeToElement(new { extracto = text.Length > 20 ? text.Substring(0, 20) + "..." : text }),
                    Fecha = System.DateTime.UtcNow
                };
                _context.LogsActividad.Add(log);
                await _context.SaveChangesAsync();
                await Clients.Group(projectId).SendAsync("ActivityLogged", log);
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"[SignalR Error] SendGlobalMessage: {ex.Message}");
                if (ex.InnerException != null) System.Console.WriteLine($"Inner: {ex.InnerException.Message}");
                throw; // Re-lanzamos para que SignalR sepa que falló, pero ahora tenemos el log
            }
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

        // --- COLABORACIÓN EN REUNIÓN (SALA DE GUERRA) ---
        public async Task SendMeetingMessage(string groupId, string user, string text)
        {
            await Clients.Group(groupId).SendAsync("ReceiveChatMessage", user, text);
        }

        public async Task StartPoll(string groupId, object pollData)
        {
            // pollData contiene { id, pregunta, tipo, opciones }
            await Clients.Group(groupId).SendAsync("PollStarted", pollData);
        }

        public async Task ClosePoll(string groupId, string pollId, object finalPollData)
        {
            // finalPollData contiene los resultados finales calculados
            await Clients.Group(groupId).SendAsync("PollClosed", pollId, finalPollData);
        }

        public async Task SubmitPollVote(string groupId, string pollId, object voteData)
        {
            // voteData contiene { userId, opcionesSeleccionadas }
            await Clients.Group(groupId).SendAsync("PollVoteReceived", pollId, voteData);
        }

        public async Task DrawOnWhiteboard(string groupId, object drawData)
        {
            await Clients.OthersInGroup(groupId).SendAsync("DrawReceived", drawData);
        }
    }
}
