import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useSecretsStore } from '../useSecretsStore';
import { api } from '../../lib/apiClient';

// Mock del cliente API
vi.mock('../../lib/apiClient', () => ({
  api: {
    get: vi.fn(() => Promise.resolve([])),
    post: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({}))
  }
}));

describe('useSecretsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reiniciar el estado del store
    useSecretsStore.setState({ secrets: [] });
  });

  it('fetchSecrets debe obtener y setear la lista de secretos', async () => {
    const mockSecrets = [
      { id: '1', agencia_id: 'agency-1', servicio: 'Github', clave_encriptada: 'enc1', fecha_creacion: '', fecha_actualizacion: '' },
      { id: '2', agencia_id: 'agency-1', servicio: 'Supabase', clave_encriptada: 'enc2', fecha_creacion: '', fecha_actualizacion: '' }
    ];
    vi.mocked(api.get).mockResolvedValueOnce(mockSecrets);

    await useSecretsStore.getState().fetchSecrets();

    expect(api.get).toHaveBeenCalledWith('/Secrets');
    expect(useSecretsStore.getState().secrets).toEqual(mockSecrets);
  });

  it('createSecret debe llamar a la API y agregar el secreto al estado', async () => {
    const newSecretInput = {
      servicio: 'Slack',
      usuario: 'bot',
      passwordPlano: 'slack123',
      urlAcceso: 'slack.com',
      rolesPermitidos: ['Administrador']
    };
    const mockCreatedSecret = {
      id: '3',
      agencia_id: 'agency-1',
      servicio: 'Slack',
      usuario: 'bot',
      clave_encriptada: 'enc3',
      fecha_creacion: '',
      fecha_actualizacion: ''
    };
    vi.mocked(api.post).mockResolvedValueOnce(mockCreatedSecret);

    await useSecretsStore.getState().createSecret(newSecretInput);

    expect(api.post).toHaveBeenCalledWith('/Secrets', {
      Servicio: 'Slack',
      Usuario: 'bot',
      PasswordPlano: 'slack123',
      UrlAcceso: 'slack.com',
      RolesPermitidos: ['Administrador']
    });
    expect(useSecretsStore.getState().secrets).toContainEqual(mockCreatedSecret);
  });

  it('revealSecret debe retornar el password descifrado', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ password: 'super_secret_decrypted_password' });

    const password = await useSecretsStore.getState().revealSecret('id-secreto');

    expect(api.post).toHaveBeenCalledWith('/Secrets/reveal/id-secreto');
    expect(password).toBe('super_secret_decrypted_password');
  });

  it('deleteSecret debe llamar a la API y remover el secreto del estado', async () => {
    const initialSecrets = [
      { id: '1', agencia_id: 'agency-1', servicio: 'Github', clave_encriptada: 'enc1', fecha_creacion: '', fecha_actualizacion: '' },
      { id: '2', agencia_id: 'agency-1', servicio: 'Supabase', clave_encriptada: 'enc2', fecha_creacion: '', fecha_actualizacion: '' }
    ];
    useSecretsStore.setState({ secrets: initialSecrets });
    vi.mocked(api.delete).mockResolvedValueOnce({});

    await useSecretsStore.getState().deleteSecret('1');

    expect(api.delete).toHaveBeenCalledWith('/Secrets/1');
    expect(useSecretsStore.getState().secrets).toHaveLength(1);
    expect(useSecretsStore.getState().secrets[0].id).toBe('2');
  });
});
