const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.almostcrackd.ai'

export interface GeneratedCaption {
  caption: string
  rank?: number
}

export interface GenerateCaptionsResult {
  captions: GeneratedCaption[]
  raw_steps?: string[]          // intermediate step outputs, if API returns them
  error?: string
}

/**
 * Calls POST /captions/generate on the almostcrackd REST API.
 *
 * Auth: Supabase JWT is sent as Bearer token.
 * If the API uses a different scheme (e.g. x-api-key), swap here.
 *
 * Body shape sent:
 * {
 *   image_url: string,
 *   flavor_id: string,
 *   steps: string[]          // prompts in order
 * }
 */
export async function generateCaptions(params: {
  imageUrl: string
  flavorId: string
  steps: Array<{ step_order: number; prompt: string }>
  accessToken: string
}): Promise<GenerateCaptionsResult> {
  const { imageUrl, flavorId, steps, accessToken } = params
  const orderedPrompts = [...steps]
    .sort((a, b) => a.step_order - b.step_order)
    .map(s => s.prompt)

  try {
    const res = await fetch(`${API_BASE}/captions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        image_url: imageUrl,
        flavor_id: flavorId,
        steps: orderedPrompts,
      }),
    })

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { captions: [], error: json?.message ?? json?.error ?? `API ${res.status}` }
    }

    // Normalise — the API may return { captions: [...] } or { data: [...] } etc.
    const raw: GeneratedCaption[] = (
      json?.captions ?? json?.data ?? (Array.isArray(json) ? json : [])
    ).map((item: unknown) =>
      typeof item === 'string' ? { caption: item } : item
    )

    return { captions: raw, raw_steps: json?.steps }
  } catch (err) {
    return { captions: [], error: String(err) }
  }
}
