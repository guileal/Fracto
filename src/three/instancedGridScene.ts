import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {
  DEFAULT_SCENE_LIGHTING,
  mergeLighting,
  type SceneLightingConfig,
} from '../lib/gridLighting'
import { createPerfSampler, type PerfStatsListener } from '../lib/perfMonitor'

export interface InstancedGridOptions {
  cols?: number
  rows?: number
  cellSize?: number
  lighting?: SceneLightingConfig
  onStats?: PerfStatsListener
}

export interface InstancedGridHandle {
  dispose: () => void
  setLighting: (config: SceneLightingConfig) => void
  getLighting: () => SceneLightingConfig
  getCols: () => number
  getRows: () => number
}

const DEFAULTS = {
  cols: 16,
  rows: 12,
  cellSize: 1,
} as const

const CUBE_DEPTH = 0.42
/** Bevel discreto nas arestas (proporcional ao tamanho do cubo) */
const BEVEL_RADIUS = 0.042
const BEVEL_SEGMENTS = 2
const MAX_LIFT = 2.15
const MOUSE_RADIUS = 3.6
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS
const LIFT_LERP = 0.13
const MOUSE_LERP = 0.12
const LIFT_EPSILON = 0.004

export function createInstancedGridScene(
  container: HTMLElement,
  options: InstancedGridOptions = {},
): InstancedGridHandle {
  const { cols, rows, cellSize, onStats } = { ...DEFAULTS, ...options }
  let lightingConfig = mergeLighting(
    DEFAULT_SCENE_LIGHTING,
    options.lighting ?? {},
  )
  const count = cols * rows

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200)
  camera.position.set(0, 0, 16)

  const isNarrow = () => container.clientWidth < 768

  const renderer = new THREE.WebGLRenderer({
    antialias: !isNarrow(),
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 1)
  renderer.shadowMap.enabled = false
  container.appendChild(renderer.domElement)

  const hemi = new THREE.HemisphereLight(0x7a828c, 0x101014, 0.7)
  scene.add(hemi)
  scene.add(new THREE.AmbientLight(0x3c3c44, 0.32))

  const key = new THREE.DirectionalLight(0xe8ecf4, 1.15)
  key.position.set(-8, 12, 10)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0x9098a8, 0.38)
  fill.position.set(7, 3, 8)
  scene.add(fill)

  const mouseLight = new THREE.PointLight(
    lightingConfig.mouse.color,
    0,
    lightingConfig.mouse.distance,
    lightingConfig.mouse.decay,
  )

  const geometry = new RoundedBoxGeometry(1, 1, CUBE_DEPTH, BEVEL_SEGMENTS, BEVEL_RADIUS)
  const material = new THREE.MeshPhongMaterial({
    color: 0x282830,
    vertexColors: true,
    specular: 0x505058,
    shininess: 18,
  })

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

  const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3)
  mesh.instanceColor = colorAttr

  const baseX = new Float32Array(count)
  const baseY = new Float32Array(count)
  const currentLift = new Float32Array(count)
  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  const restColor = new THREE.Color(0x282830)
  const liftColor = new THREE.Color(0x5a6270)

  const offsetX = ((cols - 1) * cellSize) / 2
  const offsetY = ((rows - 1) * cellSize) / 2
  const restZ = CUBE_DEPTH * 0.5

  let idx = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      baseX[idx] = col * cellSize - offsetX
      baseY[idx] = row * cellSize - offsetY
      mesh.setColorAt(idx, restColor)
      idx++
    }
  }
  colorAttr.needsUpdate = true

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

  const applyMouseLightParams = () => {
    const m = lightingConfig.mouse
    mouseLight.color.set(m.color)
    mouseLight.distance = m.distance
    mouseLight.decay = m.decay
  }

  const updateMouseLight = () => {
    const m = lightingConfig.mouse
    if (!m.enabled) {
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

  const renderFrame = () => {
    renderer.render(scene, camera)
  }

  applyMouseLightParams()

  const onMove = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    mouseActive = true
    targetNdcX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    targetNdcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  }

  const onLeave = () => {
    mouseActive = false
    updateMouseLight()
  }

  container.addEventListener('mousemove', onMove, { passive: true })
  container.addEventListener('mouseleave', onLeave)

  const radialInfluence = (distSq: number): number => {
    const t = Math.min(1, distSq / MOUSE_RADIUS_SQ)
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

  const setInstanceColor = (i: number, lift: number) => {
    const t = Math.min(1, lift / MAX_LIFT)
    color.copy(restColor).lerp(liftColor, t)
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

  const updateInstances = (): boolean => {
    const mouseMoved = updateMouseOnGrid()
    let matrixDirty = mouseActive || mouseMoved
    let colorDirty = mouseActive

    const influenceRadiusSq = MOUSE_RADIUS_SQ * 1.25

    for (let i = 0; i < count; i++) {
      const liftBefore = currentLift[i]!
      let targetLift = 0

      if (mouseActive) {
        const dx = baseX[i]! - mouseGridX
        const dy = baseY[i]! - mouseGridY
        const distSq = dx * dx + dy * dy
        if (distSq <= influenceRadiusSq) {
          targetLift = radialInfluence(distSq) * MAX_LIFT
        }
      } else if (liftBefore < LIFT_EPSILON) {
        continue
      }

      currentLift[i] = liftBefore + (targetLift - liftBefore) * LIFT_LERP

      if (Math.abs(currentLift[i]! - liftBefore) < 0.0001 && !mouseMoved && !mouseActive) continue

      setInstanceMatrix(i, currentLift[i]!)
      matrixDirty = true
      setInstanceColor(i, currentLift[i]!)
      colorDirty = true
    }

    if (matrixDirty) mesh.instanceMatrix.needsUpdate = true
    if (colorDirty) colorAttr.needsUpdate = true

    return matrixDirty || colorDirty || mouseActive
  }

  const perf = onStats ? createPerfSampler(onStats) : null

  let raf = 0
  let visible = true

  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (!visible) return

    updateInstances()
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
    const dpr = Math.min(window.devicePixelRatio, isNarrow() ? 1 : 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height, false)

    const fovFactor = Math.tan((camera.fov * Math.PI) / 360)
    const visibleHeight = 2 * camera.position.z * fovFactor
    const visibleWidth = visibleHeight * (width / height)
    gridScale =
      Math.max(visibleWidth / (cols * cellSize), visibleHeight / (rows * cellSize)) * 1.06
    gridGroup.scale.setScalar(gridScale)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true
    },
    { threshold: 0.05 },
  )
  visibilityObserver.observe(container)

  for (let i = 0; i < count; i++) setInstanceMatrix(i, 0)
  mesh.instanceMatrix.needsUpdate = true
  renderer.render(scene, camera)

  tick()

  const dispose = () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    visibilityObserver.disconnect()
    container.removeEventListener('mousemove', onMove)
    container.removeEventListener('mouseleave', onLeave)
    geometry.dispose()
    material.dispose()
    mesh.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }

  return {
    dispose,
    setLighting: (config: SceneLightingConfig) => {
      lightingConfig = structuredClone(config)
      applyMouseLightParams()
      updateMouseLight()
      renderFrame()
    },
    getLighting: () => structuredClone(lightingConfig),
    getCols: () => cols,
    getRows: () => rows,
  }
}
