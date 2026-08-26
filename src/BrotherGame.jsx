import { useEffect, useRef, useState } from 'react'

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 160
const GROUND_Y = 130
const BROTHER_X = 40
const BROTHER_SIZE = 40
const GRAVITY = 0.7
const JUMP_VELOCITY = -12
const INITIAL_SPEED = 6
const SPEED_INCREMENT_PER_FRAME = 0.0025
const OBSTACLE_MIN_GAP_PX = 260
const OBSTACLE_MAX_GAP_PX = 520
// Emoji glyphs don't fill their box — trim the collision box so brushing past feels fair.
const COLLISION_PADDING_PX = 8

export default function BrotherGame() {
  const canvasRef = useRef(null)
  const [uiState, setUiState] = useState('ready')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // HiDPI: bump the backing store so lines/text stay crisp on retina displays.
    // Cap at 2 because iOS Safari at 3x doubles the pixel work with no visible gain here.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = CANVAS_WIDTH * dpr
    canvas.height = CANVAS_HEIGHT * dpr
    ctx.scale(dpr, dpr)

    // iOS Safari's canvas won't fall back from `sans-serif` to Apple Color Emoji — declare it explicitly.
    const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'

    // Rendering emoji glyphs via fillText every frame is the main jank source on iOS.
    // Pre-render each glyph once into an offscreen canvas, then blit with drawImage in the loop.
    function createEmojiSprite(emoji, sizePx) {
      const spriteCanvas = document.createElement('canvas')
      spriteCanvas.width = sizePx * dpr
      spriteCanvas.height = sizePx * dpr
      const spriteCtx = spriteCanvas.getContext('2d')
      spriteCtx.scale(dpr, dpr)
      spriteCtx.font = `${sizePx}px ${EMOJI_FONT}`
      spriteCtx.textBaseline = 'top'
      spriteCtx.fillText(emoji, 0, 0)
      return spriteCanvas
    }

    const brotherSprite = createEmojiSprite('🏍️', BROTHER_SIZE)
    const womenSprite = createEmojiSprite('👯', 34)
    const cloudSprite = createEmojiSprite('☁️', 24)

    // Gradient never changes — build it once instead of per-frame.
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    skyGradient.addColorStop(0, '#1a1512')
    skyGradient.addColorStop(1, '#3a1e10')

    const game = {
      status: 'ready',
      brotherY: GROUND_Y - BROTHER_SIZE,
      velocityY: 0,
      isAirborne: false,
      women: [],
      speed: INITIAL_SPEED,
      distance: 0,
      nextWomenAt: OBSTACLE_MIN_GAP_PX,
      score: 0,
      highScore: 0,
      cloudX: CANVAS_WIDTH * 0.7,
    }

    function resetGame() {
      game.brotherY = GROUND_Y - BROTHER_SIZE
      game.velocityY = 0
      game.isAirborne = false
      game.women = []
      game.speed = INITIAL_SPEED
      game.distance = 0
      game.nextWomenAt = OBSTACLE_MIN_GAP_PX
      game.score = 0
    }

    function startOrJump() {
      if (game.status === 'ready') {
        game.status = 'playing'
        setUiState('playing')
        return
      }
      if (game.status === 'over') {
        resetGame()
        game.status = 'playing'
        setUiState('playing')
        return
      }
      if (!game.isAirborne) {
        game.velocityY = JUMP_VELOCITY
        game.isAirborne = true
      }
    }

    function handleKey(event) {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault()
        startOrJump()
      }
    }

    function handlePointer(event) {
      event.preventDefault()
      startOrJump()
    }

    window.addEventListener('keydown', handleKey)
    canvas.addEventListener('pointerdown', handlePointer)

    let rafId = 0
    function drawFrame() {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.strokeStyle = '#8b2500'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y + 2)
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 2)
      ctx.stroke()

      game.cloudX -= game.status === 'playing' ? 0.6 : 0.2
      if (game.cloudX < -40) game.cloudX = CANVAS_WIDTH + 40
      ctx.drawImage(cloudSprite, game.cloudX, 18, 24, 24)

      if (game.status === 'playing') {
        game.velocityY += GRAVITY
        game.brotherY += game.velocityY
        if (game.brotherY >= GROUND_Y - BROTHER_SIZE) {
          game.brotherY = GROUND_Y - BROTHER_SIZE
          game.velocityY = 0
          game.isAirborne = false
        }

        game.distance += game.speed
        game.speed += SPEED_INCREMENT_PER_FRAME

        if (game.distance >= game.nextWomenAt) {
          const isDouble = Math.random() < 0.2
          game.women.push({ x: CANVAS_WIDTH, width: isDouble ? 44 : 24, height: 34 })
          const gapRange = OBSTACLE_MAX_GAP_PX - OBSTACLE_MIN_GAP_PX
          game.nextWomenAt = game.distance + OBSTACLE_MIN_GAP_PX + Math.random() * gapRange
        }

        for (const women of game.women) {
          women.x -= game.speed
        }
        game.women = game.women.filter((women) => women.x > -women.width)

        const brotherLeft = BROTHER_X + COLLISION_PADDING_PX
        const brotherRight = BROTHER_X + BROTHER_SIZE - COLLISION_PADDING_PX
        const brotherBottom = game.brotherY + BROTHER_SIZE
        for (const women of game.women) {
          const womenTop = GROUND_Y - women.height
          if (
            brotherLeft < women.x + women.width - COLLISION_PADDING_PX &&
            brotherRight > women.x + COLLISION_PADDING_PX &&
            brotherBottom > womenTop
          ) {
            game.status = 'over'
            if (Math.floor(game.score) > game.highScore) {
              game.highScore = Math.floor(game.score)
            }
            setUiState('over')
            break
          }
        }

        game.score += 0.1
      }

      for (const women of game.women) {
        ctx.drawImage(womenSprite, women.x, GROUND_Y - 30, 34, 34)
        if (women.width > 30) {
          ctx.drawImage(womenSprite, women.x + 20, GROUND_Y - 30, 34, 34)
        }
      }

      ctx.drawImage(brotherSprite, BROTHER_X, game.brotherY, BROTHER_SIZE, BROTHER_SIZE)

      // Score readout drawn on canvas avoids per-frame React re-renders.
      ctx.fillStyle = '#f2e8d5'
      ctx.font = 'bold 16px "Impact", "Oswald", sans-serif'
      ctx.textBaseline = 'top'
      ctx.textAlign = 'right'
      const scoreLabel = `HI ${String(game.highScore).padStart(5, '0')}   ${String(Math.floor(game.score)).padStart(5, '0')}`
      ctx.fillText(scoreLabel, CANVAS_WIDTH - 12, 12)
      ctx.textAlign = 'left'

      rafId = requestAnimationFrame(drawFrame)
    }
    drawFrame()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('keydown', handleKey)
      canvas.removeEventListener('pointerdown', handlePointer)
    }
  }, [])

  return (
    <section className="brother-game">
      <div className="brother-stage">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        {uiState !== 'playing' && (
          <div className="brother-overlay" aria-hidden="true">
            {uiState === 'ready' ? 'TAP TO PLAY' : 'GAME OVER — TAP TO RESTART'}
          </div>
        )}
      </div>
      <p className="brother-hint" style={{textAlign: 'center'}}>SPACE or TAP to get sweet air, brother.<br/> Avoid the women at all costs.</p>
    </section>
  )
}
