import { useEffect } from 'react'
import biker2 from './assets/biker2.jpeg'
import biker3 from './assets/biker3.jpeg'
import cena1 from './assets/cena1.jpeg'
import cena2 from './assets/cena2.jpeg'
import shark1 from './assets/shark1.jpeg'
import eagleSoundUrl from './assets/eagle-sound_140bpm_C_major.wav'
import BrotherGame from './BrotherGame.jsx'

// YouTube video IDs (the string after v= in a YouTube URL).
const YOUTUBE_VIDEO_IDS = [
  'Rbm6GXllBiw',
  'X53ZSxkQ3Ho',
  '6M4_Ommfvv0',
  'l482T0yNkeo',
  'IyhJ69mD7xI',
  'MQNRKX8GwPo',
  'EFMD7Usflbg',
  'sCtQKGyfW3k',

]
const PAGE_TITLE = 'GAY? DEFINITELY NOT'
const PAGE_SUBTITLE = 'Sleeveless denim. Open roads. No apologies. Just men.'
const WELCOME_MESSAGE =
  "This is a shrine to the boys. Chugging brews, bald eagles, and jean jackets with the sleeves torn clean off. Wind in the beard. Fire in the chest. Crack a cold one and spend the night. We're not gay, you're gay."

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

// Swap the playing song every N clicks — a random grid video takes over, others pause.
// Uses the YouTube IFrame API so we don't reload iframe src on each swap.
const CLICKS_PER_SONG_CHANGE = 3

function useRandomVideoAutoplayOnClick() {
  useEffect(() => {
    const YT_API_SRC = 'https://www.youtube.com/iframe_api'
    if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
      const tag = document.createElement('script')
      tag.src = YT_API_SRC
      document.head.appendChild(tag)
    }

    const players = []

    function tryCreatePlayers() {
      if (!window.YT || !window.YT.Player) return
      if (players.length > 0) return
      const iframes = document.querySelectorAll('iframe[id^="yt-player-"]')
      iframes.forEach((iframe) => {
        players.push(new window.YT.Player(iframe.id))
      })
    }

    // YT API invokes this global once the script finishes loading.
    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      tryCreatePlayers()
    }
    tryCreatePlayers()

    let clickCount = 0

    function handleClick() {
      clickCount += 1
      if (clickCount % CLICKS_PER_SONG_CHANGE !== 0) return
      if (players.length === 0) return
      const randomIndex = Math.floor(Math.random() * players.length)
      players.forEach((player, index) => {
        if (typeof player.pauseVideo !== 'function') return
        if (index === randomIndex) {
          player.unMute()
          player.setVolume(60)
          player.playVideo()
        } else {
          player.pauseVideo()
        }
      })
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])
}

// Reads --parallax-y and lets each element position its background/transform via that var.
// Small offsets keep the illusion subtle enough that `background-size: cover` still hides the edges.
function useParallax() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('[data-parallax-speed]'))
    if (elements.length === 0) return

    let isScheduled = false

    function updateParallax() {
      const viewportHeight = window.innerHeight
      const scrollY = window.scrollY
      for (const element of elements) {
        const speed = parseFloat(element.dataset.parallaxSpeed) || 0.2
        let offset
        if (element.dataset.parallaxScroll !== undefined) {
          // Fixed elements have no meaningful viewport position — parallax against raw scrollY.
          offset = scrollY * speed
        } else {
          const rect = element.getBoundingClientRect()
          const elementCenterY = rect.top + rect.height / 2
          const distanceFromViewportCenter = elementCenterY - viewportHeight / 2
          // Negative sign makes the image lag behind the scroll, which reads as depth.
          offset = -distanceFromViewportCenter * speed
        }
        element.style.setProperty('--parallax-y', `${offset.toFixed(1)}px`)
      }
      isScheduled = false
    }

    function scheduleUpdate() {
      if (isScheduled) return
      isScheduled = true
      requestAnimationFrame(updateParallax)
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    updateParallax()

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])
}

// Radial burst of eagles on every click — each shard flies outward on a unique vector
// via the CSS animation's translate(var(--burst-x), var(--burst-y)) target.
const EAGLE_BURST_COUNT = 3
const EAGLE_BURST_MIN_DISTANCE_PX = 50
const EAGLE_BURST_MAX_DISTANCE_PX = 140

function useEagleFireworks() {
  useEffect(() => {
    function spawnBurst(event) {
      for (let i = 0; i < EAGLE_BURST_COUNT; i += 1) {
        // Evenly spaced base angles with a small jitter so the ring feels organic, not clocked.
        const jitter = (Math.random() - 0.5) * (Math.PI / EAGLE_BURST_COUNT)
        const angle = (i / EAGLE_BURST_COUNT) * Math.PI * 2 + jitter
        const distance =
          EAGLE_BURST_MIN_DISTANCE_PX +
          Math.random() * (EAGLE_BURST_MAX_DISTANCE_PX - EAGLE_BURST_MIN_DISTANCE_PX)

        const eagle = document.createElement('span')
        eagle.className = 'eagle-burst'
        eagle.textContent = '🦅'
        eagle.style.left = `${event.clientX}px`
        eagle.style.top = `${event.clientY}px`
        eagle.style.setProperty('--burst-x', `${Math.cos(angle) * distance}px`)
        eagle.style.setProperty('--burst-y', `${Math.sin(angle) * distance}px`)
        eagle.style.setProperty('--burst-spin', `${Math.random() > 0.5 ? 3 : -1}`)
        document.body.appendChild(eagle)

        eagle.addEventListener('animationend', () => eagle.remove(), { once: true })
      }
    }

    window.addEventListener('click', spawnBurst)
    return () => window.removeEventListener('click', spawnBurst)
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
  useEagleFireworks()
  useEagleScreech()
  useRandomVideoAutoplayOnClick()
  useParallax()

  return (
    <main className="page">
      {/* Page-wide tiled Cena backdrop with negative parallax; sits behind every section. */}
      <div
        className="page-backdrop"
        data-parallax-scroll
        data-parallax-speed="-0.35"
        style={{ backgroundImage: `url(${cena1})` }}
        aria-hidden="true"
      />

      {/* HERO — sits over the shared backdrop; ::before adds the flame overlay */}
      <header className="hero">
        <div className="hero-inner">
          <h1 className="title">{PAGE_TITLE}</h1>
          <p className="subtitle">{PAGE_SUBTITLE}</p>
        </div>
      </header>

      {/* WELCOME — text wraps against a clipped Cena salute portrait */}
      <section className="welcome-block">
        <div
          className="welcome-portrait"
          data-parallax-speed="0.2"
          style={{ backgroundImage: `url(${cena2})` }}
          aria-label="Salute to the code"
          role="img"
        />
        <div className="welcome-copy" >
          <p style={{textAlign: 'center'}}>{WELCOME_MESSAGE}</p>
        </div>
      </section>

      {/* BANNER — chopper gang with a gradient mask fading into the page */}
      <figure className="banner" data-parallax-speed="0.2" style={{ backgroundImage: `url(${biker2})` }}>
        <figcaption>Balls deep with my brothers. Loud pipes save lives.</figcaption>
      </figure>

      <div style={{fontSize: 50}}>DANGER: MEN ONLY</div>

      <div className="video-grid">
        {YOUTUBE_VIDEO_IDS.map((videoId, index) => (
          <div key={videoId} className="video-frame">
            <iframe
              id={`yt-player-${index}`}
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1`}
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
        data-parallax-speed="0.2"
        style={{ backgroundImage: `url(${shark1})` }}
      >
        <div className="apex-content">
          <h2>APEX PREDATOR</h2>
          <p>Only two kinds out here — the ones who bite, and the ones who get bit.</p>
        </div>
      </section>
      
      {/* BROTHER GAME — Chrome offline runner, macho-tinted */}
      <BrotherGame />

      {/* BROTHERHOOD — clipped diagonal portrait fused into the panel */}
      <section className="crew">
        <div
          className="crew-portrait"
          data-parallax-speed="0.2"
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

      <footer className="footer">
        <span aria-hidden="true">🏍️ 🦅 🔥</span>
        <p>Built loud. Ridden hard. Never garaged.</p>
      </footer>
    </main>
  )
}
