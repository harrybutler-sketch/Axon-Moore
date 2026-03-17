import { NextResponse } from 'next/server'
import { automationWorker } from '@/lib/automation'

export async function POST() {
  await automationWorker()
  return NextResponse.json({ status: 'done' })
}
