const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.almostcrackd.ai'

export interface GeneratedCaption {
  caption: string
  id?: string
  rank?: number
}

export interface GenerateCaptionsResult {
  captions: GeneratedCaption[]
  error?: string
}

export async function generateCaptions(params: {
  imageUrl: string
  flavorId: string
  steps: Array<{ step_order: number; prompt: string }>
  accessToken: string
}): Promise<GenerateCaptionsResult> {
  const { imageUrl, flavorId, accessToken } = params

  try {
    // Step 1: Fetch image
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return { captions: [], error: `Could not fetch image: ${imgRes.status}` }
    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'
    const imageBlob = await imgRes.blob()

    // Step 2: Get presigned URL
    const presignRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ contentType }),
    })
    if (!presignRes.ok) {
      const err = await presignRes.json().catch(() => ({}))
      return { captions: [], error: err.message ?? `Presign error ${presignRes.status}` }
    }
    const { presignedUrl, cdnUrl } = await presignRes.json()

    // Step 3: Upload image to presigned URL
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: imageBlob,
    })
    if (!uploadRes.ok) return { captions: [], error: `Upload error ${uploadRes.status}` }

    // Step 4: Register image
    const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
    })
    if (!registerRes.ok) {
      const err = await registerRes.json().catch(() => ({}))
      return { captions: [], error: err.message ?? `Register error ${registerRes.status}` }
    }
    const { imageId } = await registerRes.json()

    // Step 5: Generate captions with flavor
    const captionRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({ imageId, humorFlavorId: Number(flavorId) }),
    })
    if (!captionRes.ok) {
      const err = await captionRes.json().catch(() => ({}))
      return { captions: [], error: err.message ?? `Caption error ${captionRes.status}` }
    }
    const data = await captionRes.json()

    const raw: GeneratedCaption[] = (
      Array.isArray(data) ? data : (data?.captions ?? data?.data ?? [])
    ).map((item: unknown) => {
  if (typeof item === 'string') return { caption: item }
  const obj = item as Record<string, unknown>
  return { caption: (obj.content ?? obj.caption ?? JSON.stringify(item)) as string }
})

    return { captions: raw }
  } catch (err) {
    return { captions: [], error: String(err) }
  }
}