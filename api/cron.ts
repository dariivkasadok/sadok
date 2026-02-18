import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .lte('event_datetime', now)
      .eq('is_notified', false)

    if (error) {
      console.error('Select error:', error)
      return res.status(500).json({ error })
    }

    if (!data || data.length === 0) {
      console.log('No events to notify')
      return res.status(200).json({ message: 'No events' })
    }

    console.log(`Found ${data.length} events`)

    const { error: updateError } = await supabase
      .from('calendar_events')
      .update({ is_notified: true })
      .lte('event_datetime', now)
      .eq('is_notified', false)

    if (updateError) {
      console.error('Update error:', updateError)
      return res.status(500).json({ error: updateError })
    }

    return res.status(200).json({ processed: data.length })

  } catch (err) {
    console.error('Fatal error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
