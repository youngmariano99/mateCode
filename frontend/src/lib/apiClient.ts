import { supabase } from './supabase';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'https://matecode.onrender.com';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
    silent?: boolean;
}

async function getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const tenantId = localStorage.getItem('mc_current_tenant');
    const agencyId = localStorage.getItem('mc_current_agency_id');
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
    };

    // Solo enviamos el tenant si es un valor real y no un placeholder
    if (tenantId && tenantId !== 'undefined' && tenantId !== 'null' && tenantId.length > 10) {
        headers['X-Tenant-Id'] = tenantId;
    }

    if (agencyId && agencyId !== 'undefined' && agencyId !== 'null' && agencyId.length > 10) {
        headers['X-Agency-Id'] = agencyId;
    }
    
    return headers;
}

export const api = {
    async request(endpoint: string, options: RequestOptions = {}) {
        let finalUrl = endpoint.startsWith('/api') 
            ? `${API_BASE}${endpoint}`
            : `${API_BASE}/api/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;

        if (options.params) {
            const urlObj = new URL(finalUrl);
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlObj.searchParams.append(key, value);
                }
            });
            finalUrl = urlObj.toString();
        }

        const headers = await getHeaders();
        
        let response;
        try {
            response = await fetch(finalUrl, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers,
                },
            });
        } catch (networkError: any) {
            if (!options.silent) {
                Swal.fire({
                    title: 'Problema de Conexión',
                    text: 'No logramos establecer comunicación con el servidor. Revisa tu conexión a internet o reintenta en unos instantes.',
                    icon: 'question',
                    background: '#09090b',
                    color: '#f4f4f5',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'Entendido'
                });
            }
            throw {
                status: 0,
                message: networkError.message || 'Error de red / CORS',
                data: null
            };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (!options.silent) {
                const status = response.status;
                const errorId = errorData.errorId || 'N/A';
                const friendlyMessage = errorData.userFriendlyMessage || errorData.message || 'Ha ocurrido un error en la solicitud.';

                if (status >= 500) {
                    Swal.fire({
                        title: '¡Ups! Algo salió mal',
                        text: `${friendlyMessage}\n\nCódigo de rastreo: ${errorId}`,
                        icon: 'error',
                        background: '#09090b',
                        color: '#f4f4f5',
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Entendido'
                    });
                } else if (status === 401) {
                    Swal.fire({
                        title: 'Sesión Vencida',
                        text: 'Tu sesión de usuario ha expirado. Por favor, vuelve a iniciar sesión.',
                        icon: 'warning',
                        background: '#09090b',
                        color: '#f4f4f5',
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Entendido'
                    }).then(() => {
                        window.location.href = '/login';
                    });
                } else if (status === 403) {
                    Swal.fire({
                        title: 'Acceso Restringido',
                        text: 'No posees permisos de nivel organizativo para efectuar esta operación.',
                        icon: 'warning',
                        background: '#09090b',
                        color: '#f4f4f5',
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    Swal.fire({
                        title: 'Inconveniente detectado',
                        text: friendlyMessage,
                        icon: 'warning',
                        background: '#09090b',
                        color: '#f4f4f5',
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Entendido'
                    });
                }
            }

            throw {
                status: response.status,
                message: errorData.message || 'Error en la petición API',
                data: errorData
            };
        }

        // Algunos endpoints devuelven texto plano (como el Master Prompt)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    },

    get(endpoint: string, options?: RequestOptions) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint: string, body?: any, options?: RequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint: string, body?: any, options?: RequestOptions) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint: string, options?: RequestOptions) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
};
