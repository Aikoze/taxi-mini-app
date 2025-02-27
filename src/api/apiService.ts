// src/api/apiService.ts
const API_URL = import.meta.env.VITE_API_URL || '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface FetchOptions {
    method?: HttpMethod;
    headers?: HeadersInit;
    body?: any;
}

/**
 * Service pour effectuer des appels API en utilisant fetch
 */
class ApiService {
    private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        // Préparer l'URL
        const url = `${API_URL}${endpoint}`;

        // Préparer les headers par défaut
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Préparer les options de fetch
        const fetchOptions: RequestInit = {
            method: options.method || 'GET',
            headers,
            credentials: 'include'
        };

        // Ajouter le body si nécessaire (et le sérialiser en JSON)
        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
        }

        try {
            // Effectuer la requête
            const response = await fetch(url, fetchOptions);

            // Vérifier si la réponse est OK
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(
                    errorData?.error || `${response.status}: ${response.statusText}`
                );
            }

            // Désérialiser la réponse en JSON
            const data = await response.json();
            return data as T;
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            throw error;
        }
    }

    /**
     * Effectuer une requête GET
     */
    public get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, { headers });
    }

    /**
     * Effectuer une requête POST
     */
    public post<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body, headers });
    }

    /**
     * Effectuer une requête PUT
     */
    public put<T>(endpoint: string, body: any, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body, headers });
    }

    /**
     * Effectuer une requête DELETE
     */
    public delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', headers });
    }
}

// Exporter une instance singleton
export const apiService = new ApiService();