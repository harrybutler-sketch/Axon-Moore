import { NextResponse } from 'next/server'
import { generateCredentialCopy } from '@/lib/marketing'

export async function POST(request: Request) {
  const event = await request.json()
  const content = await generateCredentialCopy(event)
  return NextResponse.json({ content })
}
