import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Check file size (Whisper API has a 25MB limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      )
    }

    console.log('Transcribing audio file:', audioFile.name, audioFile.type, audioFile.size)

    // Transcribe using Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Optional: specify language for better accuracy
      response_format: 'text',
    })

    console.log('Transcription successful:', transcription.substring(0, 100))

    return NextResponse.json({
      text: transcription,
      success: true,
    })
  } catch (error: any) {
    console.error('Transcription error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to transcribe audio',
        success: false,
      },
      { status: 500 }
    )
  }
}
