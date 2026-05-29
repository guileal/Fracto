import * as THREE from 'three'

/** Nome típico da action no Blender quando exporta o resumo de keyframes. */
const SUMMARY_NAME = /summary/i

export function clipEndTime(clip: THREE.AnimationClip): number {
  let end = clip.duration
  for (const track of clip.tracks) {
    const times = track.times
    if (times.length > 0) end = Math.max(end, times[times.length - 1]!)
  }
  return end
}

/**
 * Timeline única para scrub via scroll:
 * 1. Clip "Summary" se existir
 * 2. Senão, um único clip do arquivo
 * 3. Senão, une todas as tracks de todos os clips (todas as keyframes exportadas)
 */
export function buildSummaryTimeline(
  clips: THREE.AnimationClip[],
): { clip: THREE.AnimationClip; label: string } | null {
  if (clips.length === 0) return null

  const summary = clips.find((c) => SUMMARY_NAME.test(c.name))
  if (summary) {
    return { clip: summary, label: summary.name }
  }

  if (clips.length === 1) {
    const c = clips[0]!
    return { clip: c, label: c.name || 'Animation' }
  }

  const tracks: THREE.KeyframeTrack[] = []
  for (const clip of clips) {
    for (const track of clip.tracks) {
      tracks.push(track.clone())
    }
  }

  let duration = 0
  for (const track of tracks) {
    if (track.times.length > 0) {
      duration = Math.max(duration, track.times[track.times.length - 1]!)
    }
  }

  const merged = new THREE.AnimationClip(
    'Summary',
    duration,
    tracks,
  )

  return {
    clip: merged,
    label: `Summary (${clips.length} clips)`,
  }
}
