
import searchParams from "@/lib/searchParams";
import axios from "axios";

axios.interceptors.request.use((config) => {
    const existingAuth = (config.headers as any)?.Authorization ?? (config.headers as any)?.authorization
    if (existingAuth) {
        return config
    }

    const queryToken = searchParams<{ token?: string }>().token
    const apiToken = localStorage.getItem("apiToken")
    const legacyToken = localStorage.getItem("token")
    const token = queryToken || apiToken || legacyToken

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
axios.interceptors.response.use((res) => res, (error) => {
    const msg = error.response?.data?.message || error.message as string
    error.message = typeof msg === 'string' ? msg : JSON.stringify(msg)
    error.status = error.response?.status
    error.response = error.response
    return Promise.reject(error)
});

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { error?: string; message?: string } | undefined
        return data?.error || data?.message || error.message || fallback
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    return fallback
}
