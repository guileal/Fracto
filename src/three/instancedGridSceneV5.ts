import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { buildLogoCellMap } from '../lib/fractoLogoPattern'
import {
  DEFAULT_SCENE_LIGHTING,
  mergeLighting,
  type SceneLightingConfig,
} from '../lib/gridLighting'
import { createPerfSampler } from '../lib/perfMonitor'
import { normalizeHexColor } from '../lib/colorHex'
import { deriveGridV5LiftColor, resolveGridV5Theme } from '../lib/gridThemeV5'
import { observeStableContainerResize } from '../lib/stableContainerResize'
import type { InstancedGridHandle, InstancedGridOptions } from './instancedGridScene'

const DEFAULTS = {
  cols: 16,
  rows: 12,
  cellSize: 1,
} as const

const CUBE_DEPTH = 0.42
const BEVEL_RADIUS = 0.042
const BEVEL_SEGMENTS = 2
const MAX_LIFT = 2.15
const MOUSE_RADIUS = 3.6
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS
const LOGO_MOUSE_RADIUS = 5.2
const LOGO_MOUSE_RADIUS_SQ = LOGO_MOUSE_RADIUS * LOGO_MOUSE_RADIUS
const LIFT_LERP = 0.13
const MOUSE_LERP = 0.12
const LIFT_EPSILON = 0.004

type FlickerKind = 'white' | 'orange'

interface GridFlicker {
  index: number
  until: number
  kind: FlickerKind
  strength: number
}

interface LogoFlicker {
  until: number
  /** 0 = apagado, 1 = brilho máximo */
  phase: number
}

export function createInstancedGridSceneV5(
  container: HTMLElement,
  options: InstancedGridOptions = {},
): InstancedGridHandle {
  const { cols, rows, cellSize, onStats, lowPower = false, pointerTarget, theme, cubeColor } = {
    ...DEFAULTS,
    ...options,
  }
  const resolvedTheme = theme ?? 'dark'
  container.dataset.gridTheme = resolvedTheme
  const isLight = resolvedTheme === 'light'
  const palette = resolveGridV5Theme(resolvedTheme)
  const bgColor = palette.background
  const COLOR_REST = new THREE.Color(palette.colorRest)
  const COLOR_LIFT = new THREE.Color(palette.colorLift)
  const COLOR_LOGO_DARK = new THREE.Color(palette.colorLogoDark)
  const COLOR_LOGO_WHITE = new THREE.Color(palette.colorLogoWhite)
  const COLOR_BRAND = new THREE.Color(palette.colorBrand)
  const COLOR_FLICKER_WHITE = new THREE.Color(palette.colorFlickerWhite)
  const COLOR_FLICKER_ORANGE = new THREE.Color(palette.colorFlickerOrange)
  let cubeColorHex = palette.defaultCubeColor
  const pointerEl = pointerTarget ?? container
  const frameBudgetMs = lowPower ? 1000 / 30 : 0
  const flickerSpawnMs = lowPower ? 320 : 140
  let lightingConfig = mergeLighting(
    DEFAULT_SCENE_LIGHTING,
    options.lighting ?? {},
  )
  const count = cols * rows

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(bgColor)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200)
  camera.position.set(0, 0, 16)

  const isNarrow = () => container.clientWidth < 768

  const renderer = new THREE.WebGLRenderer({
    antialias: lowPower ? false : !isNarrow(),
    alpha: false,
    powerPreference: lowPower ? 'low-power' : 'high-performance',
  })
  renderer.setClearColor(bgColor, 1)
  container.appendChild(renderer.domElement)

  if (!isLight) {
    scene.add(new THREE.HemisphereLight(palette.hemiSky, palette.hemiGround, palette.hemiIntensity))
    scene.add(new THREE.AmbientLight(palette.ambient, palette.ambientIntensity))

    const key = new THREE.DirectionalLight(palette.keyLight, palette.keyIntensity)
    key.position.set(-8, 12, 10)
    scene.add(key)

    const fill = new THREE.DirectionalLight(palette.fillLight, palette.fillIntensity)
    fill.position.set(7, 3, 8)
    scene.add(fill)
  }

  const mouseLight = new THREE.PointLight(
    lightingConfig.mouse.color,
    0,
    lightingConfig.mouse.distance,
    lightingConfig.mouse.decay,
  )

  const geometry = new RoundedBoxGeometry(1, 1, CUBE_DEPTH, BEVEL_SEGMENTS, BEVEL_RADIUS)
  const material: THREE.MeshBasicMaterial | THREE.MeshPhongMaterial = isLight
    ? new THREE.MeshBasicMaterial({ color: palette.colorRest })
    : new THREE.MeshPhongMaterial({
        color: palette.materialColor,
        vertexColors: true,
        specular: palette.specular,
        shininess: palette.shininess,
      })

  container.dataset.sceneBg = bgColor.toString(16).padStart(6, '0')

  const applyCubePalette = (hex: string): boolean => {
    const normalized = normalizeHexColor(hex)
    if (!normalized) return false
    cubeColorHex = normalized
    COLOR_REST.set(normalized)
    COLOR_LIFT.set(deriveGridV5LiftColor(normalized, resolvedTheme))
    material.color.set(COLOR_REST)
    return true
  }

  applyCubePalette(cubeColor ?? palette.defaultCubeColor)

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  const baseX = new Float32Array(count)
  const baseY = new Float32Array(count)
  const currentLift = new Float32Array(count)
  const dummy = new THREE.Object3D()
  const color = new THREE.Color()

  const offsetX = ((cols - 1) * cellSize) / 2
  const offsetY = ((rows - 1) * cellSize) / 2
  const restZ = CUBE_DEPTH * 0.5

  let idx = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      baseX[idx] = col * cellSize - offsetX
      baseY[idx] = row * cellSize - offsetY
      if (!isLight) mesh.setColorAt(idx, COLOR_REST)
      idx++
    }
  }
  if (!isLight && mesh.instanceColor) mesh.instanceColor.needsUpdate = true

  const logo = buildLogoCellMap(cols, rows, baseX, baseY)
  const logoFlickers = new Map<number, LogoFlicker>()
  const gridFlickers: GridFlicker[] = []
  let lastFlickerSpawn = 0

  const gridGroup = new THREE.Group()
  gridGroup.add(mesh)
  gridGroup.add(mouseLight)
  scene.add(gridGroup)

  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  const hitPoint = new THREE.Vector3()
  const gridPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

  let targetNdcX = 0
  let targetNdcY = 0
  let smoothNdcX = 0
  let smoothNdcY = 0
  let mouseGridX = 0
  let mouseGridY = 0
  let mouseActive = false
  let gridScale = 1
  let clock = 0

  const isTouchLike = () =>
    window.matchMedia('(hover: none), (pointer: coarse)').matches

  const setPointerNdcFromClient = (clientX: number, clientY: number) => {
    const rect = container.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    targetNdcX = ((clientX - rect.left) / rect.width) * 2 - 1
    targetNdcY = -(((clientY - rect.top) / rect.height) * 2 - 1)
  }

  const applyMouseLightParams = () => {
    const m = lightingConfig.mouse
    mouseLight.color.set(m.color)
    mouseLight.distance = m.distance
    mouseLight.decay = m.decay
  }

  const updateMouseLight = () => {
    const m = lightingConfig.mouse
    if (isLight || !m.enabled || isTouchLike()) {
      mouseLight.intensity = 0
      return
    }
    if (mouseActive) {
      mouseLight.position.set(mouseGridX, mouseGridY, m.zOffset)
      mouseLight.intensity = m.intensity
    } else {
      mouseLight.intensity = 0
    }
  }

  applyMouseLightParams()

  const onMove = (event: MouseEvent) => {
    if (isTouchLike()) return
    mouseActive = true
    setPointerNdcFromClient(event.clientX, event.clientY)
  }

  const onLeave = () => {
    mouseActive = false
    updateMouseLight()
  }

  const onTouchPointer = (clientX: number, clientY: number) => {
    mouseActive = true
    setPointerNdcFromClient(clientX, clientY)
  }

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    onTouchPointer(touch.clientX, touch.clientY)
  }

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    onTouchPointer(touch.clientX, touch.clientY)
  }

  const onTouchEnd = () => {
    mouseActive = false
    updateMouseLight()
  }

  pointerEl.addEventListener('mousemove', onMove, { passive: true, capture: true })
  pointerEl.addEventListener('mouseleave', onLeave)
  pointerEl.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
  pointerEl.addEventListener('touchmove', onTouchMove, { passive: true, capture: true })
  pointerEl.addEventListener('touchend', onTouchEnd, { capture: true })
  pointerEl.addEventListener('touchcancel', onTouchEnd, { capture: true })

  const radialInfluence = (distSq: number, radiusSq: number): number => {
    const t = Math.min(1, distSq / radiusSq)
    const falloff = 1 - t
    const smooth = falloff * falloff * (3 - 2 * falloff)
    return Math.pow(smooth, 0.72)
  }

  const setInstanceMatrix = (i: number, lift: number) => {
    dummy.position.set(baseX[i]!, baseY[i]!, restZ + lift)
    dummy.scale.set(cellSize, cellSize, 1)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }

  const pickNonLogoIndex = (): number => {
    let i = Math.floor(Math.random() * count)
    let guard = 0
    while (logo.cells.has(i) && guard++ < 24) {
      i = Math.floor(Math.random() * count)
    }
    return i
  }

  const spawnAmbientFlickers = (time: number) => {
    if (isLight) return
    if (time - lastFlickerSpawn < flickerSpawnMs) return
    lastFlickerSpawn = time

    const whiteCount = lowPower ? 1 : Math.random() < 0.55 ? 2 : 1
    for (let k = 0; k < whiteCount; k++) {
      gridFlickers.push({
        index: pickNonLogoIndex(),
        until: time + 70 + Math.random() * 120,
        kind: 'white',
        strength: 0.55 + Math.random() * 0.45,
      })
    }

    if (!lowPower && !isLight && Math.random() < 0.38) {
      gridFlickers.push({
        index: pickNonLogoIndex(),
        until: time + 220 + Math.random() * 380,
        kind: 'orange',
        strength: 0.14 + Math.random() * 0.28,
      })
    }
  }

  const maybeLogoFlicker = (i: number, time: number, proximity: number) => {
    const existing = logoFlickers.get(i)
    if (existing && existing.until > time) return

    const chance = mouseActive
      ? 0.028 * proximity + 0.006
      : 0.0018

    if (Math.random() < chance) {
      logoFlickers.set(i, {
        until: time + (mouseActive ? 90 : 140) + Math.random() * 110,
        phase: Math.random(),
      })
    }
  }

  const applyLogoColor = (
    i: number,
    lift: number,
    time: number,
    accent: boolean,
  ) => {
    if (isLight) {
      applyGridFlickerColor(i, lift, time)
      return
    }

    const dx = baseX[i]! - mouseGridX
    const dy = baseY[i]! - mouseGridY
    const distSq = dx * dx + dy * dy
    const proximity = mouseActive
      ? radialInfluence(distSq, LOGO_MOUSE_RADIUS_SQ)
      : 0

    maybeLogoFlicker(i, time, proximity)

    const flicker = logoFlickers.get(i)
    let flickerMix = 0
    if (flicker && flicker.until > time) {
      const elapsed = 1 - (flicker.until - time) / 200
      flickerMix = Math.sin(elapsed * Math.PI * 3 + flicker.phase * 6) * 0.5 + 0.5
      flickerMix = Math.max(0, flickerMix)
    } else if (flicker) {
      logoFlickers.delete(i)
    }

    color.copy(COLOR_LOGO_DARK)

    if (proximity > 0.02) {
      const lit = accent ? COLOR_BRAND : COLOR_LOGO_WHITE
      color.lerp(lit, proximity * 0.92)
    }

    if (flickerMix > 0.15) {
      if (flickerMix > 0.72 && Math.random() < 0.35) {
        color.copy(COLOR_LOGO_DARK)
      } else {
        const pulse = accent ? COLOR_BRAND : COLOR_LOGO_WHITE
        color.lerp(pulse, flickerMix * 0.85)
      }
    }

    const liftT = Math.min(1, lift / MAX_LIFT)
    color.lerp(COLOR_LIFT, liftT * 0.12)
    mesh.setColorAt(i, color)
  }

  const applyGridFlickerColor = (i: number, lift: number, time: number) => {
    if (isLight) return
    const active = gridFlickers.find((f) => f.index === i && f.until > time)
    color.copy(COLOR_REST)
    const liftT = Math.min(1, lift / MAX_LIFT)
    const liftMix = isLight ? liftT * 1.45 : liftT
    color.lerp(COLOR_LIFT, liftMix)

    if (active) {
      const pulse =
        active.kind === 'white'
          ? Math.sin((active.until - time) * 0.08) * 0.5 + 0.5
          : Math.sin((active.until - time) * 0.04) * 0.5 + 0.5
      const target = active.kind === 'white' ? COLOR_FLICKER_WHITE : COLOR_FLICKER_ORANGE
      color.lerp(target, active.strength * pulse)
    }

    mesh.setColorAt(i, color)
  }

  const updateMouseOnGrid = (): boolean => {
    const prevX = smoothNdcX
    const prevY = smoothNdcY
    smoothNdcX += (targetNdcX - smoothNdcX) * MOUSE_LERP
    smoothNdcY += (targetNdcY - smoothNdcY) * MOUSE_LERP

    if (!mouseActive) return false

    pointerNdc.set(smoothNdcX, smoothNdcY)
    raycaster.setFromCamera(pointerNdc, camera)

    if (raycaster.ray.intersectPlane(gridPlane, hitPoint)) {
      mouseGridX = hitPoint.x / gridScale
      mouseGridY = hitPoint.y / gridScale
    }

    updateMouseLight()

    return (
      Math.abs(smoothNdcX - prevX) > 0.0001 || Math.abs(smoothNdcY - prevY) > 0.0001
    )
  }

  const updateInstances = (time: number): boolean => {
    spawnAmbientFlickers(time)

    const cutoff = time - 50
    for (let f = gridFlickers.length - 1; f >= 0; f--) {
      if (gridFlickers[f]!.until < cutoff) {
        gridFlickers.splice(f, 1)
      }
    }

    const mouseMoved = updateMouseOnGrid()
    let matrixDirty = mouseActive || mouseMoved
    let colorDirty = !isLight

    const influenceRadiusSq = MOUSE_RADIUS_SQ * 1.25

    for (let i = 0; i < count; i++) {
      const isLogo = logo.cells.has(i)
      const hasFlicker = !isLight && gridFlickers.some((f) => f.index === i && f.until > time)
      const liftBefore = currentLift[i]!
      let targetLift = 0

      if (mouseActive) {
        const dx = baseX[i]! - mouseGridX
        const dy = baseY[i]! - mouseGridY
        const distSq = dx * dx + dy * dy
        if (distSq <= influenceRadiusSq) {
          targetLift = radialInfluence(distSq, MOUSE_RADIUS_SQ) * MAX_LIFT
        }
      } else if (!isLight && liftBefore < LIFT_EPSILON && !isLogo && !hasFlicker) {
        continue
      }

      currentLift[i] = liftBefore + (targetLift - liftBefore) * LIFT_LERP

      const matrixChanged =
        Math.abs(currentLift[i]! - liftBefore) >= 0.0001 || mouseMoved || mouseActive

      if (matrixChanged) {
        setInstanceMatrix(i, currentLift[i]!)
        matrixDirty = true
      }

      if (isLogo) {
        if (!isLight) applyLogoColor(i, currentLift[i]!, time, logo.cells.get(i)!)
      } else if (!isLight && (hasFlicker || matrixChanged || mouseActive)) {
        applyGridFlickerColor(i, currentLift[i]!, time)
      }
    }

    if (matrixDirty) mesh.instanceMatrix.needsUpdate = true
    if (colorDirty && mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    return matrixDirty || colorDirty || mouseActive
  }

  const perf = onStats ? createPerfSampler(onStats) : null

  let raf = 0
  let visible = true
  let startTime = performance.now()
  let lastTickAt = 0
  let tickCount = 0

  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!visible || document.hidden) return

    const now = performance.now()
    if (frameBudgetMs > 0 && now - lastTickAt < frameBudgetMs) return
    lastTickAt = now
    tickCount++

    clock = now - startTime
    const skipHeavyUpdate = lowPower && !mouseActive && tickCount % 2 === 0
    if (!skipHeavyUpdate) {
      updateInstances(clock)
    }
    renderer.render(scene, camera)

    if (perf) {
      const info = renderer.info.render
      perf.tick({
        instances: count,
        triangles: info.triangles,
        drawCalls: info.calls,
      })
    }
  }

  const resize = () => {
    const width = container.clientWidth
    const height = container.clientHeight
    if (width === 0 || height === 0) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    const dpr = lowPower
      ? 1
      : Math.min(window.devicePixelRatio, isNarrow() ? 1 : 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height, false)

    const fovFactor = Math.tan((camera.fov * Math.PI) / 360)
    const visibleHeight = 2 * camera.position.z * fovFactor
    const visibleWidth = visibleHeight * (width / height)
    gridScale =
      Math.max(visibleWidth / (cols * cellSize), visibleHeight / (rows * cellSize)) * 1.06
    gridGroup.scale.setScalar(gridScale)
  }

  const disconnectResize = observeStableContainerResize(container, { onResize: resize })

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true
    },
    { threshold: 0.05 },
  )
  visibilityObserver.observe(container)

  for (let i = 0; i < count; i++) setInstanceMatrix(i, 0)
  mesh.instanceMatrix.needsUpdate = true
  updateInstances(0)
  renderer.render(scene, camera)
  tick()

  const dispose = () => {
    cancelAnimationFrame(raf)
    disconnectResize()
    visibilityObserver.disconnect()
    pointerEl.removeEventListener('mousemove', onMove, true)
    pointerEl.removeEventListener('mouseleave', onLeave)
    pointerEl.removeEventListener('touchstart', onTouchStart, true)
    pointerEl.removeEventListener('touchmove', onTouchMove, true)
    pointerEl.removeEventListener('touchend', onTouchEnd, true)
    pointerEl.removeEventListener('touchcancel', onTouchEnd, true)
    geometry.dispose()
    material.dispose()
    mesh.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }

  return {
    dispose,
    setLighting: (config: SceneLightingConfig) => {
      lightingConfig = { mouse: { ...config.mouse } }
      applyMouseLightParams()
      updateMouseLight()
      renderer.render(scene, camera)
    },
    getLighting: () => ({
      mouse: { ...lightingConfig.mouse },
    }),
    setCubeColor: (hex: string) => {
      if (!applyCubePalette(hex)) return
      if (isLight) {
        renderer.render(scene, camera)
        return
      }
      for (let i = 0; i < count; i++) {
        if (logo.cells.has(i)) continue
        mesh.setColorAt(i, COLOR_REST)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      updateInstances(clock)
      renderer.render(scene, camera)
    },
    getCubeColor: () => cubeColorHex,
    getCols: () => cols,
    getRows: () => rows,
  }
}
