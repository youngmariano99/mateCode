import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { supabase } from '../lib/supabase';
import { api } from '../lib/apiClient';

interface UserPresence {
  userId: string;
  nombre: string;
  zonaActual: string;
  avatarUrl?: string;
  actividadActual?: { tipo: string, id: string, titulo: string, especialidad?: string };
  globoDialogo?: { texto: string, tipo: 'info' | 'accion' | 'alerta', expiraEn: number };
}

interface PresenceContextType {
  presences: Record<string, UserPresence>;
  emergencyMeeting: any;
  currentUser: any;
  callEmergencyMeeting: (tema: string, projectId: string, descripcion?: string) => Promise<boolean>;
  finalizeMeeting: (acta: any) => Promise<void>;
  setEmergencyMeeting: (meeting: any) => void;
  sendMeetingMessage: (text: string) => void;
  lastChatMessage: any;
  submitMeetingVote: (voteType: string) => void;
  lastVote: any;
  sendDrawAction: (drawData: any) => void;
  lastDrawAction: any;
  // Encuestas Dinámicas
  startPoll: (pollData: any) => void;
  closePoll: (pollId: string, finalPollData: any) => void;
  submitPollVote: (pollId: string, voteData: any) => void;
  lastPollStarted: any;
  lastPollClosed: any;
  lastPollVoteReceived: any;
  // Centro de Mando
  globalChat: any[];
  activityLogs: any[];
  sendGlobalMessage: (text: string) => void;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { workspaceId, activeRoom } = useWorkspaceStore();
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [emergencyMeeting, setEmergencyMeeting] = useState<any>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const connectedWsIdRef = useRef<string | null>(null);
  const prevRoomRef = useRef<string>("pasillo");

  const [lastChatMessage, setLastChatMessage] = useState<any>(null);
  const [lastVote, setLastVote] = useState<any>(null);
  const [lastDrawAction, setLastDrawAction] = useState<any>(null);
  const [lastPollStarted, setLastPollStarted] = useState<any>(null);
  const [lastPollClosed, setLastPollClosed] = useState<any>(null);
  const [lastPollVoteReceived, setLastPollVoteReceived] = useState<any>(null);
  
  const [globalChat, setGlobalChat] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const isValidUUID = (id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (workspaceId && isValidUUID(workspaceId)) {
        setPresences({});
        // Cargar historial inicial solo si es un UUID válido
        api.get(`WorkspaceActivity/${workspaceId}/logs`).then(res => setActivityLogs(res as any[]));
        api.get(`WorkspaceActivity/${workspaceId}/chat`).then(res => setGlobalChat(res as any[]));
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId || !currentUser || !isValidUUID(workspaceId)) return;
    
    if (connectedWsIdRef.current === workspaceId && connectionRef.current?.state === signalR.HubConnectionState.Connected) {
        return;
    }

    const currentWsId = workspaceId;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5241'}/hub/devhub`)
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        if (connection.state === signalR.HubConnectionState.Connected) {
            connectedWsIdRef.current = currentWsId;
            await connection.invoke("JoinProjectGroup", currentWsId);
            const initialPresence = {
                userId: currentUser.id,
                nombre: currentUser.email?.split('@')[0] || 'Arquitecto',
                zonaActual: activeRoom
            };
            await connection.invoke("UpdatePresence", currentWsId, initialPresence);
        }
      } catch (err) {
        console.warn("Presence Sync Error: ", err);
      }
    };

    connection.on("PresenceUpdated", (presence: any) => {
      const normalizedPresence: UserPresence = {
        userId: presence.userId || presence.UserId,
        nombre: presence.nombre || presence.Nombre,
        zonaActual: presence.zonaActual || presence.ZonaActual || 'idle'
      };
      if (normalizedPresence.userId) {
          setPresences(prev => ({ ...prev, [normalizedPresence.userId]: normalizedPresence }));
      }
    });

    connection.on("ActivityLogged", (log: any) => {
        setActivityLogs(prev => [log, ...prev].slice(0, 50));
    });

    connection.on("ReceiveGlobalMessage", (msg: any) => {
        setGlobalChat(prev => [...prev, msg]);
    });

    connection.on("EmergencyMeetingCalled", (data: any) => {
      setEmergencyMeeting({
        reunionId: data.reunionId || data.ReunionId,
        tema: data.tema || data.Tema,
        nombreCreador: data.nombreCreador || data.NombreCreador,
        creadorId: data.creadorId || data.CreadorId,
        timestamp: data.timestamp || data.Timestamp
      });
    });

    connection.on("MeetingEnded", () => {
      setEmergencyMeeting(null);
    });

    connection.on("ReceiveChatMessage", (user: string, text: string) => {
        setLastChatMessage({ user, text, time: new Date().toLocaleTimeString() });
    });

    connection.on("VoteReceived", (voteType: string, userId: string) => {
        setLastVote({ voteType, userId });
    });

    connection.on("DrawReceived", (drawData: any) => {
        setLastDrawAction(drawData);
    });

    connection.on("PollStarted", (pollData: any) => {
        setLastPollStarted(pollData);
    });

    connection.on("PollClosed", (pollId: string, finalPollData: any) => {
        setLastPollClosed({ pollId, finalPollData });
    });

    connection.on("PollVoteReceived", (pollId: string, voteData: any) => {
        setLastPollVoteReceived({ pollId, ...voteData });
    });

    connection.on("UserJoined", async (connId: string) => {
        if (connection.state === signalR.HubConnectionState.Connected) {
            await connection.invoke("UpdatePresence", currentWsId, {
                userId: currentUser.id,
                nombre: currentUser.email?.split('@')[0] || 'Arquitecto',
                zonaActual: activeRoom
            });
        }
    });

    startConnection();
    connectionRef.current = connection;

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveProjectGroup", currentWsId).catch(() => {});
      }
      connection.stop().catch(() => {});
      connectionRef.current = null;
      connectedWsIdRef.current = null;
    };
  }, [workspaceId, currentUser]);

  useEffect(() => {
    if (workspaceId && currentUser && workspaceId !== 'undefined') {
      const updatedPresence = {
        userId: currentUser.id,
        nombre: currentUser.email?.split('@')[0] || 'Arquitecto',
        zonaActual: activeRoom
      };
      setPresences(prev => ({ ...prev, [currentUser.id]: updatedPresence }));
      const conn = connectionRef.current;
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke("UpdatePresence", workspaceId, updatedPresence).catch(() => {});
        // Log de movimiento si cambió de sala
        if (prevRoomRef.current !== activeRoom) {
            conn.invoke("LogMovement", workspaceId, currentUser.id, updatedPresence.nombre, prevRoomRef.current, activeRoom);
            prevRoomRef.current = activeRoom;
        }
      }
    }
  }, [activeRoom, workspaceId, currentUser]);

  const callEmergencyMeeting = async (tema: string, projectId: string, descripcion?: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId && currentUser) {
        try {
            const res: any = await api.post('colab/meetings/start', { 
                proyectoId: projectId, 
                titulo: tema,
                descripcion: descripcion 
            });
            const realReunionId = res.reunionId;
            const nombre = currentUser.email?.split('@')[0] || 'Arquitecto';
            await conn.invoke("ConvocarReunion", workspaceId, tema, nombre, currentUser.id, realReunionId);
            return true;
        } catch (err) { return false; }
    }
    return false;
  };

  const sendMeetingMessage = (text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId && currentUser) {
        conn.invoke("SendMeetingMessage", workspaceId, currentUser.email?.split('@')[0] || 'Arquitecto', text);
    }
  };

  const sendGlobalMessage = (text: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId && isValidUUID(workspaceId) && currentUser) {
        conn.invoke("SendGlobalMessage", workspaceId, currentUser.id, currentUser.email?.split('@')[0] || 'Arquitecto', text);
    }
  };

  const submitMeetingVote = (voteType: string) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId && currentUser) {
        conn.invoke("SubmitMeetingVote", workspaceId, voteType, currentUser.id);
    }
  };

  const sendDrawAction = (drawData: any) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId) {
        conn.invoke("DrawOnWhiteboard", workspaceId, drawData);
    }
  };

  const startPoll = (pollData: any) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId) {
        conn.invoke("StartPoll", workspaceId, pollData);
    }
  };

  const closePoll = (pollId: string, finalPollData: any) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId) {
        conn.invoke("ClosePoll", workspaceId, pollId, finalPollData);
    }
  };

  const submitPollVote = (pollId: string, voteData: any) => {
    const conn = connectionRef.current;
    if (conn && conn.state === signalR.HubConnectionState.Connected && workspaceId) {
        conn.invoke("SubmitPollVote", workspaceId, pollId, voteData);
    }
  };

  const finalizeMeeting = async (acta: any) => {
    const conn = connectionRef.current;
    if (conn && emergencyMeeting?.reunionId && workspaceId) {
        try {
            await api.post(`colab/meetings/${emergencyMeeting.reunionId}/end`, { actaJson: JSON.stringify(acta) });
            await conn.invoke("FinalizarReunion", workspaceId);
        } catch (err) { console.error(err); }
    }
  };

  return (
    <PresenceContext.Provider value={{
      presences, emergencyMeeting, currentUser, callEmergencyMeeting, finalizeMeeting,
      setEmergencyMeeting, sendMeetingMessage, lastChatMessage, submitMeetingVote, lastVote,
      sendDrawAction, lastDrawAction, globalChat, activityLogs, sendGlobalMessage,
      startPoll, closePoll, submitPollVote, lastPollStarted, lastPollClosed, lastPollVoteReceived
    }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};
