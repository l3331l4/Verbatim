"use client"

import { useEffect, useRef } from "react"

export function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight * 1.5
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create gradient blobs
    const blobs = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 300 + 100,
      dx: Math.random() * 0.2 - 0.1,
      dy: Math.random() * 0.2 - 0.1,
      hue: Math.random() * 60 + 220, // Blue to purple range
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw blobs
      blobs.forEach((blob) => {
        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)
        gradient.addColorStop(0, `hsla(${blob.hue}, 80%, 60%, 0.4)`)
        gradient.addColorStop(1, `hsla(${blob.hue}, 80%, 60%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fill()

        // Move blobs
        blob.x += blob.dx
        blob.y += blob.dy

        // Bounce off edges
        if (blob.x < 0 || blob.x > canvas.width) blob.dx *= -1
        if (blob.y < 0 || blob.y > canvas.height) blob.dy *= -1
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-70" aria-hidden="true" />
}
