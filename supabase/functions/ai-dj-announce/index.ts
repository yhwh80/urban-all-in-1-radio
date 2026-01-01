// Supabase Edge Function: AI DJ Announcements
// Handles AI voice generation and AzuraCast integration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
const AZURACAST_API_KEY = Deno.env.get('AZURACAST_API_KEY')
const AZURACAST_URL = Deno.env.get('AZURACAST_URL')
const AZURACAST_STATION_ID = Deno.env.get('AZURACAST_STATION_ID')
const ELEVENLABS_VOICE_ID = Deno.env.get('ELEVENLABS_VOICE_ID') || 'pNInz6obpgDQGcFmaJgB' // Adam voice
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnnouncementRequest {
  type: string
  context?: {
    listenerCount?: number
    currentTrack?: string
    listenerLocation?: string
    timeOfDay?: string
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, context }: AnnouncementRequest = await req.json()

    // Debug: Check if API keys are available
    console.log('Environment check:', {
      hasElevenLabsKey: !!ELEVENLABS_API_KEY,
      hasOpenAIKey: !!OPENAI_API_KEY,
      hasAzuraCastKey: !!AZURACAST_API_KEY,
      elevenLabsKeyPrefix: ELEVENLABS_API_KEY?.substring(0, 8),
    })

    // Generate announcement text using OpenAI (if available) or templates
    const announcementText = OPENAI_API_KEY
      ? await generateAnnouncementWithOpenAI(type, context)
      : generateAnnouncementText(type, context)

    console.log('Generating announcement:', announcementText)

    // Call ElevenLabs API to generate speech
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: announcementText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text()
      console.error('ElevenLabs API error:', {
        status: audioResponse.status,
        statusText: audioResponse.statusText,
        error: errorText,
      })
      throw new Error(`ElevenLabs API error: ${audioResponse.statusText} - ${errorText}`)
    }

    // Get audio as blob
    const audioBlob = await audioResponse.blob()
    
    // Convert to base64 for easier handling
    const audioBuffer = await audioBlob.arrayBuffer()
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    // Generate filename
    const timestamp = Date.now()
    const filename = `ai-dj-${timestamp}.mp3`

    // Upload to AzuraCast (if configured)
    let uploadResult = null
    if (AZURACAST_URL && AZURACAST_API_KEY && AZURACAST_STATION_ID) {
      uploadResult = await uploadToAzuraCast(audioBuffer, filename)
    } else {
      console.log('AzuraCast not configured, skipping upload')
      uploadResult = {
        uploaded: false,
        message: 'AzuraCast upload skipped - voice generated successfully',
      }
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        announcementText,
        audioBase64,
        filename,
        uploadResult,
        context,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function generateAnnouncementWithOpenAI(type: string, context?: any): Promise<string> {
  const { listenerCount, currentTrack, listenerLocation, timeOfDay } = context || {}

  const systemPrompt = `You are the AI voice of Urban All-in-One Radio, a UK-based urban music station.

PERSONALITY:
- Authentic, street-smart, energetic
- Friendly and relatable, not corporate
- Passionate about music and community
- UK urban culture (grime, hip-hop, R&B)

STYLE:
- Use UK slang naturally: "big up", "locked in", "the massive", "keeping it real", "vibes", "heat"
- Be conversational and genuine
- Keep it short (1-2 sentences max, 15-25 words)
- Sound like a friend, not a robot
- Match the energy to the time of day

AVOID:
- Corporate radio speak
- Cheesy clichés
- Being too formal
- Repetitive phrases
- Long-winded announcements

Generate a natural, contextual announcement based on the information provided.`

  const userPrompt = `Create a radio announcement for:
Type: ${type}
${listenerLocation ? `Location: ${listenerLocation}` : ''}
${listenerCount ? `Listeners: ${listenerCount}` : ''}
${currentTrack ? `Current track: ${currentTrack}` : ''}
${timeOfDay ? `Time: ${timeOfDay}` : ''}

Make it unique, contextual, and authentic. Keep it under 25 words.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error, falling back to templates')
      return generateAnnouncementText(type, context)
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error calling OpenAI:', error)
    return generateAnnouncementText(type, context)
  }
}

function generateAnnouncementText(type: string, context?: any): string {
  const { listenerCount, currentTrack, listenerLocation, timeOfDay } = context || {}

  const templates = {
    listener_connect: [
      `Big up to our listeners from ${listenerLocation || 'around the world'}! You're locked into Urban All-in-One Radio!`,
      `Yo! Shoutout to ${listenerLocation || 'the massive'} tuning in right now! This is Urban All-in-One Radio, keeping it real 24/7!`,
      `What's good ${listenerLocation || 'fam'}! You're vibing with Urban All-in-One Radio. ${listenerCount ? `We got ${listenerCount} listeners locked in!` : ''}`,
      `Big energy from ${listenerLocation || 'the streets'}! Urban All-in-One Radio bringing you nothing but heat!`,
    ],
    peak_hours: [
      `It's ${timeOfDay || 'prime time'} and you're locked into Urban All-in-One Radio! ${currentTrack ? `Coming up: ${currentTrack}` : ''}`,
      `Evening vibes on Urban All-in-One Radio! ${listenerCount ? `${listenerCount} of you keeping it locked!` : ''}`,
    ],
    general: [
      `You're listening to Urban All-in-One Radio - the sound of the streets!`,
      `Urban All-in-One Radio - bringing you the freshest beats around the clock!`,
    ],
  }

  const typeTemplates = templates[type as keyof typeof templates] || templates.general
  const randomTemplate = typeTemplates[Math.floor(Math.random() * typeTemplates.length)]

  return randomTemplate
}

async function uploadToAzuraCast(audioBuffer: ArrayBuffer, filename: string) {
  try {
    // Convert ArrayBuffer to base64
    // AzuraCast API expects JSON with base64-encoded file content
    const uint8Array = new Uint8Array(audioBuffer)
    const base64Audio = btoa(String.fromCharCode(...uint8Array))

    // Upload to AzuraCast media library using the correct endpoint
    // POST /api/station/{station_id}/files
    const uploadUrl = `${AZURACAST_URL}/api/station/${AZURACAST_STATION_ID}/files`

    console.log('Uploading to AzuraCast:', {
      url: uploadUrl,
      filename,
      stationId: AZURACAST_STATION_ID,
      fileSize: audioBuffer.byteLength,
    })

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': AZURACAST_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: `ai-dj-live/${filename}`,  // Upload to ai-dj-live for overlay playback
        file: base64Audio,
      }),
    })

    console.log('Upload response status:', uploadResponse.status)

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('AzuraCast upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText,
        url: uploadUrl,
      })
      return {
        uploaded: false,
        message: `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        filename,
        error: errorText,
        debug: {
          url: uploadUrl,
          stationId: AZURACAST_STATION_ID,
        },
      }
    }

    const uploadResult = await uploadResponse.json()
    console.log('File uploaded to AzuraCast:', uploadResult)

    // Note: Files uploaded to 'ai-dj-live' folder will be automatically
    // played OVER the music using Liquidsoap's smooth_add function
    // This requires custom Liquidsoap configuration in AzuraCast station settings

    return {
      uploaded: true,
      message: 'File uploaded successfully to AzuraCast for overlay playback',
      filename,
      mediaId: uploadResult.id,
      folder: 'ai-dj-live',
      note: 'File will be played over music with ducking effect (music volume lowered)',
      instructions: 'Requires custom Liquidsoap configuration - see documentation',
    }

  } catch (error) {
    console.error('Error uploading to AzuraCast:', error)
    return {
      uploaded: false,
      message: `Error: ${error.message}`,
      filename,
    }
  }
}

