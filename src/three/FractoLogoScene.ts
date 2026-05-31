import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { normalizeHexColor } from '../lib/colorHex'
import {
  DEFAULT_FRACTO_LOGO_CONFIG,
  type FractoLogoConfig,
  type FractoLogoMaterialConfig,
} from '../lib/fractoLogoConfig'
import {
  ACCENT_CUBE_INDEX,
  CUBE_COUNT,
  FRACTO_LOGO_STATES,
  type FractoLogoState,
  type Vec3,
} from './fractoLogoStates'

const CUBE_SIZE = 0.48
const BEVEL_SEGMENTS = 2
const GROUP_TILT_X = -0.16
const SPIN_SPEED_Y = 0.42

/** Índices dos cubos pretos (todos exceto o de destaque) */
const REGULAR_CUBE_INDICES = Array.from({ length: CUBE_COUNT }, (_, i) => i).filter(
  (i) => i !== ACCENT_CUBE_INDEX,
)

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

function createCubeGeometry(bevelRadius: number): RoundedBoxGeometry {
  return new RoundedBoxGeometry(
    CUBE_SIZE,
    CUBE_SIZE,
    CUBE_SIZE,
    BEVEL_SEGMENTS,
    bevelRadius,
  )
}

function applyMaterialProps(
  material: THREE.MeshPhysicalMaterial,
  props: FractoLogoMaterialConfig,
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

function createPhysicalMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    emissive: 0x000000,
  })
}

export class FractoLogoScene {
  private readonly canvas: HTMLCanvasElement
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly regularMesh: THREE.InstancedMesh
  private readonly accentMesh: THREE.InstancedMesh
  private readonly regularMaterial: THREE.MeshPhysicalMaterial
  private readonly accentMaterial: THREE.MeshPhysicalMaterial
  private readonly group = new THREE.Group()
  private readonly pmrem: THREE.PMREMGenerator
  private readonly clock = new THREE.Clock()
  private readonly resizeHandler: () => void

  private config: FractoLogoConfig
  private raf = 0
  private disposed = false

  constructor(canvas: HTMLCanvasElement, initialConfig: FractoLogoConfig = DEFAULT_FRACTO_LOGO_CONFIG) {
    this.canvas = canvas
    this.config = { ...initialConfig }

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
    this.renderer.toneMappingExposure = 1.12

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.setupLighting()

    const geometry = createCubeGeometry(this.config.bevelRadius)

    this.regularMaterial = createPhysicalMaterial()
    this.accentMaterial = createPhysicalMaterial()

    this.regularMesh = new THREE.InstancedMesh(
      geometry,
      this.regularMaterial,
      REGULAR_CUBE_INDICES.length,
    )
    this.accentMesh = new THREE.InstancedMesh(geometry, this.accentMaterial, 1)

    this.regularMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.accentMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    this.applyMaterials()

    this.group.add(this.regularMesh)
    this.group.add(this.accentMesh)
    this.group.rotation.x = GROUP_TILT_X
    this.scene.add(this.group)

    this.applyLayout()

    this.resizeHandler = () => this.resize()
    window.addEventListener('resize', this.resizeHandler)
    this.resize()

    this.animate()
  }

  applyConfig(partial: Partial<FractoLogoConfig>): void {
    const prevBevel = this.config.bevelRadius
    this.config = {
      ...this.config,
      ...partial,
      cubeColor: normalizeHexColor(partial.cubeColor ?? this.config.cubeColor) ?? this.config.cubeColor,
      accentColor:
        normalizeHexColor(partial.accentColor ?? this.config.accentColor) ?? this.config.accentColor,
      cubeMaterial: { ...this.config.cubeMaterial, ...partial.cubeMaterial },
      accentMaterial: { ...this.config.accentMaterial, ...partial.accentMaterial },
    }

    if (this.config.bevelRadius !== prevBevel) {
      const geometry = createCubeGeometry(this.config.bevelRadius)
      this.regularMesh.geometry.dispose()
      this.accentMesh.geometry.dispose()
      this.regularMesh.geometry = geometry
      this.accentMesh.geometry = geometry.clone()
    }

    this.applyMaterials()
    this.applyLayout()
  }

  getConfig(): FractoLogoConfig {
    return { ...this.config }
  }

  private applyLayout(): void {
    this.group.scale.setScalar(this.config.scale)
    this.group.position.set(this.config.offsetX, this.config.offsetY, 0)
  }

  private applyMaterials(): void {
    applyMaterialProps(
      this.regularMaterial,
      this.config.cubeMaterial,
      this.config.cubeColor,
    )
    applyMaterialProps(
      this.accentMaterial,
      this.config.accentMaterial,
      this.config.accentColor,
      this.config.accentColor,
    )
  }

  private setupLighting(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.42))
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xc8ccd8, 0.38))

    const key = new THREE.DirectionalLight(0xfff8f2, 1.15)
    key.position.set(-5, 7, 6)
    this.scene.add(key)

    const fill = new THREE.DirectionalLight(0xd8dce8, 0.48)
    fill.position.set(6, 2, 4)
    this.scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffffff, 0.35)
    rim.position.set(2, 3, -6)
    this.scene.add(rim)
  }

  private getTransitionBlend(elapsed: number): { from: number; to: number; t: number } {
    const block = HOLD_SECONDS + TRANSITION_SECONDS
    const cycle = block * FRACTO_LOGO_STATES.length
    const cycleT = elapsed % cycle
    const stateIndex = Math.floor(cycleT / block) % FRACTO_LOGO_STATES.length
    const localT = cycleT % block

    if (localT <= HOLD_SECONDS) {
      return { from: stateIndex, to: stateIndex, t: 0 }
    }

    const blend = easeInOutCubic((localT - HOLD_SECONDS) / TRANSITION_SECONDS)
    return {
      from: stateIndex,
      to: (stateIndex + 1) % FRACTO_LOGO_STATES.length,
      t: blend,
    }
  }

  private cubePosition(
    cubeIndex: number,
    fromState: FractoLogoState,
    toState: FractoLogoState,
    blend: number,
    floatY: number,
  ): THREE.Vector3 {
    const a = fromState.positions[cubeIndex]!
    const b = toState.positions[cubeIndex]!
    lerpVec3(_lerped, a, b, blend)
    return _position.set(_lerped.x, _lerped.y + floatY, _lerped.z)
  }

  private updateInstances(elapsed: number): void {
    const { from, to, t } = this.getTransitionBlend(elapsed)
    const fromState = FRACTO_LOGO_STATES[from]!
    const toState = FRACTO_LOGO_STATES[to]!
    const blend = from === to ? 0 : t
    const floatY = Math.sin(elapsed * 0.55) * 0.04

    REGULAR_CUBE_INDICES.forEach((cubeIndex, instanceIndex) => {
      this.cubePosition(cubeIndex, fromState, toState, blend, floatY)
      _matrix.compose(_position, _quaternion, _scale)
      this.regularMesh.setMatrixAt(instanceIndex, _matrix)
    })

    this.cubePosition(ACCENT_CUBE_INDEX, fromState, toState, blend, floatY)
    _matrix.compose(_position, _quaternion, _scale)
    this.accentMesh.setMatrixAt(0, _matrix)

    this.regularMesh.instanceMatrix.needsUpdate = true
    this.accentMesh.instanceMatrix.needsUpdate = true
    this.group.rotation.y = elapsed * SPIN_SPEED_Y
    this.group.rotation.z = Math.sin(elapsed * 0.35) * 0.06
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

    this.regularMesh.geometry.dispose()
    this.accentMesh.geometry.dispose()
    this.regularMaterial.dispose()
    this.accentMaterial.dispose()
    this.scene.environment?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
