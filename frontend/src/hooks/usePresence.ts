import { usePresence as usePresenceContext } from '../context/PresenceContext';

/**
 * Hook puente para mantener compatibilidad con componentes existentes
 * que importan usePresence desde esta ruta.
 */
export const usePresence = usePresenceContext;
