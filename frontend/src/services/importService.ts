import { api } from '../lib/apiClient';

export const deployProjectToBackend = async (projectId: string, stagedErd: any[], stagedBacklog: any[]) => {
    const response = await api.post('/ProjectImport/bulk', {
        proyectoId: projectId,
        tables: stagedErd,
        tickets: stagedBacklog
    });
    return response;
};
