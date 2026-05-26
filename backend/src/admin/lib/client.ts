type FetchOptions = {
  method?: string
  body?: unknown
}

export const sdk = {
  client: {
    fetch: async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
      const res = await fetch(path, {
        method: options.method ?? "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...(options.body !== undefined
          ? { body: JSON.stringify(options.body) }
          : {}),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any)?.message ?? `Request failed: ${res.status}`)
      }
      return res.json()
    },
  },
}
