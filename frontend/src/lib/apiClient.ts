import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5241';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

async function getHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const tenantId = localStorage.getItem('mc_current_tenant') || '';
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'X-Tenant-Id': tenantId
    };
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
        
        const response = await fetch(finalUrl, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
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
