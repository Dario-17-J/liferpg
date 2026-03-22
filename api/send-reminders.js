// Vercel Serverless Function — runs on cron schedule
// Sends streak reminder emails to users who haven't logged in today

export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://umvgzitfydwzpxznchfb.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY

export default async function handler(req) {
  // Security check - only allow cron or manual trigger
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.method !== 'GET') {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Get all users with their game state
    const res = await fetch(`${SUPABASE_URL}/rest/v1/game_state?select=user_id,state,updated_at`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    const users = await res.json()

    // Get auth users for emails
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    })
    const authData = await authRes.json()
    const authUsers = authData.users || []

    const today = new Date().toISOString().split('T')[0]
    let sent = 0

    for (const user of users) {
      const state = user.state
      if (!state) continue

      // Check if user hasn't logged in today
      const lastDay = state.lastDay
      if (lastDay === today) continue // already active today

      // Find their email
      const authUser = authUsers.find(u => u.id === user.user_id)
      if (!authUser?.email) continue

      const streak = state.streak || 0
      const name = state.player?.n || 'Hunter'
      const pendingMissions = (state.missions || []).filter(m => !m.done && !m.pen).length

      // Build email
      const subject = streak > 0
        ? `🔥 ${name}, your ${streak}-day streak is at risk!`
        : `⚔️ ${name}, your missions are waiting!`

      const body = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:2rem;font-weight:900;letter-spacing:3px;color:#f59e0b;">LIFE <span style="color:#a855f7;">RPG</span></div>
      <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">The System is watching</div>
    </div>
    <div style="background:#0f0f1a;border:1px solid #1e1e35;border-radius:12px;padding:32px;text-align:center;">
      ${streak > 0 ? `
      <div style="font-size:3rem;margin-bottom:8px;">🔥</div>
      <div style="font-size:1.4rem;font-weight:700;color:#f97316;margin-bottom:8px;">${streak}-Day Streak at Risk!</div>
      <div style="font-size:14px;color:#94a3b8;line-height:1.7;margin-bottom:24px;">
        Hey ${name}, you haven't logged in today yet.<br>
        Your ${streak}-day streak will reset at midnight if you don't complete your missions.
      </div>
      ` : `
      <div style="font-size:3rem;margin-bottom:8px;">⚔️</div>
      <div style="font-size:1.4rem;font-weight:700;color:#a855f7;margin-bottom:8px;">Your Missions Await</div>
      <div style="font-size:14px;color:#94a3b8;line-height:1.7;margin-bottom:24px;">
        Hey ${name}, you have ${pendingMissions} mission${pendingMissions!==1?'s':''} waiting today.<br>
        Every day you skip is a day your rank doesn't grow.
      </div>
      `}
      <a href="https://liferpg-pi.vercel.app" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;text-decoration:none;border-radius:6px;font-weight:700;font-size:14px;letter-spacing:1px;">⚡ COMPLETE MISSIONS NOW</a>
      <div style="margin-top:24px;padding:16px;background:#13131f;border-radius:8px;border:1px solid #1e1e35;">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Your Stats</div>
        <div style="display:flex;justify-content:center;gap:24px;">
          <div style="text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:#f59e0b;">${state.xp||0}</div><div style="font-size:10px;color:#64748b;">XP</div></div>
          <div style="text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:#f97316;">${streak}🔥</div><div style="font-size:10px;color:#64748b;">Streak</div></div>
          <div style="text-align:center;"><div style="font-size:1.2rem;font-weight:700;color:#a855f7;">${state.gold||0}</div><div style="font-size:10px;color:#64748b;">Gold</div></div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#334155;">
      You're receiving this because you signed up for Life RPG.<br>
      <a href="https://liferpg-pi.vercel.app" style="color:#64748b;">Open App</a>
    </div>
  </div>
</body>
</html>`

      // Send email via Resend
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Life RPG <onboarding@resend.dev>',
          to: authUser.email,
          subject,
          html: body
        })
      })
      sent++
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
