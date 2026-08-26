import { useEffect, useRef, useState } from 'react'

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 160
const GROUND_Y = 130
const DINO_X = 40
const DINO_SIZE = 40
const GRAVITY = 0.7
const JUMP_VELOCITY = -12
const INITIAL_SPEED = 6
const SPEED_INCREMENT_PER_FRAME = 0.0025
const OBSTACLE_MIN_GAP_PX = 260
const OBSTACLE_MAX_GAP_PX = 520
// Emoji glyphs don't fill their box — trim the collision box so brushing past feels fair.
const COLLISION_PADDING_PX = 8

export default function DinoGame() {
  const canvasRef = useRef(null)
  const [uiState, setUiState] = useState('ready')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const game = {
      status: 'ready',
      dinoY: GROUND_Y - DINO_SIZE,
      velocityY: 0,
      isAirborne: false,
      obstacles: [],
      speed: INITIAL_SPEED,
      distance: 0,
      nextObstacleAt: OBSTACLE_MIN_GAP_PX,
      score: 0,
      highScore: 0,
      cloudX: CANVAS_WIDTH * 0.7,
    }

    function resetGame() {
      game.dinoY = GROUND_Y - DINO_SIZE
      game.velocityY = 0
      game.isAirborne = false
      game.obstacles = []
      game.speed = INITIAL_SPEED
      game.distance = 0
      game.nextObstacleAt = OBSTACLE_MIN_GAP_PX
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

      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      gradient.addColorStop(0, '#1a1512')
      gradient.addColorStop(1, '#3a1e10')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.strokeStyle = '#8b2500'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, GROUND_Y + 2)
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 2)
      ctx.stroke()

      game.cloudX -= game.status === 'playing' ? 0.6 : 0.2
      if (game.cloudX < -40) game.cloudX = CANVAS_WIDTH + 40
      ctx.font = '24px sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText('☁️', game.cloudX, 30)

      if (game.status === 'playing') {
        game.velocityY += GRAVITY
        game.dinoY += game.velocityY
        if (game.dinoY >= GROUND_Y - DINO_SIZE) {
          game.dinoY = GROUND_Y - DINO_SIZE
          game.velocityY = 0
          game.isAirborne = false
        }

        game.distance += game.speed
        game.speed += SPEED_INCREMENT_PER_FRAME

        if (game.distance >= game.nextObstacleAt) {
          const isDouble = Math.random() < 0.2
          game.obstacles.push({ x: CANVAS_WIDTH, width: isDouble ? 44 : 24, height: 34 })
          const gapRange = OBSTACLE_MAX_GAP_PX - OBSTACLE_MIN_GAP_PX
          game.nextObstacleAt = game.distance + OBSTACLE_MIN_GAP_PX + Math.random() * gapRange
        }

        for (const obstacle of game.obstacles) {
          obstacle.x -= game.speed
        }
        game.obstacles = game.obstacles.filter((obstacle) => obstacle.x > -obstacle.width)

        const dinoLeft = DINO_X + COLLISION_PADDING_PX
        const dinoRight = DINO_X + DINO_SIZE - COLLISION_PADDING_PX
        const dinoBottom = game.dinoY + DINO_SIZE
        for (const obstacle of game.obstacles) {
          const obstacleTop = GROUND_Y - obstacle.height
          if (
            dinoLeft < obstacle.x + obstacle.width - COLLISION_PADDING_PX &&
            dinoRight > obstacle.x + COLLISION_PADDING_PX &&
            dinoBottom > obstacleTop
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

      ctx.font = '34px sans-serif'
      ctx.textBaseline = 'alphabetic'
      for (const obstacle of game.obstacles) {
        ctx.fillText('🌵', obstacle.x, GROUND_Y + 4)
        if (obstacle.width > 30) {
          ctx.fillText('🌵', obstacle.x + 20, GROUND_Y + 4)
        }
      }

      ctx.font = '40px sans-serif'
      ctx.textBaseline = 'top'
      ctx.fillText('🦖', DINO_X, game.dinoY)

      // Score readout drawn on canvas avoids per-frame React re-renders.
      ctx.fillStyle = '#f2e8d5'
      ctx.font = 'bold 16px "Impact", "Oswald", sans-serif'
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
    <section className="dino-game">
      <div className="dino-stage">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
        {uiState !== 'playing' && (
          <div className="dino-overlay" aria-hidden="true">
            {uiState === 'ready' ? 'TAP TO PLAY' : 'GAME OVER — TAP TO RESTART'}
          </div>
        )}
      </div>
      <p className="dino-hint">SPACE or TAP to jump. Don't hit the cactus.</p>
    </section>
  )
}
