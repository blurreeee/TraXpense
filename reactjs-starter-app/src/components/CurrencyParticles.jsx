import React from "react";
import { useEffect, useRef } from 'react'

/**
 * CurrencyParticles
 * ------------------
 * A lightweight <canvas> overlay that floats currency symbols/words across its
 * parent. Particles drift continuously and are gently repelled from the mouse
 * pointer when it hovers the area.
 *
 * Designed to sit absolutely inside a `position: relative` container (e.g. the
 * dashboard greeting banner) behind the foreground text.
 *
 * Props:
 *   glyphs   - array of strings to render as particles
 *   count    - number of particles (auto-scaled down on small canvases)
 *   color    - base glyph color (alpha is applied per-particle)
 */
const DEFAULT_GLYPHS = ['$', '₹', '€', '£', '¥', 'USD', 'INR', 'EUR', '$', '₹', '€']

export default function CurrencyParticles({
  glyphs = DEFAULT_GLYPHS,
  count = 26,
  color = '255, 255, 255',
}) {
  const canvasRef = useRef(null)
  // Pointer position in canvas-local coords; active=false when not hovering.
  const pointerRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles = []
    let rafId = null

    const rand = (min, max) => Math.random() * (max - min) + min

    const makeParticle = () => ({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.25, 0.25),
      size: rand(12, 26),
      alpha: rand(0.06, 0.22),
      glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
      // independent velocity carried by repulsion, decays back to drift
      px: 0,
      py: 0,
    })

    const seedParticles = () => {
      // Scale particle count to area so small cards don't get crowded.
      const area = width * height
      const scaled = Math.max(8, Math.min(count, Math.round(area / 9000)))
      particles = Array.from({ length: scaled }, makeParticle)
    }

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seedParticles()
    }

    const REPEL_RADIUS = 90
    const REPEL_STRENGTH = 1.4

    const step = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const pointer = pointerRef.current

      for (const p of particles) {
        // Base drift
        p.x += p.vx
        p.y += p.vy

        // Mouse repulsion: push away from pointer within radius
        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist > 0 && dist < REPEL_RADIUS) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH
            p.px += (dx / dist) * force
            p.py += (dy / dist) * force
          }
        }

        // Apply + decay the repulsion velocity so particles ease back to drift
        p.x += p.px
        p.y += p.py
        p.px *= 0.9
        p.py *= 0.9

        // Wrap around edges for a seamless continuous field
        const m = p.size
        if (p.x < -m) p.x = width + m
        else if (p.x > width + m) p.x = -m
        if (p.y < -m) p.y = height + m
        else if (p.y > height + m) p.y = -m

        ctx.font = `600 ${p.size}px 'Inter', sans-serif`
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`
        ctx.fillText(p.glyph, p.x, p.y)
      }

      rafId = requestAnimationFrame(step)
    }

    const onPointerMove = (e) => {
      const rect = parent.getBoundingClientRect()
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
    }
    const onPointerLeave = () => {
      pointerRef.current.active = false
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    parent.addEventListener('pointermove', onPointerMove)
    parent.addEventListener('pointerleave', onPointerLeave)

    if (reduceMotion) {
      // Draw a single static frame, no animation loop.
      ctx.clearRect(0, 0, width, height)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        ctx.font = `600 ${p.size}px 'Inter', sans-serif`
        ctx.fillStyle = `rgba(${color}, ${p.alpha})`
        ctx.fillText(p.glyph, p.x, p.y)
      }
    } else {
      rafId = requestAnimationFrame(step)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      ro.disconnect()
      parent.removeEventListener('pointermove', onPointerMove)
      parent.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [glyphs, count, color])

  return <canvas ref={canvasRef} className="currency-particles" aria-hidden="true" />
}
