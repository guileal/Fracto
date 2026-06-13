import gsap from 'gsap'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { normalizeHexColor } from '../lib/colorHex'
import { addFractoLogoLighting } from '../lib/fractoLogoLighting'
import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  type MagicCubeConfig,
  type MagicCubeMaterialConfig,
} from '../lib/magicCubeConfig'

const GRID_COORDS = [-1.5, -0.5, 0.5, 1.5] as const
const SLICE_TOLERANCE = 0.1
const CUBE_SIZE = 0.98
const SPACING = 1
const BEVEL_SEGMENTS = 2
/** Câmera fixa — layout usa só scale/offset no cubo (como /logo-fracto-light). */
const CAMERA_Y = 0.2
const CAMERA_Z = 11

/** Face frontal do isotipo Fracto — linha 0 = topo, col 0 = esquerda. */
const FRONT_PATTERN = [
  ['-', 'B', '-', 'O'],
  ['B', '-', '-', '-'],
  ['B', '-', '-', 'B'],
  ['-', 'B', 'B', '-'],
] as const

/** Grid 3D: iy=0 → y baixo; padrão 2D: linha 0 → topo. */
function patternRowFromGrid(iy: number): number {
  return 3 - iy
}

function frontCellAt(ix: number, iy: number): (typeof FRONT_PATTERN)[number][number] {
  return FRONT_PATTERN[patternRowFromGrid(iy)]![ix]!
}

type Axis = 'x' | 'y' | 'z'

function isShell(ix: number, iy: number, iz: number): boolean {
  return ix === 0 || ix === 3 || iy === 0 || iy === 3 || iz === 0 || iz === 3
}

function shouldIncludeBlock(ix: number, iy: number, iz: number): boolean {
  if (!isShell(ix, iy, iz)) return false

  const frontCell = frontCellAt(ix, iy)
  if (frontCell === '-') return false

  return true
}

function gridToPosition(ix: number, iy: number, iz: number): THREE.Vector3 {
  return new THREE.Vector3(
    (ix - 1.5) * SPACING,
    (iy - 1.5) * SPACING,
    (iz - 1.5) * SPACING,
  )
}

function isAccentBlock(ix: number, iy: number, iz: number): boolean {
  return ix === 3 && iy === 3 && iz === 3
}

function waitSeconds(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    gsap.delayedCall(seconds, resolve)
  })
}

function roundPosition(mesh: THREE.Mesh): void {
  mesh.position.x = Math.round(mesh.position.x * 10) / 10
  mesh.position.y = Math.round(mesh.position.y * 10) / 10
  mesh.position.z = Math.round(mesh.position.z * 10) / 10
}

function applyMaterialProps(
  material: THREE.MeshPhysicalMaterial,
  props: MagicCubeMaterialConfig,
  color: string,
  emissiveColor?: string,
): void {
  material.color.setStyle(color)
  material.roughness = props.roughness
  material.clearcoat = props.clearcoat
  material.clearcoatRoughness = Math.min(props.roughness + 0.08, 0.95)
  material.reflectivity = THREE.MathUtils.lerp(0.85, 0.15, props.roughness)
  material.envMapIntensity = props.envMapIntensity
  material.emissiveIntensity = props.emissiveIntensity
  if (emissiveColor && props.emissiveIntensity > 0) {
    material.emissive.setStyle(emissiveColor)
  } else {
    material.emissive.setHex(0x000000)
  }
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

function createPhysicalMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    emissive: 0x000000,
  })
}

export class MagicCubeV8Scene {
  private readonly canvas: HTMLCanvasElement
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly cubeContainer = new THREE.Group()
  private readonly cubes: THREE.Mesh[] = []
  private cubeGeometry: RoundedBoxGeometry
  private readonly whiteMaterial: THREE.MeshPhysicalMaterial
  private readonly accentMaterial: THREE.MeshPhysicalMaterial
  private readonly pmrem: THREE.PMREMGenerator
  private readonly resizeObserver: ResizeObserver
  private readonly resizeHandler: () => void

  private config: MagicCubeConfig
  private raf = 0
  private disposed = false
  private sequenceRunning = false

  constructor(
    canvas: HTMLCanvasElement,
    initialConfig: MagicCubeConfig = DEFAULT_MAGIC_CUBE_CONFIG,
  ) {
    this.canvas = canvas
    this.config = {
      ...initialConfig,
      cubeMaterial: { ...initialConfig.cubeMaterial },
      accentMaterial: { ...initialConfig.accentMaterial },
    }

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    this.camera.position.set(0, CAMERA_Y, CAMERA_Z)
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
    this.renderer.toneMappingExposure = 1.12

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    addFractoLogoLighting(this.scene)

    this.whiteMaterial = createPhysicalMaterial()
    this.accentMaterial = createPhysicalMaterial()
    this.applyMaterials()

    this.cubeGeometry = createCubeGeometry(this.config.bevelRadius)
    this.buildCubeMatrix()
    this.scene.add(this.cubeContainer)
    this.applyLayout()

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
  }

  getConfig(): MagicCubeConfig {
    return {
      ...this.config,
      cubeMaterial: { ...this.config.cubeMaterial },
      accentMaterial: { ...this.config.accentMaterial },
    }
  }

  private applyLayout(): void {
    this.cubeContainer.scale.setScalar(this.config.scale)
    this.cubeContainer.position.set(this.config.offsetX, this.config.offsetY, 0)
  }

  private applyMaterials(): void {
    applyMaterialProps(this.whiteMaterial, this.config.cubeMaterial, this.config.cubeColor)
    applyMaterialProps(
      this.accentMaterial,
      this.config.accentMaterial,
      this.config.accentColor,
      this.config.accentColor,
    )
  }

  private buildCubeMatrix(): void {
    for (let iz = 0; iz < 4; iz++) {
      for (let iy = 0; iy < 4; iy++) {
        for (let ix = 0; ix < 4; ix++) {
          if (!shouldIncludeBlock(ix, iy, iz)) continue

          const mesh = new THREE.Mesh(
            this.cubeGeometry,
            isAccentBlock(ix, iy, iz) ? this.accentMaterial : this.whiteMaterial,
          )
          mesh.position.copy(gridToPosition(ix, iy, iz))
          mesh.userData.originalPos = mesh.position.clone()
          mesh.userData.originalRot = mesh.rotation.clone()

          this.cubeContainer.add(mesh)
          this.cubes.push(mesh)
        }
      }
    }
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
      (mesh) => Math.abs(mesh.position[axis] - layerCoord) <= SLICE_TOLERANCE,
    )
    if (blocks.length === 0) return

    const pivot = new THREE.Group()
    pivot.name = 'slicePivot'
    this.scene.add(pivot)

    for (const mesh of blocks) {
      pivot.attach(mesh)
    }

    pivot.rotation[axis] = 0

    await new Promise<void>((resolve) => {
      gsap.to(pivot.rotation, {
        [axis]: angle,
        duration,
        ease: 'power2.inOut',
        onComplete: () => {
          for (const mesh of blocks) {
            this.cubeContainer.attach(mesh)
            roundPosition(mesh)
          }
          this.scene.remove(pivot)
          resolve()
        },
      })
    })
  }

  /** Explode as peças e devolve-as à pose inicial guardada em userData. */
  async explodeAndReset(): Promise<void> {
    if (this.disposed) return

    const explodeDuration = this.config.explodeDuration

    await new Promise<void>((resolve) => {
      const timeline = gsap.timeline({ onComplete: resolve })

      for (const mesh of this.cubes) {
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

        timeline.to(
          mesh.rotation,
          {
            x: (Math.random() - 0.5) * Math.PI,
            y: (Math.random() - 0.5) * Math.PI,
            z: (Math.random() - 0.5) * Math.PI,
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
        const originalPos = mesh.userData.originalPos as THREE.Vector3
        const originalRot = mesh.userData.originalRot as THREE.Euler

        timeline.to(
          mesh.position,
          {
            x: originalPos.x,
            y: originalPos.y,
            z: originalPos.z,
            duration: resetDuration,
            ease: 'power2.inOut',
          },
          0,
        )

        timeline.to(
          mesh.rotation,
          {
            x: originalRot.x,
            y: originalRot.y,
            z: originalRot.z,
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

    const lateralLayer = GRID_COORDS[2]!
    const topLayer = GRID_COORDS[3]!
    const frontLayer = GRID_COORDS[3]!

    while (!this.disposed) {
      await waitSeconds(this.config.waitStart)
      if (this.disposed) break

      await this.rotateSlice('x', lateralLayer, Math.PI / 2, this.config.sliceDuration)
      if (this.disposed) break

      await this.rotateSlice('y', topLayer, -Math.PI / 2, this.config.sliceDuration)
      if (this.disposed) break

      await this.rotateSlice('z', frontLayer, Math.PI / 2, this.config.sliceDuration)
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
    gsap.killTweensOf(this.cubes.map((mesh) => [mesh.position, mesh.rotation]).flat())
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
