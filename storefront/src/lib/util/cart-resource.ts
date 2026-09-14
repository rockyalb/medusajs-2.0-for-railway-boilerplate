export function createCartResource<T>(load: () => Promise<T | null>) {
  const initial = { cart: null as T | null, loaded: false, error: false, openVersion: 0 }
  let state = initial
  let request = 0
  let pendingOpen = false
  const listeners = new Set<() => void>()
  const publish = (next: typeof state) => {
    state = next
    listeners.forEach((listener) => listener())
  }
  return {
    getSnapshot: () => state,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    async refresh(open = false) {
      pendingOpen ||= open
      const current = ++request
      try {
        const cart = await load()
        if (current !== request) return
        const openVersion = state.openVersion + (pendingOpen ? 1 : 0)
        pendingOpen = false
        publish({ cart, loaded: true, error: false, openVersion })
      } catch {
        if (current === request) {
          pendingOpen = false
          publish({ ...state, error: true })
        }
      }
    },
  }
}
