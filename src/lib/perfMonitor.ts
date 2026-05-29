export interface PerfStats {
  fps: number
  frameMs: number
  instances: number
  triangles: number
  drawCalls: number
}

export type PerfStatsListener = (stats: PerfStats) => void

/** Acumula FPS / frame time a partir de timestamps por frame */
export function createPerfSampler(onUpdate: PerfStatsListener) {
  const frames: number[] = []
  let last = performance.now()

  return {
    tick(extra: Omit<PerfStats, 'fps' | 'frameMs'>) {
      const now = performance.now()
      const dt = now - last
      last = now
      frames.push(dt)
      if (frames.length > 30) frames.shift()
      const avg = frames.reduce((a, b) => a + b, 0) / frames.length
      onUpdate({
        fps: Math.round(1000 / avg),
        frameMs: Math.round(avg * 10) / 10,
        ...extra,
      })
    },
  }
}
