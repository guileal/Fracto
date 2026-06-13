import gsap from 'gsap'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { normalizeHexColor } from '../lib/colorHex'
import {
  applyFractoLogoMaterialProps,
  createFractoLogoPhysicalMaterial,
} from '../lib/fractoLogoMaterial'
import { addFractoLogoLighting } from '../lib/fractoLogoLighting'
import {
  buildIsotipoBrandingLookup,
  buildFragmentAccentLookup,
  FRAGMENT_VISIBLE_THRESHOLD,
  isAccentIsotipoColor,
  isFrontFacePosition,
  isotipoPosKey,
} from '../lib/magicCube2Branding'
import {
  DEFAULT_MAGIC_CUBE_2_CONFIG,
  type MagicCubeConfig,
} from '../lib/magicCube2Config'

const GRID_COORDS = [-1.5, -0.5, 0.5, 1.5] as const
const SLICE_TOLERANCE = 0.1
const CUBE_SIZE = 0.98
const SPACING = 1
const BEVEL_SEGMENTS = 2
const GRID_SIZE = 4
/** Uma volta completa do pivot isométrico (s). */
const PIVOT_SPIN_DURATION = 24

type Axis = 'x' | 'y' | 'z'

/** Giros de fatia antes da explosão (8 movimentos). */
const PRE_EXPLODE_SLICE_SEQUENCE: ReadonlyArray<{
  axis: Axis
  layerIndex: 0 | 1 | 2 | 3
  angle: number
}> = [
  { axis: 'x', layerIndex: 2, angle: Math.PI / 2 },
  { axis: 'y', layerIndex: 3, angle: -Math.PI / 2 },
  { axis: 'z', layerIndex: 3, angle: Math.PI / 2 },
  { axis: 'z', layerIndex: 1, angle: -Math.PI / 2 },
  { axis: 'x', layerIndex: 0, angle: -Math.PI / 2 },
  { axis: 'y', layerIndex: 2, angle: Math.PI / 2 },
  { axis: 'x', layerIndex: 3, angle: Math.PI / 2 },
  { axis: 'y', layerIndex: 1, angle: -Math.PI / 2 },
]

function gridToPosition(ix: number, iy: number, iz: number): THREE.Vector3 {
  return new THREE.Vector3(
    (ix - 1.5) * SPACING,
    (iy - 1.5) * SPACING,
    (iz - 1.5) * SPACING,
  )
}

function waitSeconds(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    gsap.delayedCall(seconds, resolve)
  })
}

function snapToGrid(mesh: THREE.Mesh): void {
  const snapAxis = (value: number): number => {
    let best: number = GRID_COORDS[0]
    let minDist = Math.abs(value - best)
    for (const coord of GRID_COORDS) {
      const dist = Math.abs(value - coord)
      if (dist < minDist) {
        minDist = dist
        best = coord
      }
    }
    return best
  }

  mesh.position.set(
    snapAxis(mesh.position.x),
    snapAxis(mesh.position.y),
    snapAxis(mesh.position.z),
  )
  mesh.rotation.set(0, 0, 0)
}

function createCubeGeometry(bevelRadius: number): RoundedBoxGeometry {
  return new RoundedBoxGeometry(
    CUBE_SIZE,
    CUBE_SIZE,
    CUBE_SIZE,
    BEVEL_SEGMENTS,
    bevelRadius,
  )
}

export class MagicCubeV2Scene {
  private readonly canvas: HTMLCanvasElement
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly layoutGroup = new THREE.Group()
  private readonly isoGroup = new THREE.Group()
  private readonly cubeContainer = new THREE.Group()
  private readonly cubes: THREE.Mesh[] = []
  private cubeGeometry: RoundedBoxGeometry
  private readonly whiteMaterial: THREE.MeshPhysicalMaterial
  private readonly accentMaterial: THREE.MeshPhysicalMaterial
  private readonly pmrem: THREE.PMREMGenerator
  private readonly resizeObserver: ResizeObserver
  private readonly resizeHandler: () => void
  private readonly isotipoLookup = buildIsotipoBrandingLookup()
  private readonly fragmentAccentLookup = buildFragmentAccentLookup()

  private config: MagicCubeConfig
  private pivotSpinTween: gsap.core.Tween | null = null
  private raf = 0
  private disposed = false
  private sequenceRunning = false

  constructor(
    canvas: HTMLCanvasElement,
    initialConfig: MagicCubeConfig = DEFAULT_MAGIC_CUBE_2_CONFIG,
  ) {
    this.canvas = canvas
    this.config = {
      ...initialConfig,
      cubeMaterial: { ...initialConfig.cubeMaterial },
      accentMaterial: { ...initialConfig.accentMaterial },
    }

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    this.applyView()

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.12

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    addFractoLogoLighting(this.scene)

    this.whiteMaterial = createFractoLogoPhysicalMaterial()
    this.accentMaterial = createFractoLogoPhysicalMaterial()
    this.applyMaterials()

    this.cubeGeometry = createCubeGeometry(this.config.bevelRadius)
    this.buildCubeMatrix()

    this.layoutGroup.name = 'layoutGroup'
    this.isoGroup.name = 'isoGroup'
    this.cubeContainer.name = 'cubeContainer'

    this.scene.add(this.layoutGroup)
    this.layoutGroup.add(this.isoGroup)
    this.isoGroup.add(this.cubeContainer)
    this.applyLayout()
    this.applyView()

    this.resizeHandler = () => this.resize()
    this.resizeObserver = new ResizeObserver(this.resizeHandler)
    const parent = canvas.parentElement
    if (parent) {
      this.resizeObserver.observe(parent)
    } else {
      window.addEventListener('resize', this.resizeHandler)
    }

    this.resize()
    this.animate()
    void this.runMasterLoop()
  }

  applyConfig(partial: Partial<MagicCubeConfig>): void {
    const prevBevel = this.config.bevelRadius
    this.config = {
      ...this.config,
      ...partial,
      cubeColor:
        normalizeHexColor(partial.cubeColor ?? this.config.cubeColor) ?? this.config.cubeColor,
      accentColor:
        normalizeHexColor(partial.accentColor ?? this.config.accentColor)
        ?? this.config.accentColor,
      cubeMaterial: { ...this.config.cubeMaterial, ...partial.cubeMaterial },
      accentMaterial: { ...this.config.accentMaterial, ...partial.accentMaterial },
    }

    if (this.config.bevelRadius !== prevBevel) {
      this.cubeGeometry.dispose()
      this.cubeGeometry = createCubeGeometry(this.config.bevelRadius)
      for (const mesh of this.cubes) {
        mesh.geometry = this.cubeGeometry
      }
    }

    this.applyMaterials()
    this.applyLayout()
    this.applyView()
  }

  getConfig(): MagicCubeConfig {
    return {
      ...this.config,
      cubeMaterial: { ...this.config.cubeMaterial },
      accentMaterial: { ...this.config.accentMaterial },
    }
  }

  /**
   * Grid 4×4×4 completo — fragmentação definida uma vez e travada em userData.initial*.
   */
  private buildCubeMatrix(): void {
    for (let iz = 0; iz < GRID_SIZE; iz++) {
      for (let iy = 0; iy < GRID_SIZE; iy++) {
        for (let ix = 0; ix < GRID_SIZE; ix++) {
          const mesh = new THREE.Mesh(this.cubeGeometry, this.whiteMaterial)
          mesh.position.copy(gridToPosition(ix, iy, iz))

          const posKey = isotipoPosKey(mesh.position.x, mesh.position.y, mesh.position.z)

          if (isFrontFacePosition(mesh.position.z)) {
            const brandColor = this.isotipoLookup.get(posKey)
            if (brandColor !== undefined) {
              mesh.scale.set(1, 1, 1)
              mesh.material = isAccentIsotipoColor(brandColor)
                ? this.accentMaterial
                : this.whiteMaterial
            } else {
              mesh.scale.set(0, 0, 0)
            }
          } else if (this.fragmentAccentLookup.has(posKey)) {
            mesh.scale.set(1, 1, 1)
            mesh.material = this.accentMaterial
          } else if (Math.random() > FRAGMENT_VISIBLE_THRESHOLD) {
            mesh.scale.set(1, 1, 1)
            mesh.material = this.whiteMaterial
          } else {
            mesh.scale.set(0, 0, 0)
          }

          mesh.userData.initialPos = mesh.position.clone()
          mesh.userData.initialRot = mesh.rotation.clone()
          mesh.userData.initialScale = mesh.scale.clone()

          this.cubeContainer.add(mesh)
          this.cubes.push(mesh)
        }
      }
    }
  }

  private isBlockVisible(mesh: THREE.Mesh): boolean {
    const initialScale = mesh.userData.initialScale as THREE.Vector3
    return initialScale.x > 0
  }

  private applyLayout(): void {
    this.layoutGroup.scale.setScalar(this.config.scale)
    this.layoutGroup.position.set(this.config.offsetX, this.config.offsetY, 0)
  }

  private applyView(): void {
    this.isoGroup.rotation.set(
      this.config.pivotRotX,
      this.config.pivotRotY,
      this.config.pivotRotZ,
    )
    this.camera.position.set(this.config.cameraX, this.config.cameraY, this.config.cameraZ)
    this.camera.lookAt(0, 0, 0)
    this.startPivotSpin()
  }

  /** Rotação contínua em Y sobre o tilt isométrico da config. */
  private startPivotSpin(): void {
    this.pivotSpinTween?.kill()
    this.pivotSpinTween = gsap.to(this.isoGroup.rotation, {
      y: `+=${Math.PI * 2}`,
      duration: PIVOT_SPIN_DURATION,
      ease: 'none',
      repeat: -1,
    })
  }

  private applyMaterials(): void {
    applyFractoLogoMaterialProps(this.whiteMaterial, this.config.cubeMaterial, this.config.cubeColor)
    applyFractoLogoMaterialProps(
      this.accentMaterial,
      this.config.accentMaterial,
      this.config.accentColor,
      this.config.accentColor,
    )
  }

  /** Gira uma fatia do cubo mágico via pivot group temporário. */
  async rotateSlice(
    axis: Axis,
    layerCoord: number,
    angle: number,
    duration = this.config.sliceDuration,
  ): Promise<void> {
    if (this.disposed) return

    const blocks = this.cubes.filter(
      (mesh) =>
        this.isBlockVisible(mesh)
        && Math.abs(mesh.position[axis] - layerCoord) <= SLICE_TOLERANCE,
    )
    if (blocks.length === 0) return

    const pivot = new THREE.Group()
    pivot.name = 'slicePivot'
    this.cubeContainer.add(pivot)

    for (const mesh of blocks) {
      pivot.attach(mesh)
    }

    pivot.rotation.set(0, 0, 0)

    await new Promise<void>((resolve) => {
      gsap.to(pivot.rotation, {
        [axis]: angle,
        duration,
        ease: 'power2.inOut',
        onComplete: () => {
          for (const mesh of blocks) {
            this.cubeContainer.attach(mesh)
            snapToGrid(mesh)
          }
          this.cubeContainer.remove(pivot)
          pivot.rotation.set(0, 0, 0)
          resolve()
        },
      })
    })
  }

  /** Explode blocos visíveis e devolve todos ao estado inicial travado. */
  async explodeAndReset(): Promise<void> {
    if (this.disposed) return

    const explodeDuration = this.config.explodeDuration

    await new Promise<void>((resolve) => {
      const timeline = gsap.timeline({ onComplete: resolve })

      for (const mesh of this.cubes) {
        if (!this.isBlockVisible(mesh)) continue

        const factor = 1.2 + Math.random() * 0.8
        const target = mesh.position.clone().multiplyScalar(factor)

        timeline.to(
          mesh.position,
          {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: explodeDuration,
            ease: 'power2.out',
          },
          0,
        )
      }
    })

    if (this.disposed) return

    const resetDuration = this.config.resetDuration

    await new Promise<void>((resolve) => {
      const timeline = gsap.timeline({ onComplete: resolve })

      for (const mesh of this.cubes) {
        const initialPos = mesh.userData.initialPos as THREE.Vector3
        const initialRot = mesh.userData.initialRot as THREE.Euler
        const initialScale = mesh.userData.initialScale as THREE.Vector3

        timeline.to(
          mesh.position,
          {
            x: initialPos.x,
            y: initialPos.y,
            z: initialPos.z,
            duration: resetDuration,
            ease: 'power2.inOut',
          },
          0,
        )

        timeline.to(
          mesh.rotation,
          {
            x: initialRot.x,
            y: initialRot.y,
            z: initialRot.z,
            duration: resetDuration,
            ease: 'power2.inOut',
          },
          0,
        )

        timeline.to(
          mesh.scale,
          {
            x: initialScale.x,
            y: initialScale.y,
            z: initialScale.z,
            duration: resetDuration,
            ease: 'power2.inOut',
          },
          0,
        )
      }
    })
  }

  private async runMasterLoop(): Promise<void> {
    if (this.sequenceRunning || this.disposed) return
    this.sequenceRunning = true

    while (!this.disposed) {
      await waitSeconds(this.config.waitStart)
      if (this.disposed) break

      for (const move of PRE_EXPLODE_SLICE_SEQUENCE) {
        await this.rotateSlice(
          move.axis,
          GRID_COORDS[move.layerIndex]!,
          move.angle,
          this.config.sliceDuration,
        )
        if (this.disposed) break
      }
      if (this.disposed) break

      await waitSeconds(this.config.waitBeforeExplode)
      if (this.disposed) break

      await this.explodeAndReset()
    }

    this.sequenceRunning = false
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
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.animate)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.pivotSpinTween?.kill()
    gsap.killTweensOf(this.isoGroup.rotation)
    gsap.killTweensOf(this.cubes.map((mesh) => [mesh.position, mesh.rotation, mesh.scale]).flat())
    gsap.killTweensOf(this.scene.children)

    this.resizeObserver.disconnect()
    window.removeEventListener('resize', this.resizeHandler)

    for (const mesh of this.cubes) {
      this.cubeContainer.remove(mesh)
    }

    this.cubeGeometry.dispose()
    this.whiteMaterial.dispose()
    this.accentMaterial.dispose()
    this.scene.environment?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
