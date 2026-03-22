import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase.js'

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const LXP=[0,300,700,1300,2100,3200,4600,6500,9000,12000,16000,21000,27000,34000,43000,54000,67000,83000,102000,125000,150000]
const DEFAM={physical:{n:'Physical',d:'Strength, fitness & body health',e:'💪',c:'#ef4444'},mental:{n:'Mental',d:'Focus, learning & intelligence',e:'🧠',c:'#7c3aed'},social:{n:'Social',d:'Relationships & communication',e:'🌐',c:'#06b6d4'},financial:{n:'Financial',d:'Money, career & wealth',e:'💰',c:'#f59e0b'},creative:{n:'Creative',d:'Art, ideas & expression',e:'🎨',c:'#ec4899'},discipline:{n:'Discipline',d:'Consistency & willpower',e:'⚡',c:'#10b981'}}
const DEFSHOP=[
  {id:'s1',e:'🎮',n:'Gaming Session',d:'1 hour guilt-free gaming. You earned it.',c:50},
  {id:'s2',e:'🍕',n:'Cheat Meal',d:'Eat whatever you want, zero guilt.',c:80},
  {id:'s3',e:'😴',n:'Lazy Morning',d:'Sleep in. The grind can wait one morning.',c:100},
  {id:'s4',e:'🎬',n:'Movie Marathon',d:'3+ hours of cinema. Fully justified.',c:120},
  {id:'s5',e:'📱',n:'Scroll Time',d:'45 min of mindless doomscrolling. Approved.',c:30},
  {id:'s6',e:'🛁',n:'Full Rest Day',d:'Do absolutely nothing. You are recharging.',c:250},
  {id:'s7',e:'🎧',n:'Music Session',d:'1 hour of just vibing to your playlist.',c:40},
  {id:'s8',e:'🧋',n:'Fancy Drink',d:'That overpriced coffee or boba you wanted.',c:35},
  {id:'s9',e:'🛒',n:'Guilt-Free Buy',d:'Buy that thing you have been holding off on.',c:400},
  {id:'s10',e:'🍜',n:'Order In',d:'Order your favourite food. No cooking today.',c:90},
  {id:'b1',e:'🦥',n:'Badge: Professional Sloth',d:'Awarded for heroic levels of doing nothing.',c:15,badge:true},
  {id:'b2',e:'🧠',n:'Badge: Big Brain Day',d:'You actually used your brain today. Rare.',c:20,badge:true},
  {id:'b3',e:'💀',n:'Badge: Survived Monday',d:'Self explanatory. You know what you went through.',c:10,badge:true},
  {id:'b4',e:'🔥',n:'Badge: On Fire',d:'Everything went right. Screenshot this.',c:25,badge:true},
  {id:'b5',e:'🚶',n:'Badge: Walked Past the Fridge',d:'You wanted a snack. You did not take one. Legend.',c:20,badge:true},
  {id:'b6',e:'📵',n:'Badge: Touch Grass Award',d:'You went outside. Your screen is proud of you.',c:15,badge:true},
  {id:'b7',e:'🧘',n:'Badge: Zen Mode Unlocked',d:'You were calm today. What happened? Are you okay?',c:20,badge:true},
  {id:'b8',e:'👑',n:'Badge: Main Character Energy',d:'You walked like the protagonist today.',c:30,badge:true},
  {id:'b9',e:'🤝',n:'Badge: Replied to Texts',d:'You actually replied to people. In the same day.',c:10,badge:true},
  {id:'b10',e:'🏆',n:'Badge: Did The Hard Thing',d:'The thing you were avoiding. You did it.',c:35,badge:true},
]
const AVTS=['🧑‍💻','🦁','🐉','🧙','⚔️','🔥','🌟','🎯','💎','🌙','☄️','🏹','🦊','👾','🤖','🥷','🏋️','📚','🧬','🦅']
const TITLES={0:'The Sleeper — Waiting to be Awakened',2:'The Awakened — Eyes Open for the First Time',4:'The Initiate — Discipline is Being Forged',6:'The Challenger — Refusing to Stay Ordinary',8:"The Enforcer — Breaking Others' Limits",10:'The Phantom — Moving Unseen, Striking True',12:'The Warlord — Commanding Every Battlefield',14:'The Sovereign — Bending Reality to Your Will',17:'The Transcendent — Beyond What Was Thought Possible',20:'The Monarch — There Is No One Above You'}
const RANK_ICONS={DORMANT:'💀',AWAKENED:'👁',INITIATE:'🔰',CHALLENGER:'⚔️',ENFORCER:'🛡',PHANTOM:'👻',WARLORD:'🪖',SOVEREIGN:'👑',TRANSCENDENT:'🌟',MONARCH:'☄️'}
const RANK_TIERS=[
  {min:0,max:1,lbl:'DORMANT',cls:'rank-dormant',sub:['I','II']},
  {min:2,max:3,lbl:'AWAKENED',cls:'rank-awakened',sub:['I','II']},
  {min:4,max:5,lbl:'INITIATE',cls:'rank-initiate',sub:['I','II']},
  {min:6,max:7,lbl:'CHALLENGER',cls:'rank-challenger',sub:['I','II']},
  {min:8,max:9,lbl:'ENFORCER',cls:'rank-enforcer',sub:['I','II']},
  {min:10,max:11,lbl:'PHANTOM',cls:'rank-phantom',sub:['I','II']},
  {min:12,max:13,lbl:'WARLORD',cls:'rank-warlord',sub:['I','II']},
  {min:14,max:16,lbl:'SOVEREIGN',cls:'rank-sovereign',sub:['I','II','III']},
  {min:17,max:19,lbl:'TRANSCENDENT',cls:'rank-transcendent',sub:['I','II','III']},
  {min:20,max:20,lbl:'MONARCH',cls:'rank-monarch',sub:['']},
]

function getRank(l){
  let tier=RANK_TIERS[0]
  for(const t of RANK_TIERS){if(l>=t.min)tier=t}
  const subIdx=Math.min(l-tier.min,tier.sub.length-1)
  const subLbl=tier.sub[subIdx]
  return{lbl:subLbl?tier.lbl+' '+subLbl:tier.lbl,cls:tier.cls,base:tier.lbl,icon:RANK_ICONS[tier.lbl]||'⚡'}
}
function getLv(xp){let l=0;for(let i=0;i<LXP.length;i++){if(xp>=LXP[i])l=i;}return l;}
function getLvXP(l){return LXP[Math.min(l,LXP.length-1)]||LXP[LXP.length-1];}
function getTitle(l){let t=TITLES[0];Object.keys(TITLES).map(Number).sort((a,b)=>a-b).forEach(k=>{if(l>=k)t=TITLES[k]});return t;}
const td=()=>{const n=new Date();return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');}
const localDS=(d)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
const wkStr=()=>{const d=new Date(),dy=d.getDay(),m=new Date(d);m.setDate(d.getDate()-(dy===0?6:dy-1));return localDS(m);}
const BLANK=()=>({player:{n:'Hunter',av:'🧑‍💻',t:''},xp:0,gold:0,txp:0,streak:0,best:0,lastDay:null,missions:[{id:1,n:'Morning Workout',tier:'S',cat:'physical',xp:100,penalty:50,done:false,pen:false},{id:2,n:'Deep Work / Study (2 hrs)',tier:'S',cat:'mental',xp:100,penalty:50,done:false,pen:false},{id:3,n:'Drink 2L Water',tier:'A',cat:'physical',xp:25,penalty:0,done:false,pen:false},{id:4,n:'Read 20 min',tier:'A',cat:'mental',xp:50,penalty:10,done:false,pen:false},{id:5,n:'No social media before noon',tier:'A',cat:'discipline',xp:50,penalty:25,done:false,pen:false}],extras:[{id:10,n:'Learn something new',done:false,week:wkStr()},{id:11,n:'Reach out to someone you care about',done:false,week:wkStr()}],goals:[{id:20,n:'Build a consistent streak',type:'short',target:7,prog:0,created:td()},{id:21,n:'Level up to Challenger',type:'long',target:20,prog:0,created:td()}],history:{},attrs:{physical:0,mental:0,social:0,financial:0,creative:0,discipline:0},am:JSON.parse(JSON.stringify(DEFAM)),shop:DEFSHOP.map(x=>({...x}))})


// ── PHASE 2: ONBOARDING ────────────────────────────────────────────────────
const MISSION_PACKS = {
  fitness: {
    name: 'Fitness Pack', icon: '💪', color: '#ef4444',
    missions: [
      {n:'Morning Workout (30 min)',tier:'S',cat:'physical',xp:100,penalty:50},
      {n:'Evening Walk (20 min)',tier:'A',cat:'physical',xp:50,penalty:10},
      {n:'Drink 2L Water',tier:'A',cat:'physical',xp:25,penalty:0},
      {n:'No Junk Food Today',tier:'A',cat:'physical',xp:50,penalty:25},
    ]
  },
  student: {
    name: 'Student Pack', icon: '📚', color: '#7c3aed',
    missions: [
      {n:'Study Session (2 hrs)',tier:'S',cat:'mental',xp:100,penalty:50},
      {n:'Read 20 min',tier:'A',cat:'mental',xp:50,penalty:10},
      {n:'No phone during study',tier:'A',cat:'discipline',xp:50,penalty:25},
      {n:'Revise yesterday notes',tier:'A',cat:'mental',xp:25,penalty:0},
    ]
  },
  developer: {
    name: 'Developer Pack', icon: '💻', color: '#06b6d4',
    missions: [
      {n:'Code for 2 hrs',tier:'S',cat:'mental',xp:100,penalty:50},
      {n:'Learn something new (30 min)',tier:'A',cat:'mental',xp:50,penalty:10},
      {n:'No social media before noon',tier:'A',cat:'discipline',xp:50,penalty:25},
      {n:'Exercise break (15 min)',tier:'A',cat:'physical',xp:25,penalty:0},
    ]
  },
  entrepreneur: {
    name: 'Entrepreneur Pack', icon: '🚀', color: '#f59e0b',
    missions: [
      {n:'Deep Work (2 hrs no distraction)',tier:'S',cat:'mental',xp:100,penalty:50},
      {n:'Review finances / budget',tier:'A',cat:'financial',xp:50,penalty:10},
      {n:'Network / reach out to 1 person',tier:'A',cat:'social',xp:50,penalty:10},
      {n:'Reflect & plan tomorrow',tier:'A',cat:'discipline',xp:25,penalty:0},
    ]
  },
}

function OnboardingScreen({session, onComplete}) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState(session?.user?.user_metadata?.full_name?.split(' ')[0] || '')
  const [avatar, setAvatar] = useState('🧑‍💻')
  const [selectedPack, setSelectedPack] = useState(null)
  const [loading, setLoading] = useState(false)

  const finish = async () => {
    setLoading(true)
    const missions = selectedPack
      ? MISSION_PACKS[selectedPack].missions.map((m,i) => ({...m, id: Date.now()+i, done: false, pen: false}))
      : [{id:1,n:'Morning Workout',tier:'S',cat:'physical',xp:100,penalty:50,done:false,pen:false},
         {id:2,n:'Deep Work (2 hrs)',tier:'S',cat:'mental',xp:100,penalty:50,done:false,pen:false},
         {id:3,n:'No social media before noon',tier:'A',cat:'discipline',xp:50,penalty:25,done:false,pen:false}]
    onComplete({name: name.trim() || 'Hunter', avatar, missions})
    setLoading(false)
  }

  const steps = [
    // Step 0 - Welcome
    <div key={0} style={{textAlign:'center'}}>
      <div style={{fontSize:'4rem', marginBottom:16}}>⚡</div>
      <div style={{fontFamily:"'Orbitron',monospace", fontSize:'2rem', fontWeight:900, background:'linear-gradient(135deg,#a855f7,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8}}>LIFE RPG</div>
      <div style={{fontSize:14, color:'#64748b', marginBottom:24, lineHeight:1.7}}>
        The System has detected a new hunter.<br/>
        Your real life is now a game.<br/>
        Complete missions. Build streaks. Level up.
      </div>
      <div style={{padding:16, background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:8, marginBottom:24, textAlign:'left'}}>
        {[
          {icon:'⚔️', text:'Daily missions that match your goals'},
          {icon:'🔥', text:'Streaks that track your consistency'},
          {icon:'👑', text:'10 ranks from DORMANT to MONARCH'},
          {icon:'🏪', text:'Reward yourself with gold you earn'},
        ].map((x,i) => <div key={i} style={{display:'flex', alignItems:'center', gap:10, marginBottom:i<3?10:0, fontSize:13, color:'#e2e8f0'}}>
          <span>{x.icon}</span><span>{x.text}</span>
        </div>)}
      </div>
      <button onClick={()=>setStep(1)} style={{width:'100%', padding:'14px', background:'linear-gradient(135deg,#7c3aed,#a855f7)', border:'none', borderRadius:6, color:'white', fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, letterSpacing:2, cursor:'pointer'}}>
        BEGIN YOUR JOURNEY →
      </button>
    </div>,

    // Step 1 - Name & Avatar
    <div key={1}>
      <div style={{textAlign:'center', marginBottom:24}}>
        <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1rem', color:'#a855f7', marginBottom:8}}>STEP 1 OF 3</div>
        <div style={{fontSize:18, fontWeight:700, color:'#e2e8f0'}}>Who are you, Hunter?</div>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:1.5, color:'#64748b', marginBottom:6}}>Your Name</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name..." style={{background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,padding:'10px 12px',color:'#e2e8f0',fontFamily:"'Rajdhani',sans-serif",fontSize:16,outline:'none',width:'100%'}}/>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:1.5, color:'#64748b', marginBottom:10}}>Choose Your Avatar</div>
        <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {AVTS.map(a => <button key={a} onClick={()=>setAvatar(a)} style={{background:a===avatar?'rgba(124,58,237,0.3)':'#13131f', border:`2px solid ${a===avatar?'#7c3aed':'#1e1e35'}`, borderRadius:8, padding:'8px 10px', fontSize:'1.4rem', cursor:'pointer', transition:'all 0.2s'}}>{a}</button>)}
        </div>
      </div>
      <div style={{display:'flex', gap:10}}>
        <button onClick={()=>setStep(0)} style={{flex:1, padding:'12px', background:'none', border:'1px solid #1e1e35', borderRadius:6, color:'#64748b', fontFamily:"'Rajdhani',sans-serif", fontSize:13, cursor:'pointer', fontWeight:700, letterSpacing:1}}>← BACK</button>
        <button onClick={()=>setStep(2)} disabled={!name.trim()} style={{flex:2, padding:'12px', background:name.trim()?'#7c3aed':'#1e1e35', border:'none', borderRadius:6, color:'white', fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, letterSpacing:1, cursor:name.trim()?'pointer':'not-allowed'}}>NEXT →</button>
      </div>
    </div>,

    // Step 2 - Mission Pack
    <div key={2}>
      <div style={{textAlign:'center', marginBottom:20}}>
        <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1rem', color:'#a855f7', marginBottom:8}}>STEP 2 OF 3</div>
        <div style={{fontSize:18, fontWeight:700, color:'#e2e8f0'}}>Choose your mission pack</div>
        <div style={{fontSize:12, color:'#64748b', marginTop:4}}>You can customize everything later</div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16}}>
        {Object.entries(MISSION_PACKS).map(([key, pack]) => (
          <div key={key} onClick={()=>setSelectedPack(selectedPack===key?null:key)}
            style={{padding:14, background:selectedPack===key?`${pack.color}15`:'#13131f', border:`2px solid ${selectedPack===key?pack.color:'#1e1e35'}`, borderRadius:8, cursor:'pointer', transition:'all 0.2s', textAlign:'center'}}>
            <div style={{fontSize:'2rem', marginBottom:6}}>{pack.icon}</div>
            <div style={{fontSize:12, fontWeight:700, color:selectedPack===key?pack.color:'#e2e8f0', textTransform:'uppercase', letterSpacing:1}}>{pack.name}</div>
            <div style={{fontSize:10, color:'#64748b', marginTop:4}}>{pack.missions.length} missions</div>
          </div>
        ))}
      </div>
      {selectedPack && (
        <div style={{padding:12, background:'#13131f', border:'1px solid #1e1e35', borderRadius:6, marginBottom:16}}>
          {MISSION_PACKS[selectedPack].missions.map((m,i) => (
            <div key={i} style={{fontSize:11, color:'#94a3b8', padding:'3px 0', borderBottom:i<MISSION_PACKS[selectedPack].missions.length-1?'1px solid #1e1e35':undefined}}>
              {m.tier==='S'?'🔴':'🟡'} {m.n} · +{m.xp}XP
            </div>
          ))}
        </div>
      )}
      {!selectedPack && <div style={{fontSize:11, color:'#64748b', textAlign:'center', marginBottom:16, fontStyle:'italic'}}>No pack selected — you'll start with default missions</div>}
      <div style={{display:'flex', gap:10}}>
        <button onClick={()=>setStep(1)} style={{flex:1, padding:'12px', background:'none', border:'1px solid #1e1e35', borderRadius:6, color:'#64748b', fontFamily:"'Rajdhani',sans-serif", fontSize:13, cursor:'pointer', fontWeight:700, letterSpacing:1}}>← BACK</button>
        <button onClick={()=>setStep(3)} style={{flex:2, padding:'12px', background:'#7c3aed', border:'none', borderRadius:6, color:'white', fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, letterSpacing:1, cursor:'pointer'}}>NEXT →</button>
      </div>
    </div>,

    // Step 3 - Ready
    <div key={3} style={{textAlign:'center'}}>
      <div style={{fontSize:'3rem', marginBottom:12}}>{avatar}</div>
      <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.4rem', fontWeight:900, color:'#f59e0b', marginBottom:4}}>{name}</div>
      <div style={{fontSize:12, color:'#64748b', marginBottom:4}}>💀 DORMANT I — The Sleeper</div>
      <div style={{fontSize:11, color:'#334155', marginBottom:24}}>Your journey to MONARCH begins now.</div>
      <div style={{padding:16, background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, marginBottom:24, textAlign:'left'}}>
        <div style={{fontSize:12, fontWeight:700, color:'#10b981', marginBottom:10, textTransform:'uppercase', letterSpacing:1}}>✅ You are set up with:</div>
        {[
          selectedPack ? `${MISSION_PACKS[selectedPack].missions.length} missions from ${MISSION_PACKS[selectedPack].name}` : '3 default missions to start',
          'Cloud save — your data is safe',
          'Full rank system from DORMANT → MONARCH',
          'Reward shop with gold you earn',
        ].map((x,i) => <div key={i} style={{fontSize:11, color:'#94a3b8', marginBottom:6}}>• {x}</div>)}
      </div>
      <button onClick={finish} disabled={loading} style={{width:'100%', padding:'14px', background:'linear-gradient(135deg,#7c3aed,#a855f7)', border:'none', borderRadius:6, color:'white', fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, letterSpacing:2, cursor:'pointer'}}>
        {loading ? 'INITIALIZING...' : '⚡ ENTER THE SYSTEM'}
      </button>
    </div>
  ]

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:12, padding:32, width:'100%', maxWidth:480, boxShadow:'0 0 60px rgba(124,58,237,0.2)'}}>
        <div style={{display:'flex', gap:4, marginBottom:24}}>
          {[0,1,2,3].map(i => <div key={i} style={{flex:1, height:3, borderRadius:2, background:i<=step?'#7c3aed':'#1e1e35', transition:'background 0.3s'}}/>)}
        </div>
        {steps[step]}
      </div>
    </div>
  )
}

// ── PHASE 2: PROFILE PAGE ──────────────────────────────────────────────────
function ProfilePage({G, session, lv, rank, title, xpPct, setModal}) {
  const achievements = getAchievements(G, lv)
  const clx = getLvXP(lv), nlx = getLvXP(lv+1)

  return (
    <div style={{maxWidth:800, margin:'0 auto'}}>
      {/* Profile Hero */}
      <div style={{background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:8, padding:28, marginBottom:16, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, background:`radial-gradient(circle at 20% 50%, rgba(124,58,237,0.08), transparent 60%)`, pointerEvents:'none'}}/>
        <div style={{display:'flex', alignItems:'center', gap:20, marginBottom:20}}>
          <div onClick={()=>setModal({type:'player'})} style={{width:80, height:80, borderRadius:12, background:'linear-gradient(135deg,#1a0a3e,#0a1a3e)', border:'2px solid #7c3aed', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', cursor:'pointer', flexShrink:0, boxShadow:'0 0 20px rgba(124,58,237,0.3)'}}>
            {G.player.av}
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.4rem', fontWeight:700, color:'#e2e8f0', marginBottom:4}}>{G.player.n}</div>
            <RankBadge rank={rank}/>
            <div style={{fontSize:12, color:'#64748b', marginTop:6, fontStyle:'italic'}}>{G.player.t || title.split('—')[0].trim()}</div>
          </div>
          <div style={{textAlign:'right', flexShrink:0}}>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:'2rem', fontWeight:900, color:'#f59e0b'}}>LV.{lv}</div>
            <div style={{fontSize:10, color:'#64748b', textTransform:'uppercase', letterSpacing:1}}>Level</div>
          </div>
        </div>
        {/* XP Bar */}
        <div style={{marginBottom:4, display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b'}}>
          <span>Level {lv}</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace", color:'#a855f7'}}>{G.xp} / {nlx} XP</span>
        </div>
        <div style={{height:8, background:'#13131f', border:'1px solid #1e1e35', borderRadius:4, overflow:'hidden'}}>
          <div style={{height:'100%', width:`${Math.min(100,xpPct)}%`, background:'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius:4, transition:'width 0.8s', boxShadow:'0 0 8px rgba(124,58,237,0.6)'}}/>
        </div>
        {/* Stats Row */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:20}}>
          {[
            {v:G.txp||0, l:'Total XP', c:'#a855f7'},
            {v:G.gold, l:'Gold', c:'#f59e0b'},
            {v:G.streak+'🔥', l:'Streak', c:'#f97316'},
            {v:G.best, l:'Best Streak', c:'#06b6d4'},
          ].map((s,i) => <div key={i} style={{textAlign:'center', padding:10, background:'#13131f', border:'1px solid #1e1e35', borderRadius:6}}>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.1rem', fontWeight:700, color:s.c}}>{s.v}</div>
            <div style={{fontSize:9, textTransform:'uppercase', letterSpacing:1.5, color:'#64748b', marginTop:2}}>{s.l}</div>
          </div>)}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        {/* Achievements */}
        <Panel title="Achievements">
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            {achievements.map((a,i) => (
              <div key={i} style={{padding:10, background:a.earned?`${a.color}15`:'#13131f', border:`1px solid ${a.earned?a.color:'#1e1e35'}`, borderRadius:6, textAlign:'center', opacity:a.earned?1:0.4}}>
                <div style={{fontSize:'1.5rem', marginBottom:4}}>{a.earned?a.icon:'🔒'}</div>
                <div style={{fontSize:10, fontWeight:700, color:a.earned?a.color:'#334155', textTransform:'uppercase', letterSpacing:1}}>{a.name}</div>
                <div style={{fontSize:9, color:'#64748b', marginTop:2}}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Rank Progression */}
        <Panel title="Rank Journey">
          <div style={{overflowY:'auto', maxHeight:300}}>
            {RANK_TIERS.map((tier) => {
              const isActive = rank.base === tier.lbl
              const isPast = lv > tier.max
              const rs = rankStyles[tier.cls] || {}
              return (
                <div key={tier.lbl} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:isActive?`rgba(124,58,237,0.08)`:'transparent', borderRadius:6, marginBottom:4, border:isActive?'1px solid rgba(124,58,237,0.3)':'1px solid transparent'}}>
                  <div style={{fontSize:'1.1rem', opacity:isPast||isActive?1:0.3}}>{RANK_ICONS[tier.lbl]}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11, fontWeight:700, color:isActive?'#a855f7':isPast?'#64748b':'#334155', textTransform:'uppercase', letterSpacing:1}}>
                      {tier.lbl} {tier.sub.filter(Boolean).join(' / ')}
                    </div>
                    <div style={{fontSize:9, color:'#334155'}}>Level {tier.min}{tier.max>tier.min?`–${tier.max}`:''}</div>
                  </div>
                  {isActive && <span style={{fontSize:9, color:'#a855f7', fontFamily:"'Share Tech Mono',monospace"}}>◄ YOU</span>}
                  {isPast && <span style={{fontSize:12, color:'#10b981'}}>✓</span>}
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function getAchievements(G, lv) {
  return [
    {name:'First Blood', icon:'⚔️', desc:'Complete first mission', color:'#ef4444', earned: G.txp>0},
    {name:'On Streak', icon:'🔥', desc:'3 day streak', color:'#f97316', earned: G.streak>=3||G.best>=3},
    {name:'Week Warrior', icon:'🏆', desc:'7 day streak', color:'#f59e0b', earned: G.streak>=7||G.best>=7},
    {name:'Awakened', icon:'👁', desc:'Reach level 2', color:'#86efac', earned: lv>=2},
    {name:'Challenger', icon:'⚔️', desc:'Reach level 6', color:'#67e8f9', earned: lv>=6},
    {name:'Gold Hoarder', icon:'💰', desc:'Earn 500 gold', color:'#f59e0b', earned: (G.gold||0)>=500},
    {name:'Phantom', icon:'👻', desc:'Reach level 10', color:'#fda4af', earned: lv>=10},
    {name:'Monarch', icon:'☄️', desc:'Reach level 20', color:'#fef08a', earned: lv>=20},
  ]
}

// ── PHASE 2: COMMUNITY / STORIES ──────────────────────────────────────────
function CommunityPage({G, session, rank, lv}) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedIds, setLikedIds] = useState(new Set())

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setStories(data)

    // load user's likes
    if (session) {
      const { data: likes } = await supabase
        .from('story_likes')
        .select('story_id')
        .eq('user_id', session.user.id)
      if (likes) setLikedIds(new Set(likes.map(l => l.story_id)))
    }
    setLoading(false)
  }

  const toggleLike = async (storyId) => {
    if (!session) return
    const liked = likedIds.has(storyId)
    if (liked) {
      await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', session.user.id)
      await supabase.from('stories').update({likes: Math.max(0, (stories.find(s=>s.id===storyId)?.likes||1)-1)}).eq('id', storyId)
      setLikedIds(prev => { const n=new Set(prev); n.delete(storyId); return n })
      setStories(prev => prev.map(s => s.id===storyId ? {...s, likes: Math.max(0,(s.likes||1)-1)} : s))
    } else {
      await supabase.from('story_likes').insert({story_id: storyId, user_id: session.user.id})
      await supabase.from('stories').update({likes: (stories.find(s=>s.id===storyId)?.likes||0)+1}).eq('id', storyId)
      setLikedIds(prev => new Set([...prev, storyId]))
      setStories(prev => prev.map(s => s.id===storyId ? {...s, likes: (s.likes||0)+1} : s))
    }
  }

  const deleteStory = async (storyId) => {
    await supabase.from('stories').delete().eq('id', storyId)
    setStories(prev => prev.filter(s => s.id !== storyId))
  }

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff/60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins/60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs/24)}d ago`
  }

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <Panel title="Community Feed" action={<span style={{fontSize:10, color:'#64748b'}}>Achievements posted by hunters</span>}>
        {loading && <div style={{textAlign:'center', padding:40, color:'#334155', fontFamily:"'Share Tech Mono',monospace"}}>Loading stories...</div>}
        {!loading && !stories.length && (
          <div style={{textAlign:'center', padding:40}}>
            <div style={{fontSize:'2rem', marginBottom:8}}>👻</div>
            <div style={{color:'#334155', fontSize:13}}>No stories yet. Level up to post the first one!</div>
          </div>
        )}
        {stories.map(s => {
          const isOwn = session?.user?.id === s.user_id
          const liked = likedIds.has(s.id)
          const typeColors = {levelup:'#f59e0b', streak:'#f97316', perfect:'#10b981', goal:'#06b6d4'}
          const typeIcons = {levelup:'⚡', streak:'🔥', perfect:'✅', goal:'🎯'}
          return (
            <div key={s.id} style={{padding:16, background:'#13131f', border:'1px solid #1e1e35', borderRadius:8, marginBottom:12}}>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                <div style={{fontSize:'1.5rem'}}>{s.avatar||'🧑‍💻'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:700, color:'#e2e8f0'}}>{s.username||'Hunter'}</div>
                  <div style={{fontSize:10, color:'#334155'}}>{s.rank_label} · {timeAgo(s.created_at)}</div>
                </div>
                <div style={{fontSize:10, padding:'3px 8px', borderRadius:10, background:`${typeColors[s.type]||'#7c3aed'}22`, color:typeColors[s.type]||'#a855f7', border:`1px solid ${typeColors[s.type]||'#7c3aed'}44`}}>
                  {typeIcons[s.type]||'⚡'} {s.type?.toUpperCase()}
                </div>
              </div>
              <div style={{fontFamily:"'Orbitron',monospace", fontSize:'0.9rem', fontWeight:700, color:'#e2e8f0', marginBottom:4}}>{s.title}</div>
              <div style={{fontSize:12, color:'#64748b', marginBottom:10}}>{s.body}</div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <button onClick={()=>toggleLike(s.id)} style={{background:'none', border:`1px solid ${liked?'#ef4444':'#1e1e35'}`, borderRadius:20, padding:'4px 12px', color:liked?'#ef4444':'#64748b', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:4}}>
                  {liked?'❤️':'🤍'} {s.likes||0}
                </button>
                {isOwn && <button onClick={()=>deleteStory(s.id)} style={{background:'none', border:'1px solid #1e1e35', borderRadius:20, padding:'4px 10px', color:'#334155', cursor:'pointer', fontSize:11}}>Delete</button>}
              </div>
            </div>
          )
        })}
      </Panel>
    </div>
  )
}

// ── PHASE 2: LEADERBOARD ──────────────────────────────────────────────────
function LeaderboardPage({session}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('xp')

  useEffect(() => { loadUsers() }, [tab])

  const loadUsers = async () => {
    setLoading(true)
    const col = tab==='xp' ? 'xp' : tab==='streak' ? 'streak' : 'level'
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order(col, { ascending: false })
      .limit(50)
    if (data) setUsers(data)
    setLoading(false)
  }

  const myId = session?.user?.id
  const myRank = users.findIndex(u => u.id === myId) + 1

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      <Panel title="Global Leaderboard" action={
        <div style={{display:'flex', gap:4}}>
          {[{k:'xp',l:'XP'},{k:'streak',l:'Streak'},{k:'level',l:'Level'}].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'4px 10px', background:tab===t.k?'rgba(124,58,237,0.2)':'none', border:`1px solid ${tab===t.k?'#7c3aed':'#1e1e35'}`, borderRadius:4, color:tab===t.k?'#a855f7':'#64748b', fontSize:11, cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontWeight:700}}>{t.l}</button>
          ))}
        </div>
      }>
        {myRank>0 && <div style={{padding:'8px 12px', background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:6, marginBottom:12, fontSize:12, color:'#a855f7', textAlign:'center'}}>
          You are ranked #{myRank} globally
        </div>}
        {loading && <div style={{textAlign:'center', padding:40, color:'#334155', fontFamily:"'Share Tech Mono',monospace"}}>Loading...</div>}
        {users.map((u, i) => {
          const isMe = u.id === myId
          const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`
          return (
            <div key={u.id} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:isMe?'rgba(124,58,237,0.08)':'#13131f', border:`1px solid ${isMe?'rgba(124,58,237,0.3)':'#1e1e35'}`, borderRadius:6, marginBottom:6}}>
              <div style={{fontFamily:"'Orbitron',monospace", fontSize:i<3?'1.2rem':'0.8rem', minWidth:32, textAlign:'center', color:i<3?undefined:'#64748b'}}>{medal}</div>
              <div style={{fontSize:'1.3rem'}}>{u.avatar||'🧑‍💻'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color:isMe?'#a855f7':'#e2e8f0'}}>{u.username||'Hunter'}{isMe?' (You)':''}{u.is_pro?' 👑':''}</div>
                <div style={{fontSize:10, color:'#64748b'}}>{u.rank_label||'DORMANT I'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:"'Orbitron',monospace", fontSize:'0.9rem', fontWeight:700, color:'#f59e0b'}}>
                  {tab==='xp'?`${u.xp||0} XP`:tab==='streak'?`${u.streak||0}🔥`:`LV.${u.level||0}`}
                </div>
              </div>
            </div>
          )
        })}
        {!loading && !users.length && <div style={{textAlign:'center', padding:40, color:'#334155'}}>No hunters yet. Be the first!</div>}
      </Panel>
    </div>
  )
}



// ── PHASE 3: FRIENDS SYSTEM ──────────────────────────────────────────────── v3.2 build:1774161123
function FriendsPage({G, session}) {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [myCode] = useState(session?.user?.id?.slice(0,8).toUpperCase() || '')
  const [codeInput, setCodeInput] = useState('')
  const [tab, setTab] = useState('friends')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFriends() }, [])

  const loadFriends = async () => {
    setLoading(true)
    // Get accepted friends
    const { data: sent } = await supabase.from('friends')
      .select('friend_id, status').eq('user_id', session.user.id)
    const { data: recv } = await supabase.from('friends')
      .select('user_id, status').eq('friend_id', session.user.id)

    const acceptedIds = [
      ...(sent?.filter(f=>f.status==='accepted').map(f=>f.friend_id)||[]),
      ...(recv?.filter(f=>f.status==='accepted').map(f=>f.user_id)||[])
    ]
    const pendingRecv = recv?.filter(f=>f.status==='pending').map(f=>f.user_id)||[]

    if (acceptedIds.length) {
      const { data: profiles } = await supabase.from('profiles')
        .select('*').in('id', acceptedIds)
      setFriends(profiles||[])
    }
    if (pendingRecv.length) {
      const { data: profiles } = await supabase.from('profiles')
        .select('*').in('id', pendingRecv)
      setRequests(profiles||[])
    }
    setLoading(false)
  }

  const searchUsers = async () => {
    if (!search.trim()) return
    setSearching(true)
    const { data } = await supabase.from('profiles')
      .select('*').ilike('username', `%${search}%`).neq('id', session.user.id).limit(10)
    setSearchResults(data||[])
    setSearching(false)
  }

  const addByCode = async () => {
    const code = codeInput.trim().toUpperCase()
    if (!code) return
    // Find user whose id starts with code
    const { data } = await supabase.from('profiles')
      .select('*').neq('id', session.user.id)
    const found = data?.find(u => u.id.slice(0,8).toUpperCase() === code)
    if (!found) { alert('User not found!'); return }
    await sendRequest(found.id)
    setCodeInput('')
  }

  const sendRequest = async (friendId) => {
    await supabase.from('friends').upsert({
      user_id: session.user.id, friend_id: friendId, status: 'pending'
    }, {onConflict: 'user_id,friend_id'})
    alert('Friend request sent!')
    setSearchResults([])
    setSearch('')
  }

  const acceptRequest = async (userId) => {
    await supabase.from('friends').upsert({
      user_id: session.user.id, friend_id: userId, status: 'accepted'
    }, {onConflict: 'user_id,friend_id'})
    await supabase.from('friends').update({status:'accepted'})
      .eq('user_id', userId).eq('friend_id', session.user.id)
    loadFriends()
  }

  const getRankForUser = (u) => {
    const lv = u.level||0
    let tier = RANK_TIERS[0]
    for (const t of RANK_TIERS) { if (lv>=t.min) tier=t }
    return { icon: RANK_ICONS[tier.lbl]||'⚡', lbl: u.rank_label||'DORMANT I' }
  }

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      {/* My Friend Code */}
      <Panel title="Your Friend Code" style={{marginBottom:16}}>
        <div style={{display:'flex', alignItems:'center', gap:12, padding:16, background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:1, marginBottom:4}}>Share this code with friends</div>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.8rem', fontWeight:900, color:'#a855f7', letterSpacing:4}}>{myCode}</div>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(myCode); alert('Code copied!')}} style={{padding:'10px 16px', background:'rgba(124,58,237,0.2)', border:'1px solid #7c3aed', borderRadius:6, color:'#a855f7', cursor:'pointer', fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:12}}>COPY</button>
        </div>
        {/* Add by code */}
        <div style={{display:'flex', gap:8, marginTop:12}}>
          <input value={codeInput} onChange={e=>setCodeInput(e.target.value.toUpperCase())} placeholder="Enter friend code..." style={{flex:1, background:'#13131f', border:'1px solid #1e1e35', borderRadius:4, padding:'8px 12px', color:'#e2e8f0', fontFamily:"'Orbitron',monospace", fontSize:14, outline:'none', letterSpacing:2}} maxLength={8}/>
          <Btn onClick={addByCode}>ADD</Btn>
        </div>
      </Panel>

      {/* Search */}
      <Panel title="Find by Username" style={{marginBottom:16}}>
        <div style={{display:'flex', gap:8, marginBottom:12}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchUsers()} placeholder="Search username..." style={{flex:1, background:'#13131f', border:'1px solid #1e1e35', borderRadius:4, padding:'8px 12px', color:'#e2e8f0', fontFamily:"'Rajdhani',sans-serif", fontSize:14, outline:'none'}}/>
          <Btn onClick={searchUsers}>{searching?'...':'SEARCH'}</Btn>
        </div>
        {searchResults.map(u => {
          const r = getRankForUser(u)
          return <div key={u.id} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#13131f', border:'1px solid #1e1e35', borderRadius:6, marginBottom:8}}>
            <div style={{fontSize:'1.3rem'}}>{u.avatar||'🧑‍💻'}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13, fontWeight:700, color:'#e2e8f0'}}>{u.username}</div>
              <div style={{fontSize:10, color:'#64748b'}}>{r.icon} {r.lbl} · LV.{u.level||0}</div>
            </div>
            <Btn sm onClick={()=>sendRequest(u.id)}>ADD</Btn>
          </div>
        })}
      </Panel>

      {/* Friend Requests */}
      {requests.length > 0 && (
        <Panel title={`Friend Requests (${requests.length})`} style={{marginBottom:16}}>
          {requests.map(u => (
            <div key={u.id} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#13131f', border:'1px solid rgba(245,158,11,0.3)', borderRadius:6, marginBottom:8}}>
              <div style={{fontSize:'1.3rem'}}>{u.avatar||'🧑‍💻'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color:'#e2e8f0'}}>{u.username}</div>
                <div style={{fontSize:10, color:'#64748b'}}>LV.{u.level||0} · {u.streak||0}🔥 streak</div>
              </div>
              <Btn sm onClick={()=>acceptRequest(u.id)}>ACCEPT</Btn>
            </div>
          ))}
        </Panel>
      )}

      {/* Friends List */}
      <Panel title={`Friends (${friends.length})`}>
        {loading && <div style={{textAlign:'center', padding:20, color:'#334155'}}>Loading...</div>}
        {!loading && !friends.length && (
          <div style={{textAlign:'center', padding:32}}>
            <div style={{fontSize:'2rem', marginBottom:8}}>👥</div>
            <div style={{color:'#334155', fontSize:13}}>No friends yet. Share your code!</div>
          </div>
        )}
        {friends.map((u,i) => {
          const r = getRankForUser(u)
          return (
            <div key={u.id} style={{display:'flex', alignItems:'center', gap:12, padding:'12px', background:'#13131f', border:'1px solid #1e1e35', borderRadius:6, marginBottom:8}}>
              <div style={{fontFamily:"'Orbitron',monospace", fontSize:'0.8rem', color:'#64748b', minWidth:20}}>#{i+1}</div>
              <div style={{fontSize:'1.4rem'}}>{u.avatar||'🧑‍💻'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color:'#e2e8f0'}}>{u.username}</div>
                <div style={{fontSize:10, color:'#64748b'}}>{r.icon} {r.lbl}</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, textAlign:'center'}}>
                <div><div style={{fontFamily:"'Orbitron',monospace", fontSize:'0.85rem', fontWeight:700, color:'#a855f7'}}>{u.xp||0}</div><div style={{fontSize:9, color:'#64748b'}}>XP</div></div>
                <div><div style={{fontFamily:"'Orbitron',monospace", fontSize:'0.85rem', fontWeight:700, color:'#f97316'}}>{u.streak||0}🔥</div><div style={{fontSize:9, color:'#64748b'}}>Streak</div></div>
                <div><div style={{fontFamily:"'Orbitron',monospace", fontSize:'0.85rem', fontWeight:700, color:'#06b6d4'}}>LV.{u.level||0}</div><div style={{fontSize:9, color:'#64748b'}}>Level</div></div>
              </div>
            </div>
          )
        })}
      </Panel>
    </div>
  )
}

// ── PHASE 3: ANALYTICS PAGE ────────────────────────────────────────────────
function AnalyticsPage({G}) {
  const history = G.history || {}
  const missions = G.missions || []
  const lv = getLv(G.xp)

  // Last 30 days data
  const last30 = Array.from({length:30}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-i)
    const ds = localDS(d)
    const h = history[ds]
    return { ds, date: d, pct: h?.pct||0, xp: h?.xp||0, done: h?.d||0, total: h?.m||0 }
  }).reverse()

  // Day of week analysis
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const dayStats = dayNames.map((name,i) => {
    const days = last30.filter(d => d.date.getDay()===i && d.total>0)
    const avg = days.length ? days.reduce((s,d)=>s+d.pct,0)/days.length : 0
    return { name, avg, count: days.length }
  })

  // Best and worst
  const activeDays = last30.filter(d => d.total>0)
  const avgCompletion = activeDays.length ? Math.round(activeDays.reduce((s,d)=>s+d.pct,0)/activeDays.length*100) : 0
  const perfectDays = activeDays.filter(d => d.pct>=1).length
  const missedDays = last30.filter(d => d.total>0 && d.pct<0.5).length
  const bestDay = dayStats.reduce((best,d) => d.avg>best.avg?d:best, dayStats[0])

  // Mission completion rates
  const missionStats = missions.map(m => ({
    name: m.n,
    tier: m.tier,
    done: m.done ? 1 : 0
  }))

  return (
    <div style={{maxWidth:900, margin:'0 auto'}}>
      {/* Summary Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16}}>
        {[
          {v:`${avgCompletion}%`, l:'Avg Completion', c:'#a855f7'},
          {v:perfectDays, l:'Perfect Days', c:'#10b981'},
          {v:missedDays, l:'Missed Days', c:'#ef4444'},
          {v:bestDay?.name||'-', l:'Best Day', c:'#f59e0b'},
        ].map((s,i) => (
          <div key={i} style={{background:'#0f0f1a', border:'1px solid #1e1e35', borderRadius:8, padding:16, textAlign:'center'}}>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.4rem', fontWeight:700, color:s.c}}>{s.v}</div>
            <div style={{fontSize:9, textTransform:'uppercase', letterSpacing:1.5, color:'#64748b', marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16}}>
        {/* 30 Day Chart */}
        <Panel title="30-Day Completion">
          <div style={{display:'flex', alignItems:'flex-end', gap:3, height:120, marginBottom:8}}>
            {last30.map((d,i) => {
              const p = d.pct
              const ht = Math.max(3, p*110)
              const col = d.ds===localDS(new Date())?'#a855f7':p>=1?'#10b981':p>=0.5?'#f59e0b':p>0?'#ef4444':'#1e1e35'
              return <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end'}}>
                <div style={{width:'100%', height:ht, background:col, borderRadius:'2px 2px 0 0', minHeight:3}}/>
              </div>
            })}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:9, color:'#334155'}}>
            <span>30 days ago</span><span>Today</span>
          </div>
        </Panel>

        {/* Day of Week */}
        <Panel title="Best Days of Week">
          {dayStats.map((d,i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <div style={{fontSize:11, color:'#64748b', width:28, fontFamily:"'Share Tech Mono',monospace"}}>{d.name}</div>
              <div style={{flex:1, height:8, background:'#13131f', borderRadius:4, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.round(d.avg*100)}%`, background:d.avg>=0.8?'#10b981':d.avg>=0.5?'#f59e0b':'#ef4444', borderRadius:4, transition:'width 0.8s'}}/>
              </div>
              <div style={{fontSize:10, color:'#64748b', width:32, textAlign:'right', fontFamily:"'Share Tech Mono',monospace"}}>{Math.round(d.avg*100)}%</div>
            </div>
          ))}
        </Panel>
      </div>

      {/* Attribute Growth */}
      <Panel title="Attribute Progress">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {Object.keys(G.am).map(k => {
            const m = G.am[k]
            const v = Math.round((G.attrs[k]||0)*10)/10
            const p = Math.min(100, G.attrs[k]||0)
            return (
              <div key={k} style={{padding:12, background:'#13131f', border:'1px solid #1e1e35', borderRadius:6}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                  <div style={{display:'flex', alignItems:'center', gap:6}}>
                    <span>{m.e}</span>
                    <span style={{fontSize:12, fontWeight:700, color:'#e2e8f0'}}>{m.n}</span>
                  </div>
                  <span style={{fontFamily:"'Orbitron',monospace", fontSize:'0.9rem', fontWeight:700, color:m.c}}>{v}</span>
                </div>
                <div style={{height:6, background:'#1e1e35', borderRadius:3, overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${p}%`, background:m.c, borderRadius:3, boxShadow:`0 0 6px ${m.c}`, transition:'width 0.8s'}}/>
                </div>
                <div style={{fontSize:9, color:'#334155', marginTop:4}}>{G.missions.filter(x=>x.cat===k).length} missions linked</div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}

// ── PHASE 3: WEEKLY CHALLENGE ──────────────────────────────────────────────
function ChallengePage({G, session, notif}) {
  const [challenge, setChallenge] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState(0)

  const CHALLENGE_IDEAS = [
    {title:'7-Day Streak Challenge', desc:'Maintain a 7-day streak this week. Complete at least 50% of missions every day.', icon:'🔥', xpReward:300},
    {title:'Perfect Monday', desc:'Complete 100% of your missions on Monday. No excuses.', icon:'💯', xpReward:150},
    {title:'S-Tier Domination', desc:'Complete all your S-Tier missions every day this week.', icon:'⚔️', xpReward:400},
    {title:'Discipline Week', desc:'Complete all Discipline-linked missions for 5 days straight.', icon:'⚡', xpReward:250},
    {title:'No-Skip Week', desc:'Do not skip a single mission this entire week.', icon:'🛡', xpReward:500},
    {title:'Gold Rush', desc:'Earn 200+ gold this week from mission completions.', icon:'🥇', xpReward:200},
  ]

  useEffect(() => { loadChallenge() }, [])

  const getWeekId = () => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    return localDS(start)
  }

  const loadChallenge = async () => {
    setLoading(true)
    const weekId = getWeekId()

    // Check if this week has an active challenge
    const { data: active } = await supabase.from('challenges')
      .select('*').eq('week_id', weekId).eq('status', 'active').maybeSingle()

    if (active) {
      setChallenge(active)
      // Count participants
      const { count } = await supabase.from('challenge_entries')
        .select('*', {count:'exact'}).eq('challenge_id', active.id)
      setParticipants(count||0)
    } else {
      // Show voting - pick 4 random candidates
      const { data: voting } = await supabase.from('challenges')
        .select('*').eq('week_id', weekId).eq('status', 'voting')

      if (voting?.length) {
        setCandidates(voting)
        // Check if user voted this week using votes table
        const { data: myVote } = await supabase.from('challenge_votes')
          .select('user_id').eq('user_id', session.user.id).eq('week_id', weekId).maybeSingle()
        if (myVote) setHasVoted(true)
      } else {
        // Generate new candidates for this week
        const shuffled = [...CHALLENGE_IDEAS].sort(()=>Math.random()-0.5).slice(0,4)
        const toInsert = shuffled.map(c => ({
          week_id: weekId, status: 'voting',
          title: c.title, description: c.desc, icon: c.icon,
          xp_reward: c.xpReward, vote_count: 0
        }))
        const { data: inserted } = await supabase.from('challenges').insert(toInsert).select()
        setCandidates(inserted||[])
      }
    }
    setLoading(false)
  }

  const vote = async (challengeId) => {
    if (hasVoted) return

    const weekId = getWeekId()

    // Try insert into votes table first
    const { error: voteError } = await supabase.from('challenge_votes').insert({
      user_id: session.user.id,
      challenge_id: challengeId,
      week_id: weekId
    })

    if (voteError) {
      notif('Already voted this week!', 'penalty')
      setHasVoted(true)
      return
    }

    // Vote recorded — now increment count
    const { data: cur } = await supabase
      .from('challenges').select('vote_count').eq('id', challengeId).maybeSingle()

    const newCount = (cur?.vote_count || 0) + 1
    await supabase.from('challenges')
      .update({ vote_count: newCount })
      .eq('id', challengeId)

    setHasVoted(true)
    notif('✅ Vote cast!', 'xp')
    // Update UI immediately without reloading
    setCandidates(prev => prev.map(c =>
      c.id === challengeId ? {...c, vote_count: newCount} : c
    ))
  }

  const joinChallenge = async () => {
    if (!challenge) return
    await supabase.from('challenge_entries').upsert({
      challenge_id: challenge.id, user_id: session.user.id,
      username: G.player?.n||'Hunter', avatar: G.player?.av||'🧑‍💻',
      joined_at: new Date().toISOString(), completed: false
    }, {onConflict: 'challenge_id,user_id'})
    setParticipants(p => p+1)
    notif('⚔️ Joined the challenge!', 'levelup')
  }

  return (
    <div style={{maxWidth:680, margin:'0 auto'}}>
      {loading && <div style={{textAlign:'center', padding:60, color:'#334155', fontFamily:"'Share Tech Mono',monospace"}}>Loading challenge...</div>}

      {!loading && challenge && (
        <Panel title="This Week's Challenge">
          <div style={{textAlign:'center', padding:24, background:`rgba(124,58,237,0.06)`, border:'1px solid rgba(124,58,237,0.2)', borderRadius:8, marginBottom:16}}>
            <div style={{fontSize:'3rem', marginBottom:8}}>{challenge.icon}</div>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.2rem', fontWeight:700, color:'#e2e8f0', marginBottom:8}}>{challenge.title}</div>
            <div style={{fontSize:13, color:'#94a3b8', marginBottom:16, lineHeight:1.7}}>{challenge.description}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24, marginBottom:20}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.4rem', fontWeight:700, color:'#f59e0b'}}>{challenge.xp_reward}</div>
                <div style={{fontSize:10, color:'#64748b'}}>XP Reward</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:"'Orbitron',monospace", fontSize:'1.4rem', fontWeight:700, color:'#06b6d4'}}>{participants}</div>
                <div style={{fontSize:10, color:'#64748b'}}>Participants</div>
              </div>
            </div>
            <Btn onClick={joinChallenge}>⚔️ JOIN CHALLENGE</Btn>
          </div>
        </Panel>
      )}

      {!loading && !challenge && candidates.length > 0 && (
        <Panel title="Vote for This Week's Challenge">
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:'#06b6d4', padding:10, background:'rgba(6,182,212,0.05)', border:'1px solid rgba(6,182,212,0.15)', borderRadius:6, marginBottom:16}}>
            Vote for the challenge you want this week. Most votes wins!
          </div>
          {candidates.map(c => (
            <div key={c.id} onClick={()=>!hasVoted&&vote(c.id)} style={{display:'flex', alignItems:'center', gap:12, padding:14, background:'#13131f', border:`1px solid ${hasVoted?'#1e1e35':'rgba(124,58,237,0.2)'}`, borderRadius:8, marginBottom:10, cursor:hasVoted?'default':'pointer', transition:'all 0.2s', opacity:hasVoted?0.7:1}}>
              <div style={{fontSize:'1.8rem'}}>{c.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:700, color:'#e2e8f0'}}>{c.title}</div>
                <div style={{fontSize:11, color:'#64748b', marginTop:2}}>{c.description}</div>
                <div style={{fontSize:10, color:'#f59e0b', marginTop:4}}>+{c.xp_reward} XP reward · {c.vote_count||0} votes</div>
              </div>
              {!hasVoted && <div style={{fontSize:10, color:'#a855f7', border:'1px solid #7c3aed', borderRadius:4, padding:'4px 8px', fontWeight:700}}>VOTE</div>}
            </div>
          ))}
          {hasVoted && <div style={{textAlign:'center', fontSize:12, color:'#64748b', marginTop:8, fontStyle:'italic'}}>Vote cast! Challenge activates Monday.</div>}
        </Panel>
      )}
    </div>
  )
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App(){
  const [session,setSession]=useState(null)
  const [loading,setLoading]=useState(true)
  const [G,setG]=useState(null) // game state
  const [page,setPage]=useState('dashboard')
  const [onboarding,setOnboarding]=useState(false)
  const [notifs,setNotifs]=useState([])
  const [modal,setModal]=useState(null)
  const [calY,setCalY]=useState(new Date().getFullYear())
  const [calM,setCalM]=useState(new Date().getMonth())
  const [goalTab,setGoalTab]=useState({d:'short',w:'short'})
  const [lvUpAnim,setLvUpAnim]=useState(null)
  const saveTimer=useRef(null)

  // ── AUTH ──
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setSession(session);setLoading(false)})
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setSession(session);if(!session)setG(null)})
    return()=>subscription.unsubscribe()
  },[])

  // ── LOAD DATA ──
  useEffect(()=>{
    if(!session){setLoading(false);return}
    setLoading(true)
    supabase.from('game_state').select('state').eq('user_id',session.user.id).single()
      .then(({data,error})=>{
        if(data?.state){
          const s=data.state
          // migrations
          s.missions?.forEach(m=>{if(!m.tier)m.tier='A';if(m.pen===undefined)m.pen=false;delete m.date;if(m.xp>200)m.xp=200;})
          if(!s.am)s.am=JSON.parse(JSON.stringify(DEFAM))
          if(!s.shop)s.shop=DEFSHOP.map(x=>({...x}))
          Object.keys(DEFAM).forEach(k=>{if(s.attrs[k]===undefined)s.attrs[k]=0;if(!s.am[k])s.am[k]=JSON.parse(JSON.stringify(DEFAM[k]))})
          setG(s)
          setOnboarding(false)
        } else {
          setOnboarding(true) // new user — show onboarding
          setG(null)
        }
        setLoading(false)
      })
  },[session])

  // ── AUTO SAVE (debounced) ──
  const save=async(state)=>{
    if(!session||!state)return
    clearTimeout(saveTimer.current)
    saveTimer.current=setTimeout(async()=>{
      await supabase.from('game_state').upsert({user_id:session.user.id,state,updated_at:new Date().toISOString()},{onConflict:'user_id'})
      // sync public profile for leaderboard
      const lv=getLv(state.xp), rank=getRank(lv)
      await supabase.from('profiles').upsert({
        id:session.user.id,
        username:state.player?.n||'Hunter',
        avatar:state.player?.av||'🧑‍💻',
        title:state.player?.t||'',
        xp:state.xp||0,
        gold:state.gold||0,
        streak:state.streak||0,
        best_streak:state.best||0,
        level:lv,
        rank_label:rank.lbl,
        updated_at:new Date().toISOString()
      },{onConflict:'id'})
    },800)
  }

  const upd=(fn)=>{
    setG(prev=>{
      const next=fn(JSON.parse(JSON.stringify(prev)))
      save(next)
      return next
    })
  }

  // ── DAY TRANSITION ──
  useEffect(()=>{
    if(!G)return
    const t=td()
    if(G.lastDay&&G.lastDay!==t){
      upd(s=>{
        s.missions.filter(m=>!m.done&&!m.pen&&m.penalty>0).forEach(m=>{s.xp=Math.max(0,s.xp-m.penalty);m.pen=true;})
        const ym=s.missions,yd=ym.filter(m=>m.done)
        if(ym.length)s.history[s.lastDay]={pct:yd.length/ym.length,xp:s.xp,m:ym.length,d:yd.length}
        s.missions.forEach(m=>{m.done=false;m.pen=false;})
        const yh=s.history[s.lastDay]
        if(yh&&yh.pct>=0.5){s.streak++;s.best=Math.max(s.best,s.streak);}
        else{s.streak=0;}
        s.lastDay=t
        return s
      })
    } else if(!G.lastDay){
      upd(s=>{s.lastDay=t;return s})
    }
  },[G?.lastDay])

  // ── NOTIF ──
  const notif=(msg,type='info')=>{
    const id=Date.now()+Math.random()
    setNotifs(p=>[...p,{id,msg,type}])
    setTimeout(()=>setNotifs(p=>p.filter(n=>n.id!==id)),4200)
  }

  // ── LEVEL UP ──
  const checkLvUp=(oldXp,newXp)=>{
    const pl=getLv(oldXp),cl=getLv(newXp)
    if(cl>pl){
      const newRank=getRank(cl)
      setLvUpAnim({from:pl,to:cl,rank:newRank,title:getTitle(cl)})
      setTimeout(()=>setLvUpAnim(null),3500)
      // auto post to community
      if(G){
        const nm=G.player?.n||'Hunter'
        postStory('levelup',`${nm} reached Level ${cl}!`,`Just hit ${newRank.icon} ${newRank.lbl} rank. DORMANT to MONARCH — the grind continues. 🔥`)
      }
      return(cl-pl)*50
    }
    return 0
  }

  // ── MISSION TOGGLE ──
  const toggleM=(id)=>{
    upd(s=>{
      const m=s.missions.find(x=>x.id===id);if(!m)return s
      const baseXP=Math.min(m.xp,200)
      const gain=Math.round(baseXP*(m.tier==='S'?1.5:1))
      const goldGain=Math.floor(gain/10)
      if(m.done){
        const storedXP=m._gainedXP||gain
        const storedGold=m._gainedGold||goldGain
        const storedLvBonus=m._lvBonus||0
        m.done=false
        s.xp=Math.max(0,s.xp-storedXP)
        s.txp=Math.max(0,(s.txp||0)-storedXP)
        s.gold=Math.max(0,s.gold-storedGold-storedLvBonus)
        delete m._gainedXP;delete m._gainedGold;delete m._lvBonus
        s.attrs[m.cat]=Math.max(0,(s.attrs[m.cat]||0)-(m.tier==='S'?0.5:0.3))
        notif(`-${storedXP} XP · -${storedGold+storedLvBonus} Gold — Undone`,'penalty')
      } else {
        m.done=true
        m._gainedXP=gain
        m._gainedGold=goldGain
        const oldXp=s.xp
        s.xp+=gain;s.txp=(s.txp||0)+gain;s.gold+=goldGain
        const lvBonus=checkLvUp(oldXp,s.xp)
        m._lvBonus=lvBonus
        s.gold+=lvBonus
        s.attrs[m.cat]=Math.min(100,(s.attrs[m.cat]||0)+(m.tier==='S'?0.5:0.3))
        notif(`+${gain} XP · +${goldGain} Gold — ${m.n}`,'xp')
      }
      // update history
      const t=td(),ms=s.missions,dn=ms.filter(m=>m.done)
      s.history[t]={pct:ms.length?dn.length/ms.length:0,xp:s.xp,m:ms.length,d:dn.length}
      return s
    })
  }

  const delM=(id)=>upd(s=>{s.missions=s.missions.filter(m=>m.id!==id);return s})
  const addM=(data)=>upd(s=>{s.missions.push({id:Date.now(),...data,done:false,pen:false});return s})

  const toggleX=(id)=>upd(s=>{
    const x=s.extras.find(e=>e.id===id);if(!x)return s
    x.done=!x.done
    if(x.done){s.xp+=75;s.txp=(s.txp||0)+75;s.gold+=20;s.attrs.discipline=Math.min(100,(s.attrs.discipline||0)+0.2);notif('+75 XP · +20 Gold — Bonus!','xp')}
    else{s.xp=Math.max(0,s.xp-75);s.gold=Math.max(0,s.gold-20);s.attrs.discipline=Math.max(0,(s.attrs.discipline||0)-0.2);notif('-75 XP — Uncompleted','penalty')}
    return s
  })
  const addX=(n)=>upd(s=>{s.extras.push({id:Date.now(),n,done:false,week:wkStr()});return s})
  const delX=(id)=>upd(s=>{s.extras=s.extras.filter(e=>e.id!==id);return s})

  const addGoal=(data)=>upd(s=>{s.goals.push({id:Date.now(),...data,prog:0,created:td()});return s})
  const delGoal=(id)=>upd(s=>{s.goals=s.goals.filter(g=>g.id!==id);return s})
  const incGoal=(id)=>upd(s=>{
    const g=s.goals.find(x=>x.id===id);if(!g||g.prog>=g.target)return s
    g.prog++
    if(g.prog>=g.target){const xpR=g.type==='long'?500:150;const gR=g.type==='long'?200:50;s.xp+=xpR;s.txp=(s.txp||0)+xpR;s.gold+=gR;notif(`🎯 GOAL COMPLETE: ${g.n}! +${xpR}XP +${gR}G`,'levelup')}
    else notif(`Progress: ${g.prog}/${g.target}`,'info')
    return s
  })

  const endDay=()=>upd(s=>{
    const ms=s.missions.filter(m=>!m.done&&!m.pen&&m.penalty>0)
    ms.forEach(m=>{s.xp=Math.max(0,s.xp-m.penalty);m.pen=true;notif(`-${m.penalty} XP penalty: ${m.n}`,'penalty')})
    if(!ms.length)notif('✅ All done! No penalties.','xp')
    const t=td(),all=s.missions,dn=all.filter(m=>m.done)
    s.history[t]={pct:all.length?dn.length/all.length:0,xp:s.xp,m:all.length,d:dn.length}
    return s
  })

  const buyShop=(id)=>upd(s=>{
    const i=s.shop.find(x=>x.id===id);if(!i)return s
    if(s.gold<i.c){notif(`❌ Need ${i.c} Gold, have ${s.gold}`,'penalty');return s}
    s.gold-=i.c;notif(`✅ Enjoy: ${i.n}! You earned it.`,'levelup');return s
  })
  const addShopItem=(item)=>upd(s=>{s.shop.push({id:'c'+Date.now(),...item,custom:true});return s})
  const delShopItem=(id)=>upd(s=>{s.shop=s.shop.filter(x=>x.id!==id);return s})
  const updPlayer=(data)=>upd(s=>{s.player={...s.player,...data};return s})
  const updAM=(k,f,v)=>upd(s=>{if(s.am[k])s.am[k][f]=v;return s})

  const signOut=()=>supabase.auth.signOut()
  const signIn=()=>supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}})

  const completeOnboarding=({name,avatar,missions})=>{
    const newState={...BLANK(),player:{n:name,av:avatar,t:''},missions}
    setG(newState)
    setOnboarding(false)
    save(newState)
  }

  // Post achievement story to community
  const postStory=async(type,title,body)=>{
    if(!session||!G)return
    const lv=getLv(G.xp),rank=getRank(lv)
    await supabase.from('stories').insert({
      user_id:session.user.id,
      username:G.player?.n||'Hunter',
      avatar:G.player?.av||'🧑‍💻',
      type,title,body,
      rank_label:rank.lbl,
      xp:G.xp||0,
      likes:0
    })
    notif('⚡ Achievement posted to community!','levelup')
  }

  if(loading)return<LoadingScreen/>
  if(!session)return<LoginScreen signIn={signIn}/>
  if(onboarding)return<OnboardingScreen session={session} onComplete={completeOnboarding}/>
  if(!G)return<LoadingScreen/>

  const lv=getLv(G.xp),rank=getRank(lv),title=getTitle(lv)
  const clx=getLvXP(lv),nlx=getLvXP(lv+1)
  const xpPct=nlx>clx?Math.min(100,((G.xp-clx)/(nlx-clx))*100):100

  return(
    <div style={{minHeight:'100vh',position:'relative',zIndex:1}}>
      {/* NOTIFS */}
      <div style={{position:'fixed',top:70,right:20,zIndex:9998,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none',maxWidth:300}}>
        {notifs.map(n=><Notif key={n.id} msg={n.msg} type={n.type}/>)}
      </div>
      {/* LEVEL UP */}
      {lvUpAnim&&<LevelUpOverlay data={lvUpAnim}/>}
      {/* NAV */}
      <NavBar G={G} page={page} setPage={setPage} lv={lv} rank={rank} setModal={setModal} signOut={signOut}/>
      {/* PAGES */}
      <div style={{maxWidth:1400,margin:'0 auto',padding:20}}>
        {page==='dashboard'&&<Dashboard G={G} lv={lv} rank={rank} title={title} xpPct={xpPct} toggleM={toggleM} setPage={setPage} setModal={setModal} goalTab={goalTab} setGoalTab={setGoalTab} incGoal={incGoal} delGoal={delGoal} toggleX={toggleX} delX={delX}/>}
        {page==='missions'&&<Missions G={G} toggleM={toggleM} delM={delM} setModal={setModal} endDay={endDay} toggleX={toggleX} addX={addX} delX={delX}/>}
        {page==='weekly'&&<Weekly G={G} goalTab={goalTab} setGoalTab={setGoalTab} incGoal={incGoal} delGoal={delGoal} toggleX={toggleX} addX={addX} delX={delX} setModal={setModal}/>}
        {page==='calendar'&&<Calendar G={G} calY={calY} calM={calM} setCalY={setCalY} setCalM={setCalM} setModal={setModal}/>}
        {page==='attributes'&&<Attributes G={G} updAM={updAM}/>}
        {page==='profile'&&<ProfilePage G={G} session={session} lv={lv} rank={rank} title={title} xpPct={xpPct} setModal={setModal}/>}
        {page==='community'&&<CommunityPage G={G} session={session} rank={rank} lv={lv}/>}
        {page==='leaderboard'&&<LeaderboardPage session={session}/>}
        {page==='friends'&&<FriendsPage G={G} session={session}/>}
        {page==='analytics'&&<AnalyticsPage G={G}/>}
        {page==='challenge'&&<ChallengePage G={G} session={session} notif={notif}/>}
      </div>
      {/* MODALS */}
      {modal&&<ModalHost modal={modal} setModal={setModal} G={G} addM={addM} addGoal={addGoal} addX={addX} updPlayer={updPlayer} buyShop={buyShop} addShopItem={addShopItem} delShopItem={delShopItem} endDay={endDay}/>}
    </div>
  )
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function LoginScreen({signIn}){
  return(
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">LIFE <span>RPG</span></div>
        <div className="login-tagline">The System is watching. Are you ready?</div>
        <div className="login-desc">Track your daily missions, build streaks, level up your real life. DORMANT → MONARCH. Your journey starts here.</div>
        <button className="google-btn" onClick={signIn}>
          <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <div className="login-note">Your data is saved to the cloud. Works on any device. Free forever.</div>
      </div>
    </div>
  )
}
function LoadingScreen(){
  return(
    <div className="loading-screen">
      <div className="loading-logo">⚡ LIFE RPG</div>
      <div className="loading-bar"><div className="loading-bar-fill"/></div>
    </div>
  )
}

// ── NOTIF ──────────────────────────────────────────────────────────────────
function Notif({msg,type}){
  const colors={xp:{bg:'rgba(124,58,237,0.95)',border:'#a855f7',color:'white'},penalty:{bg:'rgba(239,68,68,0.95)',border:'#ef4444',color:'white'},levelup:{bg:'rgba(245,158,11,0.97)',border:'#f59e0b',color:'black'},info:{bg:'rgba(6,182,212,0.95)',border:'#06b6d4',color:'white'}}
  const c=colors[type]||colors.info
  return<div style={{padding:'10px 14px',borderRadius:4,fontFamily:"'Share Tech Mono',monospace",fontSize:11,background:c.bg,borderLeft:`3px solid ${c.border}`,color:c.color,animation:'slideIn 0.3s ease',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>{msg}</div>
}

// ── LEVEL UP OVERLAY ───────────────────────────────────────────────────────
function LevelUpOverlay({data}){
  return(
    <div style={{position:'fixed',inset:0,zIndex:9996,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.9)',animation:'lvOverlay 3.5s ease forwards',pointerEvents:'none'}}>
      <div style={{textAlign:'center',animation:'lvPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards'}}>
        <div style={{fontSize:'3rem',marginBottom:8}}>⚡</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:'0.85rem',letterSpacing:4,color:'#64748b',textTransform:'uppercase',marginBottom:6}}>Level Up</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:'5rem',fontWeight:900,background:'linear-gradient(135deg,#f59e0b,#fff,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>{data.to}</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1.1rem',color:'#f59e0b',marginTop:8,letterSpacing:2}}>{data.rank.icon} {data.rank.lbl}</div>
        <div style={{fontSize:13,color:'#64748b',marginTop:6,fontStyle:'italic'}}>{data.title.split('—')[0].trim()}</div>
        <div style={{fontSize:12,color:'#10b981',marginTop:10,fontFamily:"'Share Tech Mono',monospace"}}>+50 BONUS GOLD AWARDED</div>
      </div>
    </div>
  )
}

// ── NAV ────────────────────────────────────────────────────────────────────
function NavBar({G,page,setPage,lv,rank,setModal,signOut}){
  const tabs=[
    {id:'dashboard',icon:'🏠',label:'Dashboard'},
    {id:'missions',icon:'⚔',label:'Missions'},
    {id:'weekly',icon:'📊',label:'Weekly'},
    {id:'calendar',icon:'📅',label:'Calendar'},
    {id:'attributes',icon:'⚡',label:'Attributes'},
    {id:'profile',icon:'👤',label:'Profile'},
    {id:'community',icon:'💬',label:'Community'},
    {id:'leaderboard',icon:'🏆',label:'Ranks'},
    {id:'friends',icon:'👥',label:'Friends'},
    {id:'analytics',icon:'📈',label:'Analytics'},
    {id:'challenge',icon:'🎯',label:'Challenge'},
  ]
  const [sideOpen,setSideOpen]=useState(false)
  const navTo=(id)=>{setPage(id);setSideOpen(false);}
  return(
    <>
      {/* SIDEBAR OVERLAY */}
      {sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:998,backdropFilter:'blur(2px)'}}/>}
      {/* SIDEBAR */}
      <div style={{position:'fixed',top:0,left:sideOpen?0:'-260px',width:250,height:'100vh',background:'#0a0a0f',borderRight:'1px solid #1e1e35',zIndex:999,transition:'left 0.3s cubic-bezier(0.4,0,0.2,1)',display:'flex',flexDirection:'column',overflowY:'auto'}}>
        <div style={{padding:'20px 16px',borderBottom:'1px solid #1e1e35',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1rem',fontWeight:900,background:'linear-gradient(135deg,#a855f7,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:2}}>LIFE <span style={{WebkitTextFillColor:'#f59e0b'}}>RPG</span></div>
          <button onClick={()=>setSideOpen(false)} style={{background:'none',border:'none',color:'#64748b',fontSize:'1.2rem',cursor:'pointer'}}>✕</button>
        </div>
        {/* Player mini card */}
        <div style={{padding:'12px 16px',borderBottom:'1px solid #1e1e35',display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:'1.8rem'}}>{G.player?.av||'🧑‍💻'}</div>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'0.8rem',fontWeight:700,color:'#e2e8f0'}}>{G.player?.n||'Hunter'}</div>
            <div style={{fontSize:10,color:'#64748b',marginTop:2}}>LV.{lv} · 🔥{G.streak} · 🥇{G.gold}</div>
          </div>
        </div>
        {/* Nav items */}
        <div style={{flex:1,padding:'8px 0'}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>navTo(t.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 20px',background:page===t.id?'rgba(124,58,237,0.15)':'none',border:'none',borderLeft:page===t.id?'3px solid #7c3aed':'3px solid transparent',color:page===t.id?'#a855f7':'#94a3b8',cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
              <span style={{fontSize:'1.1rem',width:24,textAlign:'center'}}>{t.icon}</span>
              <span style={{fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>{t.label}</span>
            </button>
          ))}
        </div>
        {/* Bottom actions */}
        <div style={{padding:'12px 16px',borderTop:'1px solid #1e1e35',display:'flex',gap:8}}>
          <button onClick={()=>{setModal({type:'shop'});setSideOpen(false)}} style={{flex:1,padding:'8px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:6,color:'#f59e0b',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:700}}>🏪 SHOP</button>
          <button onClick={signOut} style={{padding:'8px 12px',background:'none',border:'1px solid #1e1e35',borderRadius:6,color:'#64748b',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:700}}>OUT</button>
        </div>
      </div>
      {/* TOP NAV BAR */}
      <nav style={{position:'sticky',top:0,zIndex:500,background:'rgba(10,10,15,0.97)',borderBottom:'1px solid #1e1e35',backdropFilter:'blur(10px)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px'}}>
          {/* Hamburger */}
          <button onClick={()=>setSideOpen(true)} style={{background:'none',border:'1px solid #1e1e35',borderRadius:6,color:'#a855f7',padding:'6px 10px',cursor:'pointer',fontSize:'1rem',display:'flex',flexDirection:'column',gap:4,alignItems:'center',justifyContent:'center',width:38,height:38}}>
            <div style={{width:18,height:2,background:'#a855f7',borderRadius:1}}/>
            <div style={{width:18,height:2,background:'#a855f7',borderRadius:1}}/>
            <div style={{width:18,height:2,background:'#a855f7',borderRadius:1}}/>
          </button>
          {/* Logo + current page */}
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1rem',fontWeight:900,background:'linear-gradient(135deg,#a855f7,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:2}}>LIFE <span style={{WebkitTextFillColor:'#f59e0b'}}>RPG</span></div>
            <div style={{fontSize:10,color:'#334155',fontFamily:"'Rajdhani',sans-serif",fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{tabs.find(t=>t.id===page)?.icon} {tabs.find(t=>t.id===page)?.label}</div>
          </div>
          {/* Stats */}
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <NavStat val={lv} lbl="LV"/>
            <NavStat val={'🔥'+G.streak} lbl="STR"/>
            <NavStat val={G.gold} lbl="GOLD" color="#f59e0b"/>
          </div>
        </div>
      </nav>
    </>
  )
}
function NavStat({val,lbl,color='#f59e0b'}){
  return<div style={{textAlign:'center'}}><div style={{fontFamily:"'Orbitron',monospace",fontSize:'0.95rem',fontWeight:700,color}}>{val}</div><div style={{fontSize:8,textTransform:'uppercase',letterSpacing:2,color:'#64748b'}}>{lbl}</div></div>
}

// ── RANK BADGE ─────────────────────────────────────────────────────────────
const rankStyles={
  'rank-dormant':{background:'linear-gradient(135deg,#1a1a2e,#2d3748)',color:'#94a3b8',border:'1px solid #334155'},
  'rank-awakened':{background:'linear-gradient(135deg,#052e16,#166534)',color:'#86efac',border:'1px solid #166534',boxShadow:'0 0 8px rgba(22,101,52,0.5)'},
  'rank-initiate':{background:'linear-gradient(135deg,#0c1a3d,#1e40af)',color:'#93c5fd',border:'1px solid #1d4ed8',boxShadow:'0 0 10px rgba(29,78,216,0.5)'},
  'rank-challenger':{background:'linear-gradient(135deg,#083344,#0e7490)',color:'#67e8f9',border:'1px solid #0891b2',boxShadow:'0 0 12px rgba(8,145,178,0.6)'},
  'rank-enforcer':{background:'linear-gradient(135deg,#2e1065,#5b21b6)',color:'#c4b5fd',border:'1px solid #6d28d9',boxShadow:'0 0 14px rgba(109,40,217,0.7)'},
  'rank-phantom':{background:'linear-gradient(135deg,#4a0520,#9f1239)',color:'#fda4af',border:'1px solid #be123c',boxShadow:'0 0 14px rgba(159,18,57,0.7)'},
  'rank-warlord':{background:'linear-gradient(135deg,#431407,#9a3412)',color:'#fdba74',border:'1px solid #c2410c',boxShadow:'0 0 16px rgba(194,65,12,0.7)'},
  'rank-sovereign':{background:'linear-gradient(135deg,#451a03,#92400e)',color:'#fde68a',border:'1px solid #d97706',boxShadow:'0 0 18px rgba(217,119,6,0.8)'},
  'rank-transcendent':{background:'linear-gradient(135deg,#450a0a,#991b1b)',color:'#fca5a5',border:'1px solid #dc2626',boxShadow:'0 0 20px rgba(220,38,38,0.8)'},
  'rank-monarch':{background:'linear-gradient(135deg,#1a0533,#3b0764)',color:'#fef08a',border:'1px solid #a855f7',boxShadow:'0 0 24px rgba(168,85,247,0.8)'},
}
function RankBadge({rank}){
  const s=rankStyles[rank.cls]||{}
  return<span style={{...s,position:'relative',display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px 3px 8px',borderRadius:3,fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,fontFamily:"'Orbitron',monospace"}}><span style={{fontSize:11}}>{rank.icon}</span>{rank.lbl}</span>
}

// ── PANEL ──────────────────────────────────────────────────────────────────
function Panel({title,action,children,style={},topColor}){
  return(
    <div style={{background:'#0f0f1a',border:'1px solid #1e1e35',borderRadius:4,overflow:'hidden',...style}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid #1e1e35',display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(90deg,rgba(124,58,237,0.06),transparent)',borderTop:topColor?`2px solid ${topColor}`:undefined}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:3,color:'#a855f7',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:6,height:6,background:'#a855f7',borderRadius:'50%',display:'inline-block',boxShadow:'0 0 6px #a855f7'}}/>
          {title}
        </div>
        {action}
      </div>
      <div style={{padding:16}}>{children}</div>
    </div>
  )
}
function Btn({children,onClick,variant='primary',sm,style={}}){
  const base={padding:sm?'4px 10px':'8px 16px',border:'none',borderRadius:4,fontFamily:"'Rajdhani',sans-serif",fontSize:sm?11:13,fontWeight:700,letterSpacing:1,cursor:'pointer',textTransform:'uppercase',transition:'all 0.2s',...style}
  const variants={primary:{background:'#7c3aed',color:'white'},danger:{background:'rgba(239,68,68,0.2)',border:'1px solid #ef4444',color:'#ef4444'},gold:{background:'rgba(245,158,11,0.2)',border:'1px solid #f59e0b',color:'#f59e0b'},red:{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.4)',color:'#fca5a5'},purple:{background:'rgba(124,58,237,0.2)',border:'1px solid #7c3aed',color:'#a855f7'}}
  return<button onClick={onClick} style={{...base,...(variants[variant]||variants.primary)}}>{children}</button>
}
function Inp({placeholder,value,onChange,onKeyDown,type='text',style={}}){
  return<input type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown} style={{background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,padding:'8px 12px',color:'#e2e8f0',fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:500,outline:'none',width:'100%',...style}}/>
}
function Sel({value,onChange,children,style={}}){
  return<select value={value} onChange={onChange} style={{background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,padding:'8px 12px',color:'#e2e8f0',fontFamily:"'Rajdhani',sans-serif",fontSize:14,outline:'none',width:'100%',...style}}>{children}</select>
}

// ── MISSION ITEM ───────────────────────────────────────────────────────────
function MissionItem({m,onToggle,onDel,am}){
  const isS=m.tier==='S'
  const gain=Math.round(Math.min(m.xp,200)*(isS?1.5:1))
  const borderColor=m.done?'#10b981':isS?'#ef4444':'#f59e0b'
  return(
    <div onClick={onToggle} style={{display:'flex',alignItems:'center',gap:12,padding:12,background:'#13131f',border:'1px solid #1e1e35',borderLeft:`3px solid ${borderColor}`,borderRadius:4,marginBottom:8,cursor:'pointer',opacity:m.done?0.55:1,transition:'all 0.2s',position:'relative'}}>
      <div style={{width:24,height:24,border:`2px solid ${borderColor}`,borderRadius:2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,background:m.done?borderColor:'transparent'}}>{m.done?'✓':''}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:m.done?'#64748b':'#e2e8f0',textDecoration:m.done?'line-through':'none',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.n}</div>
        <div style={{fontSize:10,color:'#64748b',marginTop:1}}>{am[m.cat]?.n||m.cat} · {m.done?'COMPLETE':m.penalty>0?`-${m.penalty} XP if missed`:'No penalty'}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:3,alignItems:'flex-end'}}>
        <span style={{padding:'2px 8px',borderRadius:2,fontSize:11,fontFamily:"'Share Tech Mono',monospace",background:isS?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.1)',border:`1px solid ${isS?'rgba(239,68,68,0.35)':'rgba(245,158,11,0.3)'}`,color:isS?'#fca5a5':'#f59e0b'}}>+{gain} XP{isS?' (×1.5)':''}</span>
        {m.penalty>0&&!m.done&&<span style={{padding:'2px 8px',borderRadius:2,fontSize:11,fontFamily:"'Share Tech Mono',monospace",background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444'}}>-{m.penalty}</span>}
      </div>
      <button onClick={e=>{e.stopPropagation();onDel()}} style={{background:'none',border:'none',color:'#334155',cursor:'pointer',fontSize:13,padding:'2px 4px',marginLeft:2}}>✕</button>
    </div>
  )
}

// ── WEEK GRID ──────────────────────────────────────────────────────────────
function WeekGrid({G}){
  const DN=['SUN','MON','TUE','WED','THU','FRI','SAT']
  const now=new Date(),dy=now.getDay(),ws=new Date(now)
  ws.setDate(now.getDate()-dy);ws.setHours(0,0,0,0)
  const t=td()
  return(
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
      {Array.from({length:7},(_,i)=>{
        const d=new Date(ws);d.setDate(ws.getDate()+i)
        const ds=localDS(d),iT=ds===t,iF=ds>t
        const h=G.history[ds],p=h?h.pct:0
        const bg=iT?'rgba(124,58,237,0.1)':p>=1?'rgba(16,185,129,0.1)':p>=0.5?'rgba(245,158,11,0.07)':(!iF&&ds<t&&h)?'rgba(239,68,68,0.06)':'#13131f'
        const bc=iT?'#7c3aed':p>=1?'#10b981':p>=0.5?'rgba(245,158,11,0.4)':(!iF&&ds<t&&h)?'rgba(239,68,68,0.25)':'#1e1e35'
        return<div key={i} style={{aspectRatio:1,borderRadius:4,border:`1px solid ${bc}`,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',opacity:iF?0.3:1}}>
          <div style={{fontSize:8,textTransform:'uppercase',letterSpacing:1,color:'#64748b'}}>{DN[i]}</div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:'0.8rem',fontWeight:700,color:iT?'#a855f7':'#e2e8f0'}}>{d.getDate()}</div>
          {p>0&&!iF&&<div style={{fontSize:8,color:p>=1?'#10b981':'#f59e0b'}}>{Math.round(p*100)}%</div>}
        </div>
      })}
    </div>
  )
}

// ── BIG BARS ───────────────────────────────────────────────────────────────
function BigBars({G}){
  const DN=['SUN','MON','TUE','WED','THU','FRI','SAT']
  const now=new Date(),dy=now.getDay(),ws=new Date(now)
  ws.setDate(now.getDate()-dy);ws.setHours(0,0,0,0)
  const t=td()
  return(
    <div style={{display:'flex',alignItems:'flex-end',gap:6,height:150,padding:'4px 0'}}>
      {Array.from({length:7},(_,i)=>{
        const d=new Date(ws);d.setDate(ws.getDate()+i)
        const ds=localDS(d),iT=ds===t,iF=ds>t
        const h=G.history[ds],p=iF?0:(h?h.pct:0)
        const ht=Math.max(4,p*130)
        const bg=iF?'#1e1e35':iT?'linear-gradient(0deg,#7c3aed,#a855f7)':p>=0.8?'linear-gradient(0deg,#065f46,#10b981)':p>=0.4?'linear-gradient(0deg,#78350f,#f59e0b)':'linear-gradient(0deg,#7f1d1d,#ef4444)'
        return<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
          <div style={{fontSize:9,fontFamily:"'Share Tech Mono',monospace",color:'#64748b'}}>{p>0?Math.round(p*100)+'%':''}</div>
          <div style={{width:'100%',height:ht,background:bg,borderRadius:'3px 3px 0 0',minHeight:4,boxShadow:iT?'0 0 12px rgba(124,58,237,0.5)':undefined}}/>
          <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:1,color:'#64748b'}}>{DN[i][0]}</div>
        </div>
      })}
    </div>
  )
}

// ── GOALS ──────────────────────────────────────────────────────────────────
function GoalList({goals,type,incGoal,delGoal}){
  const fl=goals.filter(g=>g.type===type)
  if(!fl.length)return<div style={{fontSize:12,color:'#334155',padding:8,fontStyle:'italic'}}>No {type}-term goals yet.</div>
  return<>{fl.map(g=>{
    const p=Math.min(100,Math.round(g.prog/g.target*100))
    const col=type==='short'?'#06b6d4':'#a855f7'
    return<div key={g.id} style={{padding:12,background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',flex:1}}>{g.n}</div>
        <div style={{display:'flex',gap:6,alignItems:'center',marginLeft:8}}>
          <span style={{fontSize:9,padding:'2px 6px',borderRadius:2,textTransform:'uppercase',letterSpacing:1,fontWeight:700,background:`${col}22`,color:col,border:`1px solid ${col}44`}}>{type}</span>
          <button onClick={()=>delGoal(g.id)} style={{background:'none',border:'none',color:'#334155',cursor:'pointer',fontSize:12}}>✕</button>
        </div>
      </div>
      <div style={{height:6,background:'#1e1e35',borderRadius:3,overflow:'hidden',margin:'6px 0'}}>
        <div style={{height:'100%',width:`${p}%`,background:`linear-gradient(90deg,${col},${col}cc)`,borderRadius:3,transition:'width 0.6s ease'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#64748b'}}>
        <span>{g.prog} / {g.target}</span><span style={{fontFamily:"'Share Tech Mono',monospace",color:col}}>{p}%</span>
      </div>
      {p<100?<button onClick={()=>incGoal(g.id)} style={{marginTop:8,width:'100%',padding:'5px',background:'none',border:'1px solid #1e1e35',borderRadius:4,color:'#64748b',fontFamily:"'Rajdhani',sans-serif",fontSize:11,cursor:'pointer',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>+ LOG PROGRESS</button>:<div style={{textAlign:'center',marginTop:8,fontSize:12,color:'#10b981',fontFamily:"'Share Tech Mono',monospace"}}>✅ GOAL ACHIEVED</div>}
    </div>
  })}</>
}

// ── EXTRAS ─────────────────────────────────────────────────────────────────
function ExtraList({extras,toggleX,delX,addX}){
  const [inp,setInp]=useState('')
  const w=wkStr(),tw=extras.filter(e=>e.week===w)
  return<>
    <div style={{display:'flex',gap:8,marginBottom:12}}>
      <Inp placeholder="Add bonus task..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&inp.trim()){addX(inp.trim());setInp('')}}}/>
      <Btn onClick={()=>{if(inp.trim()){addX(inp.trim());setInp('')}}} sm>ADD</Btn>
    </div>
    {!tw.length&&<div style={{fontSize:12,color:'#334155',padding:8,fontStyle:'italic'}}>No bonus tasks yet.</div>}
    {tw.map(x=><div key={x.id} onClick={()=>toggleX(x.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,marginBottom:8,cursor:'pointer',opacity:x.done?0.5:1,transition:'all 0.2s'}}>
      <div style={{width:20,height:20,border:`1.5px solid ${x.done?'#06b6d4':'#0e7490'}`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0,background:x.done?'#06b6d4':'transparent'}}>{x.done?'✓':''}</div>
      <div style={{flex:1,fontSize:13,fontWeight:500,textDecoration:x.done?'line-through':'none',color:x.done?'#64748b':'#e2e8f0'}}>{x.n}</div>
      <span style={{padding:'2px 8px',borderRadius:2,fontSize:11,fontFamily:"'Share Tech Mono',monospace",background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#f59e0b'}}>+75 XP</span>
      <button onClick={e=>{e.stopPropagation();delX(x.id)}} style={{background:'none',border:'none',color:'#334155',cursor:'pointer',fontSize:13,padding:'2px 6px',marginLeft:4}}>✕</button>
    </div>)}
  </>
}

// ── RADAR ──────────────────────────────────────────────────────────────────
function Radar({G,W=240,H=210}){
  const ref=useRef()
  useEffect(()=>{
    if(!ref.current||!G)return
    const cv=ref.current,ctx=cv.getContext('2d'),cx=W/2,cy=H/2,r=Math.min(W,H)/2-32
    ctx.clearRect(0,0,W,H)
    const ks=Object.keys(G.am),n=ks.length
    for(let rr=1;rr<=5;rr++){const rv=(rr/5)*r;ctx.beginPath();for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2,x=cx+rv*Math.cos(a),y=cy+rv*Math.sin(a);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle='rgba(124,58,237,0.15)';ctx.lineWidth=1;ctx.stroke();}
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.strokeStyle='rgba(124,58,237,0.2)';ctx.lineWidth=1;ctx.stroke();}
    ctx.beginPath();ks.forEach((k,i)=>{const v=Math.min(100,G.attrs[k]||0)/100,a=(i/n)*Math.PI*2-Math.PI/2,x=cx+r*v*Math.cos(a),y=cy+r*v*Math.sin(a);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});ctx.closePath();ctx.fillStyle='rgba(124,58,237,0.2)';ctx.fill();ctx.strokeStyle='rgba(168,85,247,0.8)';ctx.lineWidth=2;ctx.stroke();
    ks.forEach((k,i)=>{const m=G.am[k],v=Math.min(100,G.attrs[k]||0)/100,a=(i/n)*Math.PI*2-Math.PI/2,x=cx+r*v*Math.cos(a),y=cy+r*v*Math.sin(a);ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=m.c||'#7c3aed';ctx.fill();const lx=cx+(r+18)*Math.cos(a),ly=cy+(r+18)*Math.sin(a);ctx.font='bold 10px Rajdhani';ctx.fillStyle=m.c||'#7c3aed';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText((m.n||k).slice(0,3).toUpperCase(),lx,ly);});
  },[G,W,H])
  return<canvas ref={ref} width={W} height={H} style={{display:'block',margin:'0 auto'}}/>
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function Dashboard({G,lv,rank,title,xpPct,toggleM,setPage,setModal,goalTab,setGoalTab,incGoal,delGoal,toggleX,delX}){
  const ms=G.missions,dn=ms.filter(m=>m.done),pct=ms.length?Math.round(dn.length/ms.length*100):0
  const pending=ms.filter(m=>!m.done&&!m.pen&&m.penalty>0)
  const msgs=[`${pct}% of today's missions complete.`,G.streak>0?`${G.streak} day streak active. Keep it.`:'Build your streak. Consistency = power.',`Level ${lv} · Rank ${rank.lbl}`,'THE SYSTEM OBSERVES. Complete your missions.']
  const [msgIdx,setMsgIdx]=useState(0)
  useEffect(()=>{const t=setInterval(()=>setMsgIdx(i=>(i+1)%msgs.length),5000);return()=>clearInterval(t)},[G.xp,G.streak])
  return(
    <div>
      {/* PLAYER CARD */}
      <div style={{background:'#0f0f1a',border:'1px solid #1e1e35',borderRadius:4,padding:20,position:'relative',overflow:'hidden',marginBottom:20}}>
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#7c3aed,#06b6d4,#7c3aed)',backgroundSize:'200% 100%'}}/>
        <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:20,alignItems:'start'}}>
          <div onClick={()=>setModal({type:'player'})} style={{width:80,height:80,borderRadius:4,background:'linear-gradient(135deg,#1a0a3e,#0a1a3e)',border:'2px solid #7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',cursor:'pointer',boxShadow:'0 0 20px rgba(124,58,237,0.4)'}}>
            {G.player.av}
          </div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:4}}>
              <div onClick={()=>setModal({type:'player'})} style={{fontFamily:"'Orbitron',monospace",fontSize:'1.4rem',fontWeight:700,color:'#e2e8f0',cursor:'pointer'}}>{G.player.n}</div>
              <RankBadge rank={rank}/>
            </div>
            <div style={{fontSize:13,color:'#a855f7',marginBottom:10,fontStyle:'italic'}}>{G.player.t||title}</div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,color:'#64748b',textTransform:'uppercase',letterSpacing:1}}>Level {lv}</span>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#a855f7'}}>{G.xp} / {getLvXP(lv+1)} XP</span>
              </div>
              <div style={{height:8,background:'#13131f',border:'1px solid #1e1e35',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${xpPct}%`,background:'linear-gradient(90deg,#7c3aed,#a855f7)',borderRadius:2,boxShadow:'0 0 8px #7c3aed',transition:'width 0.8s'}}/>
              </div>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <Btn onClick={()=>setModal({type:'shop'})} variant="gold" sm>🏪 SHOP</Btn>
            <div style={{fontSize:10,color:'#64748b',marginTop:8,fontFamily:"'Share Tech Mono',monospace"}}>Today<br/><span style={{color:'#06b6d4',fontSize:'1rem',fontWeight:700}}>{pct}%</span></div>
          </div>
        </div>
        {/* ATTR GRID */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginTop:16,paddingTop:16,borderTop:'1px solid #1e1e35'}}>
          {Object.keys(G.am).map(k=>{
            const m=G.am[k],v=Math.round((G.attrs[k]||0)*10)/10,p=Math.min(100,G.attrs[k]||0)
            return<div key={k} onClick={()=>setPage('attributes')} style={{textAlign:'center',padding:'10px 6px',background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,cursor:'pointer'}}>
              <div style={{fontSize:'1.1rem'}}>{m.e}</div>
              <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:3,color:'#e2e8f0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.n}</div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1.1rem',fontWeight:700,color:m.c}}>{v}</div>
              <div style={{height:3,background:'#1e1e35',borderRadius:1,marginTop:4,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:m.c,boxShadow:`0 0 4px ${m.c}`}}/></div>
            </div>
          })}
        </div>
      </div>
      {/* MAIN GRID */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 320px',gap:16,marginBottom:20}}>
        <Panel title="Today's Missions" action={<div style={{display:'flex',gap:6,alignItems:'center'}}><span style={{fontSize:11,color:'#64748b',fontFamily:"'Share Tech Mono',monospace"}}>{dn.length}/{ms.length}</span><Btn sm onClick={()=>setPage('missions')}>VIEW ALL</Btn></div>}>
          {ms.length?ms.slice(0,5).map(m=><MissionItem key={m.id} m={m} am={G.am} onToggle={()=>toggleM(m.id)} onDel={()=>{}}/>):<div style={{textAlign:'center',padding:16,color:'#334155',fontSize:13,fontStyle:'italic'}}>No missions. <span onClick={()=>setPage('missions')} style={{color:'#7c3aed',cursor:'pointer'}}>→ Add some</span></div>}
          {ms.length>5&&<div onClick={()=>setPage('missions')} style={{textAlign:'center',padding:8,fontSize:12,color:'#64748b',cursor:'pointer'}}>+{ms.length-5} more →</div>}
        </Panel>
        <Panel title="This Week" action={<span style={{fontSize:10,color:'#64748b'}}/>}>
          <WeekGrid G={G}/>
          <div style={{height:1,background:'#1e1e35',margin:'12px 0'}}/>
          <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:2,color:'#64748b',marginBottom:8}}>Daily Performance</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:4,height:55}}>
            {Array.from({length:7},(_,i)=>{
              const now=new Date(),dy=now.getDay(),ws=new Date(now);ws.setDate(now.getDate()-dy);ws.setHours(0,0,0,0)
              const d=new Date(ws);d.setDate(ws.getDate()+i)
              const ds=localDS(d),iT=ds===td(),iF=ds>td()
              const h=G.history[ds],p=iF?0:(h?h.pct:0)
              const ht=Math.max(3,p*47)
              const bg=iF?'#1e1e35':iT?'linear-gradient(0deg,#7c3aed,#a855f7)':p>=0.8?'linear-gradient(0deg,#065f46,#10b981)':p>=0.4?'linear-gradient(0deg,#78350f,#f59e0b)':'linear-gradient(0deg,#7f1d1d,#ef4444)'
              return<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{width:'100%',height:ht,background:bg,borderRadius:'2px 2px 0 0',minHeight:3}}/></div>
            })}
          </div>
        </Panel>
        <Panel title="The System" action={<span style={{fontSize:10,color:'#a855f7',fontFamily:"'Share Tech Mono',monospace"}}>⚡ ONLINE</span>}>
          {/* STREAK */}
          <div style={{textAlign:'center',padding:16,marginBottom:12,border:'1px solid #1e1e35',borderRadius:4,background:'#13131f',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at center,rgba(245,158,11,0.07),transparent 70%)',pointerEvents:'none'}}/>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'2.8rem',fontWeight:900,color:'#f59e0b',textShadow:'0 0 20px rgba(245,158,11,0.5)',lineHeight:1}}>{G.streak}</div>
            <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:2,color:'#64748b',marginTop:4}}>🔥 Day Streak</div>
            <div style={{fontSize:10,color:'#334155',marginTop:2,fontFamily:"'Share Tech Mono',monospace"}}>Best: {G.best} days</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
            <div style={{padding:12,background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,textAlign:'center'}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1.2rem',fontWeight:700,color:'#f59e0b'}}>{G.txp||0}</div>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.5,color:'#64748b',marginTop:2}}>⚡ Total XP</div>
            </div>
            <div onClick={()=>setModal({type:'shop'})} style={{padding:12,background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,textAlign:'center',cursor:'pointer'}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1.2rem',fontWeight:700,color:'#f59e0b'}}>{G.gold}</div>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:1.5,color:'#64748b',marginTop:2}}>🥇 Gold</div>
            </div>
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,lineHeight:1.8,color:'#06b6d4',padding:12,background:'rgba(6,182,212,0.05)',border:'1px solid rgba(6,182,212,0.15)',borderRadius:4,marginBottom:12}}>{msgs[msgIdx]}</div>
          {pending.length>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#ef4444',padding:12,background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:4,marginBottom:8}}>⚠ {pending.length} missions · -{pending.reduce((s,m)=>s+m.penalty,0)} XP pending</div>}
          <Btn variant="danger" onClick={()=>{const ms=G.missions.filter(m=>!m.done&&!m.pen&&m.penalty>0);if(!ms.length){alert('No penalties!');return;}setModal({type:'endday'})}} style={{width:'100%',marginTop:4}}>⚠ CLOSE DAY</Btn>
        </Panel>
      </div>
      {/* BOTTOM */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        <Panel title="Short-Term Goals" action={<Btn sm onClick={()=>setModal({type:'goal'})}>+ ADD</Btn>}>
          <GoalList goals={G.goals} type="short" incGoal={incGoal} delGoal={delGoal}/>
        </Panel>
        <Panel title="Long-Term Goals" action={<Btn sm onClick={()=>setModal({type:'goal',defaultType:'long'})}>+ ADD</Btn>}>
          <GoalList goals={G.goals} type="long" incGoal={incGoal} delGoal={delGoal}/>
        </Panel>
        <Panel title="Attributes" action={<Btn sm onClick={()=>setPage('attributes')}>CUSTOMIZE</Btn>}>
          <Radar G={G}/>
        </Panel>
      </div>
    </div>
  )
}

// ── MISSIONS PAGE ──────────────────────────────────────────────────────────
function Missions({G,toggleM,delM,setModal,endDay,toggleX,addX,delX}){
  const pending=G.missions.filter(m=>!m.done&&!m.pen&&m.penalty>0)
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16}}>
      <div>
        <Panel title="S-Tier — Critical Missions" topColor="#ef4444" style={{marginBottom:16}}
          action={<div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:9,color:'#fca5a5',fontFamily:"'Share Tech Mono',monospace"}}>×1.5 XP · HIGH STAKES</span><Btn sm variant="red" onClick={()=>setModal({type:'mission',tier:'S'})}>+ ADD S-TIER</Btn></div>}>
          {G.missions.filter(m=>m.tier==='S').length?G.missions.filter(m=>m.tier==='S').map(m=><MissionItem key={m.id} m={m} am={G.am} onToggle={()=>toggleM(m.id)} onDel={()=>delM(m.id)}/>):<div style={{textAlign:'center',padding:20,color:'#334155',fontSize:13,fontStyle:'italic'}}>No S-tier missions. <span onClick={()=>setModal({type:'mission',tier:'S'})} style={{color:'#ef4444',cursor:'pointer'}}>+ Add one</span></div>}
        </Panel>
        <Panel title="A-Tier — Daily Habits" topColor="#f59e0b"
          action={<div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:9,color:'#f59e0b',fontFamily:"'Share Tech Mono',monospace"}}>STANDARD MISSIONS</span><Btn sm onClick={()=>setModal({type:'mission',tier:'A'})}>+ ADD A-TIER</Btn></div>}>
          {G.missions.filter(m=>m.tier==='A').length?G.missions.filter(m=>m.tier==='A').map(m=><MissionItem key={m.id} m={m} am={G.am} onToggle={()=>toggleM(m.id)} onDel={()=>delM(m.id)}/>):<div style={{textAlign:'center',padding:20,color:'#334155',fontSize:13,fontStyle:'italic'}}>No A-tier missions. <span onClick={()=>setModal({type:'mission',tier:'A'})} style={{color:'#f59e0b',cursor:'pointer'}}>+ Add one</span></div>}
        </Panel>
      </div>
      <div>
        <Panel title="Status" style={{marginBottom:16}}>
          <div style={{textAlign:'center',padding:16,marginBottom:12,border:'1px solid #1e1e35',borderRadius:4,background:'#13131f'}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'2.8rem',fontWeight:900,color:'#f59e0b',lineHeight:1}}>{G.streak}</div>
            <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:2,color:'#64748b',marginTop:4}}>🔥 Day Streak</div>
            <div style={{fontSize:10,color:'#334155',marginTop:2}}>Best: {G.best}</div>
          </div>
          {pending.length>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#ef4444',padding:12,background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:4,marginBottom:8}}>⚠ {pending.length} missions · -{pending.reduce((s,m)=>s+m.penalty,0)} XP if closed</div>}
          <Btn variant="danger" onClick={endDay} style={{width:'100%'}}>⚠ CLOSE DAY</Btn>
        </Panel>
        <Panel title="Weekly Bonus Tasks" action={<span/>}>
          <ExtraList extras={G.extras} toggleX={toggleX} delX={delX} addX={addX}/>
        </Panel>
      </div>
    </div>
  )
}

// ── WEEKLY PAGE ────────────────────────────────────────────────────────────
function Weekly({G,goalTab,setGoalTab,incGoal,delGoal,toggleX,addX,delX,setModal}){
  const now=new Date(),dy=now.getDay(),ws=new Date(now)
  ws.setDate(now.getDate()-dy);ws.setHours(0,0,0,0)
  const wms=G.missions,wd=wms.filter(m=>m.done)
  const wp=wms.length?Math.round(wd.length/wms.length*100):0
  const pdays=Array.from({length:7},(_,i)=>{const d=new Date(ws);d.setDate(ws.getDate()+i);const h=G.history[localDS(d)];return h&&h.pct>=1?1:0}).reduce((a,b)=>a+b,0)
  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[{v:G.streak+'🔥',l:'Current Streak',c:'#f59e0b'},{v:wp+'%',l:'Week Completion',c:'#06b6d4'},{v:pdays,l:'Perfect Days',c:'#10b981'},{v:G.best,l:'Best Streak',c:'#a855f7'}].map((s,i)=>(
          <div key={i} style={{background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,padding:12,textAlign:'center'}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1.3rem',fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:1.5,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <Panel title="This Week — Daily Completion">
          <WeekGrid G={G}/>
          <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:2,color:'#64748b',margin:'12px 0 4px'}}>Bar Chart</div>
          <BigBars G={G}/>
        </Panel>
        <Panel title="Attribute Growth">
          {Object.keys(G.am).map(k=>{
            const m=G.am[k],v=Math.round((G.attrs[k]||0)*10)/10,p=Math.min(100,G.attrs[k]||0)
            return<div key={k} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,color:'#e2e8f0'}}>{m.e} {m.n}</span><span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:m.c}}>{v}</span></div>
              <div style={{height:6,background:'#1e1e35',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:m.c,borderRadius:3,boxShadow:`0 0 6px ${m.c}`,transition:'width 0.8s'}}/></div>
            </div>
          })}
        </Panel>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <Panel title="Goals" action={<Btn sm onClick={()=>setModal({type:'goal'})}>+ ADD</Btn>}>
          <div style={{display:'flex',gap:4,marginBottom:12,borderBottom:'1px solid #1e1e35',paddingBottom:8}}>
            {['short','long'].map((t,i)=><button key={t} onClick={()=>setGoalTab(p=>({...p,w:t}))} style={{padding:'4px 12px',background:goalTab.w===t?'rgba(124,58,237,0.15)':'none',border:goalTab.w===t?'1px solid #7c3aed':'1px solid transparent',borderRadius:2,color:goalTab.w===t?'#a855f7':'#64748b',fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1,cursor:'pointer'}}>{t==='short'?'Short-Term':'Long-Term'}</button>)}
          </div>
          <GoalList goals={G.goals} type={goalTab.w} incGoal={incGoal} delGoal={delGoal}/>
        </Panel>
        <Panel title="Bonus Tasks">
          <ExtraList extras={G.extras} toggleX={toggleX} delX={delX} addX={addX}/>
        </Panel>
      </div>
    </div>
  )
}

// ── CALENDAR ───────────────────────────────────────────────────────────────
function Calendar({G,calY,calM,setCalY,setCalM,setModal}){
  const MN=['January','February','March','April','May','June','July','August','September','October','November','December']
  const DN=['SUN','MON','TUE','WED','THU','FRI','SAT']
  const fd=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate()
  const t=td()
  const nav=(d)=>{let m=calM+d,y=calY;if(m>11){m=0;y++;}if(m<0){m=11;y--;}setCalM(m);setCalY(y);}
  return(
    <Panel title={`${MN[calM]} ${calY}`} action={<div style={{display:'flex',gap:8}}><button onClick={()=>nav(-1)} style={{background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,padding:'6px 12px',color:'#e2e8f0',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:13}}>← PREV</button><button onClick={()=>nav(1)} style={{background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,padding:'6px 12px',color:'#e2e8f0',cursor:'pointer',fontFamily:"'Rajdhani',sans-serif",fontSize:13}}>NEXT →</button></div>}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:6}}>
        {DN.map(d=><div key={d} style={{textAlign:'center',fontSize:9,textTransform:'uppercase',letterSpacing:1.5,color:'#64748b',padding:'6px 0',fontWeight:700}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
        {Array.from({length:fd},(_,i)=><div key={'e'+i}/>)}
        {Array.from({length:dim},(_,i)=>{
          const d=i+1
          const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const isTod=ds===t,isFut=ds>t
          const h=G.history[ds],p=h?h.pct:0
          const bg=isFut?'transparent':isTod?'rgba(124,58,237,0.1)':p>=1?'rgba(16,185,129,0.1)':p>=0.5?'rgba(245,158,11,0.07)':h?'rgba(239,68,68,0.06)':'#13131f'
          const bc=isFut?'transparent':isTod?'#7c3aed':p>=1?'rgba(16,185,129,0.4)':p>=0.5?'rgba(245,158,11,0.3)':h?'rgba(239,68,68,0.2)':'#1e1e35'
          const col=p>=1?'#10b981':p>=0.5?'#f59e0b':'#ef4444'
          return<div key={d} onClick={()=>!isFut&&h&&setModal({type:'dayreport',ds,h})} style={{minHeight:70,background:bg,border:`1px solid ${bc}`,borderRadius:4,padding:6,cursor:!isFut&&h?'pointer':'default',opacity:isFut?0.3:1,transition:'all 0.2s'}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'0.75rem',fontWeight:700,color:isTod?'#a855f7':'#64748b'}}>{d}</div>
            {h&&!isFut&&<><div style={{fontSize:10,fontFamily:"'Share Tech Mono',monospace",color:col,marginTop:3}}>{Math.round(p*100)}%</div><div style={{fontSize:9,color:'#334155',marginTop:2}}>{h.d||0}/{h.m||0} done</div></>}
          </div>
        })}
      </div>
      <div style={{display:'flex',gap:16,marginTop:12,flexWrap:'wrap'}}>
        {[{col:'rgba(16,185,129,0.15)',bc:'rgba(16,185,129,0.4)',lbl:'Perfect (100%)'},{col:'rgba(245,158,11,0.07)',bc:'rgba(245,158,11,0.3)',lbl:'Partial (≥50%)'},{col:'rgba(239,68,68,0.06)',bc:'rgba(239,68,68,0.2)',lbl:'Missed'},{col:'rgba(124,58,237,0.1)',bc:'#7c3aed',lbl:'Today'}].map(x=>(
          <div key={x.lbl} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#64748b'}}><div style={{width:12,height:12,background:x.col,border:`1px solid ${x.bc}`,borderRadius:2}}/>{x.lbl}</div>
        ))}
      </div>
    </Panel>
  )
}

// ── ATTRIBUTES PAGE ────────────────────────────────────────────────────────
function Attributes({G,updAM}){
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
      <Panel title="Customize Attributes" action={<span style={{fontSize:10,color:'#64748b'}}>Click name to edit</span>}>
        {Object.keys(G.am).map(k=>{
          const m=G.am[k],v=Math.round((G.attrs[k]||0)*10)/10,p=Math.min(100,G.attrs[k]||0)
          return<div key={k} style={{display:'flex',alignItems:'center',gap:14,padding:14,background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,marginBottom:10}}>
            <div style={{width:40,height:40,borderRadius:8,background:`${m.c}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0}}>{m.e}</div>
            <div style={{flex:1,minWidth:0}}>
              <input value={m.n} onChange={e=>updAM(k,'n',e.target.value)} style={{background:'none',border:'none',borderBottom:'1px solid #1e1e35',color:'#e2e8f0',fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:700,outline:'none',width:'100%',padding:'2px 4px'}}/>
              <input value={m.d||''} onChange={e=>updAM(k,'d',e.target.value)} style={{background:'none',border:'none',borderBottom:'1px solid #1e1e35',color:'#64748b',fontFamily:"'Rajdhani',sans-serif",fontSize:11,outline:'none',width:'100%',padding:'1px 4px',marginTop:4}}/>
              <div style={{height:5,background:'#1e1e35',borderRadius:2,marginTop:6,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:m.c,boxShadow:`0 0 6px ${m.c}`,transition:'width 0.8s'}}/></div>
              <div style={{fontSize:9,color:'#334155',marginTop:3}}>{G.missions.filter(x=>x.cat===k).length} mission(s) linked</div>
            </div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:'1.6rem',fontWeight:900,color:m.c,minWidth:48,textAlign:'right'}}>{v}</div>
          </div>
        })}
      </Panel>
      <div>
        <Panel style={{marginBottom:16}} title="Radar Chart">
          <Radar G={G} W={300} H={270}/>
        </Panel>
        <Panel title="How Attributes Grow">
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,lineHeight:1.8,color:'#06b6d4',padding:12,background:'rgba(6,182,212,0.05)',border:'1px solid rgba(6,182,212,0.15)',borderRadius:4}}>
            Complete missions to grow attributes.<br/><br/>
            S-Tier mission: +0.5 pts<br/>
            A-Tier mission: +0.3 pts<br/>
            Bonus task: +0.2 pts (Discipline)<br/><br/>
            Rename any attribute to match your life.<br/>Max: 100 pts.
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ── MODAL HOST ─────────────────────────────────────────────────────────────
function ModalHost({modal,setModal,G,addM,addGoal,addX,updPlayer,buyShop,addShopItem,delShopItem,endDay}){
  const close=()=>setModal(null)
  const overlay={position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9990,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}
  const card={background:'#0f0f1a',border:'1px solid #7c3aed',borderRadius:8,padding:28,width:'90%',maxWidth:480,boxShadow:'0 0 40px rgba(124,58,237,0.3)',maxHeight:'90vh',overflowY:'auto'}
  const mh2={fontFamily:"'Orbitron',monospace",fontSize:'0.95rem',color:'#a855f7',marginBottom:20,textTransform:'uppercase',letterSpacing:2}
  const row={marginBottom:14}
  const lbl={fontSize:11,textTransform:'uppercase',letterSpacing:1.5,color:'#64748b',marginBottom:6,display:'block'}

  if(modal.type==='mission')return<MissionModal close={close} G={G} addM={addM} defaultTier={modal.tier} overlay={overlay} card={card} mh2={mh2} row={row} lbl={lbl}/>
  if(modal.type==='goal')return<GoalModal close={close} addGoal={addGoal} defaultType={modal.defaultType} overlay={overlay} card={card} mh2={mh2} row={row} lbl={lbl}/>
  if(modal.type==='player')return<PlayerModal close={close} G={G} updPlayer={updPlayer} overlay={overlay} card={card} mh2={mh2} row={row} lbl={lbl}/>
  if(modal.type==='shop')return<ShopModal close={close} G={G} buyShop={buyShop} addShopItem={addShopItem} delShopItem={delShopItem} overlay={overlay} card={{...card,maxWidth:560}} mh2={mh2}/>
  if(modal.type==='endday')return<EndDayModal close={close} endDay={endDay} G={G} overlay={overlay} card={card} mh2={mh2}/>
  if(modal.type==='dayreport')return<DayReportModal close={close} data={modal} overlay={overlay} card={card} mh2={mh2}/>
  return null
}

function MissionModal({close,G,addM,defaultTier,overlay,card,mh2,row,lbl}){
  const [n,setN]=useState('');const [tier,setTier]=useState(defaultTier||'A');const [cat,setCat]=useState('physical');const [xp,setXp]=useState(tier==='S'?100:50);const [pen,setPen]=useState(tier==='S'?50:10)
  const submit=()=>{if(!n.trim())return;addM({n:n.trim(),tier,cat,xp:parseInt(xp),penalty:parseInt(pen)});close();}
  return<div style={overlay} onClick={e=>{if(e.target===e.currentTarget)close()}}>
    <div style={card}><div style={mh2}>⚔ New Mission</div>
      <div style={row}><span style={lbl}>Mission Name</span><Inp placeholder="Enter mission name..." value={n} onChange={e=>setN(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
      <div style={row}><span style={lbl}>Tier</span><Sel value={tier} onChange={e=>setTier(e.target.value)}><option value="S">🔴 S-Tier — Critical (×1.5 XP)</option><option value="A">🟡 A-Tier — Standard daily habit</option></Sel></div>
      <div style={row}><span style={lbl}>Attribute</span><Sel value={cat} onChange={e=>setCat(e.target.value)}>{Object.keys(G.am).map(k=><option key={k} value={k}>{G.am[k].e} {G.am[k].n}</option>)}</Sel></div>
      <div style={row}><span style={lbl}>Base XP</span><Sel value={xp} onChange={e=>setXp(e.target.value)}><option value="25">25 XP — Quick</option><option value="50">50 XP — Standard</option><option value="100">100 XP — Hard</option><option value="200">200 XP — Max</option></Sel></div>
      <div style={row}><span style={lbl}>Penalty if Missed</span><Sel value={pen} onChange={e=>setPen(e.target.value)}><option value="0">No penalty</option><option value="10">-10 XP</option><option value="25">-25 XP</option><option value="50">-50 XP</option><option value="100">-100 XP</option></Sel></div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><Btn variant="danger" onClick={close}>CANCEL</Btn><Btn onClick={submit}>CONFIRM</Btn></div>
    </div>
  </div>
}

function GoalModal({close,addGoal,defaultType,overlay,card,mh2,row,lbl}){
  const [n,setN]=useState('');const [type,setType]=useState(defaultType||'short');const [target,setTarget]=useState(10)
  const submit=()=>{if(!n.trim())return;addGoal({n:n.trim(),type,target:parseInt(target)||10});close();}
  return<div style={overlay} onClick={e=>{if(e.target===e.currentTarget)close()}}>
    <div style={card}><div style={mh2}>🎯 New Goal</div>
      <div style={row}><span style={lbl}>Goal Name</span><Inp placeholder="What do you want to achieve?" value={n} onChange={e=>setN(e.target.value)}/></div>
      <div style={row}><span style={lbl}>Timeline</span><Sel value={type} onChange={e=>setType(e.target.value)}><option value="short">Short-term (1–4 weeks)</option><option value="long">Long-term (1–12 months)</option></Sel></div>
      <div style={row}><span style={lbl}>Target Steps</span><Inp type="number" value={target} onChange={e=>setTarget(e.target.value)}/></div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><Btn variant="danger" onClick={close}>CANCEL</Btn><Btn onClick={submit}>SET GOAL</Btn></div>
    </div>
  </div>
}

function PlayerModal({close,G,updPlayer,overlay,card,mh2,row,lbl}){
  const [n,setN]=useState(G.player.n);const [t,setT]=useState(G.player.t||'');const [av,setAv]=useState(G.player.av)
  const submit=()=>{updPlayer({n:n.trim()||G.player.n,t:t.trim(),av});close();}
  return<div style={overlay} onClick={e=>{if(e.target===e.currentTarget)close()}}>
    <div style={card}><div style={mh2}>✎ Edit Player</div>
      <div style={row}><span style={lbl}>Name</span><Inp placeholder="Your name..." value={n} onChange={e=>setN(e.target.value)}/></div>
      <div style={row}><span style={lbl}>Title</span><Inp placeholder="Your title..." value={t} onChange={e=>setT(e.target.value)}/></div>
      <div style={row}><span style={lbl}>Avatar</span><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>{AVTS.map(a=><button key={a} onClick={()=>setAv(a)} style={{background:a===av?'rgba(124,58,237,0.3)':'#13131f',border:`1px solid ${a===av?'#7c3aed':'#1e1e35'}`,borderRadius:4,padding:'4px 8px',fontSize:'1.2rem',cursor:'pointer'}}>{a}</button>)}</div></div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}><Btn variant="danger" onClick={close}>CANCEL</Btn><Btn onClick={submit}>SAVE</Btn></div>
    </div>
  </div>
}

function ShopModal({close,G,buyShop,addShopItem,delShopItem,overlay,card,mh2}){
  const [addingCustom,setAddingCustom]=useState(false)
  const [ce,setCe]=useState('🎁');const [cn,setCn]=useState('');const [cd,setCd]=useState('');const [cc,setCc]=useState(50)
  const rewards=G.shop.filter(i=>!i.badge),badges=G.shop.filter(i=>i.badge)
  const ShopItem=({i})=><div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:i.badge?'rgba(124,58,237,0.05)':'#13131f',border:`1px solid ${i.badge?'rgba(124,58,237,0.35)':'#1e1e35'}`,borderRadius:4,marginBottom:8}}>
    <div style={{fontSize:'1.5rem',width:34,textAlign:'center'}}>{i.e}</div>
    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{i.n}</div><div style={{fontSize:10,color:'#64748b',marginTop:2,fontStyle:i.badge?'italic':'normal'}}>{i.d}</div></div>
    <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:i.badge?'#a855f7':'#f59e0b'}}>🥇 {i.c}</div>
      <Btn sm variant={i.badge?'purple':'gold'} onClick={()=>buyShop(i.id)}>{i.badge?'CLAIM':'BUY'}</Btn>
      {i.custom&&<Btn sm variant="danger" onClick={()=>delShopItem(i.id)}>✕</Btn>}
    </div>
  </div>
  return<div style={overlay} onClick={e=>{if(e.target===e.currentTarget)close()}}>
    <div style={card}><div style={mh2}>🏪 Reward Shop</div>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#06b6d4',padding:12,background:'rgba(6,182,212,0.05)',border:'1px solid rgba(6,182,212,0.15)',borderRadius:4,marginBottom:12}}>Gold carries over forever. Balance: <span style={{color:'#f59e0b',fontSize:'1.1em'}}>{G.gold}</span> 🥇</div>
      {!addingCustom&&<Btn sm variant="gold" onClick={()=>setAddingCustom(true)} style={{marginBottom:12}}>+ Add Custom Reward</Btn>}
      {addingCustom&&<div style={{padding:12,background:'#13131f',border:'1px solid #1e1e35',borderRadius:4,marginBottom:12}}>
        <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:8,marginBottom:8}}><Inp placeholder="🎁" value={ce} onChange={e=>setCe(e.target.value)}/><Inp placeholder="Reward name" value={cn} onChange={e=>setCn(e.target.value)}/></div>
        <Inp placeholder="Description" value={cd} onChange={e=>setCd(e.target.value)} style={{marginBottom:8}}/>
        <div style={{display:'flex',gap:8,alignItems:'center'}}><Inp type="number" value={cc} onChange={e=>setCc(e.target.value)} style={{width:100}}/><span style={{fontSize:11,color:'#64748b'}}>gold cost</span><Btn sm onClick={()=>{if(!cn.trim())return;addShopItem({e:ce||'🎁',n:cn.trim(),d:cd.trim(),c:parseInt(cc)||50});setCn('');setCd('');setCc(50);setAddingCustom(false)}}>ADD</Btn><Btn sm variant="danger" onClick={()=>setAddingCustom(false)}>CANCEL</Btn></div>
      </div>}
      <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:2,color:'#f59e0b',marginBottom:8,paddingBottom:5,borderBottom:'1px solid rgba(245,158,11,0.2)'}}>🎁 Real-Life Rewards</div>
      {rewards.map(i=><ShopItem key={i.id} i={i}/>)}
      <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:2,color:'#a855f7',margin:'16px 0 8px',paddingBottom:5,borderBottom:'1px solid rgba(124,58,237,0.2)'}}>🏅 Funny Badges — Collect Them All</div>
      {badges.map(i=><ShopItem key={i.id} i={i}/>)}
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}><Btn variant="danger" onClick={close}>CLOSE</Btn></div>
    </div>
  </div>
}

function EndDayModal({close,endDay,G,overlay,card,mh2}){
  const pending=G.missions.filter(m=>!m.done&&!m.pen&&m.penalty>0)
  return<div style={overlay} onClick={e=>{if(e.target===e.currentTarget)close()}}>
    <div style={card}><div style={mh2}>⚠ Close Day</div>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:12,color:'#ef4444',padding:12,background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:4,marginBottom:16,lineHeight:1.7}}>
        {pending.length} missed mission(s) will incur penalties:<br/>
        {pending.map(m=><span key={m.id} style={{display:'block',marginTop:4}}>• {m.n}: -{m.penalty} XP</span>)}
        <span style={{display:'block',marginTop:8,fontWeight:700}}>Total: -{pending.reduce((s,m)=>s+m.penalty,0)} XP</span>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><Btn variant="danger" onClick={close}>CANCEL</Btn><Btn onClick={()=>{endDay();close();}}>APPLY PENALTIES</Btn></div>
    </div>
  </div>
}

function DayReportModal({close,data,overlay,card,mh2}){
  const {ds,h}=data
  return<div style={overlay} onClick={e=>{if(e.target===e.currentTarget)close()}}>
    <div style={card}><div style={mh2}>📅 {ds}</div>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:'#06b6d4',padding:12,background:'rgba(6,182,212,0.05)',border:'1px solid rgba(6,182,212,0.15)',borderRadius:4,marginBottom:12}}>
        Completion: {Math.round((h.pct||0)*100)}% · {h.d||0}/{h.m||0} missions done
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}><Btn variant="danger" onClick={close}>CLOSE</Btn></div>
    </div>
  </div>
}
