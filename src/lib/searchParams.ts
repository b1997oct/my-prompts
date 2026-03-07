
export default function searchParams<T>() {

    const params = new URLSearchParams(window.location.search)
    const obj: Record<string, string> = {}
    params.forEach((value, key) => (obj[key] = value))

    return obj as T
}


