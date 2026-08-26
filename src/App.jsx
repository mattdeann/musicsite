import { useEffect } from 'react'
import biker1 from './assets/biker1.jpeg'
import biker2 from './assets/biker2.jpeg'
import biker3 from './assets/biker3.jpeg'
import cena1 from './assets/cena1.jpeg'
import cena2 from './assets/cena2.jpeg'
import shark1 from './assets/shark1.jpeg'
import shark2 from './assets/shark2.jpeg'
import eagleSoundUrl from './assets/eagle-sound_140bpm_C_major.wav'

// YouTube video IDs (the string after v= in a YouTube URL).
const YOUTUBE_VIDEO_IDS = [
  'Rbm6GXllBiw',
  'X53ZSxkQ3Ho',
  '6M4_Ommfvv0',
  'l482T0yNkeo',
  'MQNRKX8GwPo',
  'EFMD7Usflbg',
]
const PAGE_TITLE = 'GAY? DEFINITELY NOT'
const PAGE_SUBTITLE = 'Sleeveless denim. Open roads. No apologies. Just men.'
const WELCOME_MESSAGE =
  "This is a shrine to the boys. Chugging brews, bald eagles, and jean jackets with the sleeves torn clean off. Wind in the beard. Fire in the chest. Crack a cold one and spend the night. We're not gay, you're gay."

const MACHO_CREEDS = [
  { icon: '🦅', title: 'RIDE FREE', body: 'One horizon. Zero regrets.' },
  { icon: '🏍️', title: 'RUN HOT', body: 'Chrome pipes. Cracked leather.' },
  { icon: '👕', title: 'NO SLEEVES', body: 'Denim, cut, worn, earned.' },
]

// Throttle spawn rate so we don't flood the DOM on fast mouse moves.
const TRAIL_SPAWN_INTERVAL_MS = 35

function useEagleTrail() {
  useEffect(() => {
    let lastSpawnMs = 0

    function spawnEagle(event) {
      const now = performance.now()
      if (now - lastSpawnMs < TRAIL_SPAWN_INTERVAL_MS) return
      lastSpawnMs = now

      const eagle = document.createElement('span')
      eagle.className = 'cursor-trail'
      eagle.textContent = '🦅'
      eagle.style.left = `${event.clientX}px`
      eagle.style.top = `${event.clientY}px`
      // Random rotation direction gives the trail a chaotic, trippy feel.
      eagle.style.setProperty('--trail-spin', `${Math.random() > 0.5 ? 1 : -1}`)
      document.body.appendChild(eagle)

      eagle.addEventListener('animationend', () => eagle.remove(), { once: true })
    }

    window.addEventListener('mousemove', spawnEagle)
    return () => window.removeEventListener('mousemove', spawnEagle)
  }, [])
}

function useEagleScreech() {
  useEffect(() => {
    function playScreech() {
      // New Audio per click lets rapid clicks stack instead of cutting each other off.
      const audio = new Audio(eagleSoundUrl)
      audio.volume = 0.6
      // Older browsers may reject autoplay without user interaction — click qualifies, so ignore promise rejects silently.
      void audio.play().catch(() => {})
    }

    window.addEventListener('click', playScreech)
    return () => window.removeEventListener('click', playScreech)
  }, [])
}

export default function App() {
  useEagleTrail()
  useEagleScreech()

  return (
    <main className="page">
      {/* HERO — Cena gym backdrop blended with fire; biker skeleton floats on top */}
      <header
        className="hero"
        style={{ backgroundImage: `url(${cena1})` }}
      >
        <div className="hero-inner">
          <img className="hero-art" src={biker1} alt="Skeleton biker riding through flames" />
          <h1 className="title">{PAGE_TITLE}</h1>
          <p className="subtitle">{PAGE_SUBTITLE}</p>
        </div>
      </header>

      {/* WELCOME — text wraps against a clipped Cena salute portrait */}
      <section className="welcome-block">
        <div
          className="welcome-portrait"
          style={{ backgroundImage: `url(${cena2})` }}
          aria-label="Salute to the code"
          role="img"
        />
        <div className="welcome-copy" >
          <p style={{textAlign: 'center'}}>{WELCOME_MESSAGE}</p>
        </div>
      </section>

      {/* BANNER — chopper gang with a gradient mask fading into the page */}
      <figure className="banner" style={{ backgroundImage: `url(${biker2})` }}>
        <figcaption>Balls deep with my brothers. Loud pipes save lives.</figcaption>
      </figure>

      <div style={{fontSize: 50}}>THE GOOD STUFF</div>

      <div className="video-grid">
        {YOUTUBE_VIDEO_IDS.map((videoId) => (
          <div key={videoId} className="video-frame">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Embedded video ${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ))}
      </div>

      {/* APEX — full-bleed shark image behind a dark rust overlay */}
      <section
        className="apex"
        style={{ backgroundImage: `url(${shark1})` }}
      >
        <div className="apex-content">
          <h2>APEX PREDATOR</h2>
          <p>Only two kinds out here — the ones who bite, and the ones who get bit.</p>
        </div>
      </section>

      <section className="creeds">
        {MACHO_CREEDS.map((creed) => (
          <article key={creed.title} className="creed-card">
            <div className="creed-icon" aria-hidden="true">{creed.icon}</div>
            <h2 className="creed-title">{creed.title}</h2>
            <p className="creed-body">{creed.body}</p>
          </article>
        ))}
      </section>

      {/* BROTHERHOOD — clipped diagonal portrait fused into the panel */}
      <section className="crew">
        <div
          className="crew-portrait"
          style={{ backgroundImage: `url(${biker3})` }}
          aria-label="Tattooed brother of the road"
          role="img"
        />
        <div className="crew-copy">
          <h2>ALWAYS BUILT NEVER BROKEN</h2>
          <p>
            Inked, earned, not bought. Built. Never Broken. Always. Every scar's a story, every mile's a mile.
            We don't ride to live life — this <em>is</em> the life, and we live it.
          </p>
        </div>
      </section>

      {/* STALKING STRIP — shark2 tiled behind a whisper of copy, low and slow */}
      <section
        className="stalking-strip"
        style={{ backgroundImage: `url(${shark2})` }}
      >
        <p>Never surface. Always circling.</p>
      </section>

      <footer className="footer">
        <span aria-hidden="true">🏍️ 🦅 🔥</span>
        <p>Built loud. Ridden hard. Never garaged.</p>
      </footer>
    </main>
  )
}
