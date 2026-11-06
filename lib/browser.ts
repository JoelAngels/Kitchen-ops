/* Browser helpers that also work off HTTPS, e.g. a phone opening http://192.168.x.x:3000.
   crypto.randomUUID and navigator.clipboard only exist in secure contexts. */

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID()
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const b = crypto.getRandomValues(new Uint8Array(16))
    return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("")
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

/** Copies text; resolves false if the browser refused, so the UI never claims a copy that didn't happen. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length) // iOS needs an explicit range
    const ok = document.execCommand("copy")
    ta.remove()
    return ok
  } catch {
    return false
  }
}
