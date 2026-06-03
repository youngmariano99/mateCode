import { vi, describe, it, expect, beforeEach } from 'vitest';

// Polyfill de localStorage para el entorno de Node.js en Vitest
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

const { useAgencyStore } = await import('../useAgencyStore');
const { api } = await import('../../lib/apiClient');

// Mock del cliente API
vi.mock('../../lib/apiClient', () => ({
  api: {
    get: vi.fn(() => Promise.resolve([])),
    post: vi.fn(() => Promise.resolve({})),
    put: vi.fn(() => Promise.resolve({}))
  }
}));

describe('useAgencyStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reiniciar store
    useAgencyStore.setState({
      agencies: [],
      currentAgencyId: null,
      activeAgency: null,
      permissions: {},
      invitations: [],
      isLoading: false,
      error: null
    });
  });

  it('setAgencyId debe setear el ID activo y guardar en localStorage', () => {
    const mockAgencies = [
      { id: 'agency-1', nombre: 'Agencia A', propietario_id: 'owner-1', tipo: 'agencia' as const, fecha_creacion: '' },
      { id: 'agency-2', nombre: 'Agencia B', propietario_id: 'owner-1', tipo: 'personal' as const, fecha_creacion: '' }
    ];
    useAgencyStore.setState({ agencies: mockAgencies });

    useAgencyStore.getState().setAgencyId('agency-1');

    expect(useAgencyStore.getState().currentAgencyId).toBe('agency-1');
    expect(useAgencyStore.getState().activeAgency).toEqual(mockAgencies[0]);
    expect(localStorage.getItem('mc_current_agency_id')).toBe('agency-1');
  });

  it('setAgencyId con null debe limpiar el ID activo y remover de localStorage', () => {
    localStorage.setItem('mc_current_agency_id', 'agency-1');
    useAgencyStore.setState({ currentAgencyId: 'agency-1' });

    useAgencyStore.getState().setAgencyId(null);

    expect(useAgencyStore.getState().currentAgencyId).toBeNull();
    expect(useAgencyStore.getState().activeAgency).toBeNull();
    expect(localStorage.getItem('mc_current_agency_id')).toBeNull();
  });

  it('fetchAgencies debe llamar a la API y configurar la agencia activa por defecto', async () => {
    const mockAgencies = [
      { id: 'agency-1', nombre: 'Agencia A', propietario_id: 'owner-1', tipo: 'agencia' as const, fecha_creacion: '' }
    ];
    vi.mocked(api.get).mockResolvedValueOnce(mockAgencies); // Para GET /Agency

    await useAgencyStore.getState().fetchAgencies();

    expect(api.get).toHaveBeenCalledWith('/Agency');
    expect(useAgencyStore.getState().agencies).toEqual(mockAgencies);
    expect(useAgencyStore.getState().activeAgency).toEqual(mockAgencies[0]);
    expect(useAgencyStore.getState().currentAgencyId).toBe('agency-1');
    expect(localStorage.getItem('mc_current_agency_id')).toBe('agency-1');
  });

  it('createAgency debe llamar a la API y agregar la agencia al estado', async () => {
    const mockNewAgency = {
      id: 'agency-3',
      nombre: 'Agencia C',
      propietario_id: 'owner-1',
      tipo: 'agencia' as const,
      fecha_creacion: ''
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockNewAgency);

    const result = await useAgencyStore.getState().createAgency('Agencia C');

    expect(api.post).toHaveBeenCalledWith('/Agency', { Nombre: 'Agencia C' });
    expect(useAgencyStore.getState().agencies).toContainEqual(mockNewAgency);
    expect(result).toEqual(mockNewAgency);
  });
});
