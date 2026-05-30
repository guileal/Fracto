import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  ACCENT_CUBE_INDEX,
  CUBE_COUNT,
  MAGIC_CUBE_STATES,
  type Vec3,
} from './magicCubeStates'

const CUBE_SIZE = 0.48
const BEVEL_RADIUS = 0.012
const BEVEL_SEGMENTS = 2

/** Mesmo preto do fundo da hero /v5 */
const COLOR_CUBE = new THREE.Color(0x000000)
const COLOR_ACCENT = new THREE.Color(0xf55e1d)

const _color = new THREE.Color()

const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _lerped = new THREE.Vector3()

const HOLD_SECONDS = 3.2
const TRANSITION_SECONDS = 2.8

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function lerpVec3(out: THREE.Vector3, a: Vec3, b: Vec3, t: number): THREE.Vector3 {
  return out.set(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  )
}

export class MagicCubeScene {
  private readonly canvas: HTMLCanvasElement
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly mesh: THREE.InstancedMesh
  private readonly group = new THREE.Group()
  private readonly pmrem: THREE.PMREMGenerator
  private readonly clock = new THREE.Clock()
  private readonly resizeHandler: () => void

  private raf = 0
  private disposed = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    this.camera.position.set(0, 0.15, 4.2)
    this.camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.08

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.setupLighting()

    const geometry = new RoundedBoxGeometry(
      CUBE_SIZE,
      CUBE_SIZE,
      CUBE_SIZE,
      BEVEL_SEGMENTS,
      BEVEL_RADIUS,
    )
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.94,
      metalness: 0,
      vertexColors: true,
      envMapIntensity: 0.12,
    })

    this.mesh = new THREE.InstancedMesh(geometry, material, CUBE_COUNT)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    for (let i = 0; i < CUBE_COUNT; i++) {
      _color.copy(i === ACCENT_CUBE_INDEX ? COLOR_ACCENT : COLOR_CUBE)
      this.mesh.setColorAt(i, _color)
    }
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true
    }

    this.group.add(this.mesh)
    this.group.rotation.x = -0.14
    this.group.rotation.y = 0.22
    this.scene.add(this.group)

    this.resizeHandler = () => this.resize()
    window.addEventListener('resize', this.resizeHandler)
    this.resize()

    this.animate()
  }

  private setupLighting(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55))

    const key = new THREE.DirectionalLight(0xffffff, 0.85)
    key.position.set(-4.5, 6, 5)
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0xe8eaef, 0.35)
    fill.position.set(5, 2.5, -2)
    this.scene.add(fill)
  }

  private getTransitionBlend(elapsed: number): { from: number; to: number; t: number } {
    const block = HOLD_SECONDS + TRANSITION_SECONDS
    const cycle = block * MAGIC_CUBE_STATES.length
    const cycleT = elapsed % cycle
    const stateIndex = Math.floor(cycleT / block) % MAGIC_CUBE_STATES.length
    const localT = cycleT % block

    if (localT <= HOLD_SECONDS) {
      return { from: stateIndex, to: stateIndex, t: 0 }
    }

    const blend = easeInOutCubic((localT - HOLD_SECONDS) / TRANSITION_SECONDS)
    return {
      from: stateIndex,
      to: (stateIndex + 1) % MAGIC_CUBE_STATES.length,
      t: blend,
    }
  }

  private updateInstances(elapsed: number): void {
    const { from, to, t } = this.getTransitionBlend(elapsed)
    const fromState = MAGIC_CUBE_STATES[from]!
    const toState = MAGIC_CUBE_STATES[to]!

    const floatY = Math.sin(elapsed * 0.55) * 0.04

    for (let i = 0; i < CUBE_COUNT; i++) {
      const a = fromState.positions[i]!
      const b = toState.positions[i]!
      lerpVec3(_lerped, a, b, from === to ? 0 : t)

      _position.set(_lerped.x, _lerped.y + floatY, _lerped.z)
      _matrix.compose(_position, _quaternion, _scale)
      this.mesh.setMatrixAt(i, _matrix)
    }

    this.mesh.instanceMatrix.needsUpdate = true
    this.group.rotation.y = 0.22 + Math.sin(elapsed * 0.28) * 0.08
  }

  private resize(): void {
    const parent = this.canvas.parentElement
    const width = parent?.clientWidth ?? window.innerWidth
    const height = parent?.clientHeight ?? window.innerHeight
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(width, height, false)
  }

  private animate = (): void => {
    if (this.disposed) return

    const elapsed = this.clock.getElapsedTime()
    this.updateInstances(elapsed)
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.animate)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resizeHandler)

    this.mesh.geometry.dispose()
    const mat = this.mesh.material
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat.dispose()

    this.scene.environment?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
