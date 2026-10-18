import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/auth'

// Hands out short-lived upload tokens so the admin panel can upload event and team photos straight
// to Vercel Blob. Only signed-in organizers get a token.

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getAdmin())) throw new Error('Your session has ended. Sign in again.')
        if (!/^(events|team)\//.test(pathname)) throw new Error('Invalid upload path.')
        return {
          allowedContentTypes: ['image/webp', 'image/jpeg', 'image/png'],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        }
      },
      // Photos are attached to an event when the admin saves it, so nothing to do here
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
