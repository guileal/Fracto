import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  PATTERN_ISOTIPO,
  VOXEL_FACE_SEQUENCE,
  voxelFaces,
  type VoxelFace,
} from './voxelStates'

const GRID_OFFSETS = [-1.5, -0.5, 0.5, 1.5] as const
const SHELL_COUNT = 56
const PIECE_SIZE = 1
const BEVEL = 0.06
const ROTATION_FRAMES = 20
const SLICE_EPS = 0.08
const COLOR_WHITE = new THREE.Color('#ffffff')
const COLOR_ORANGE = new THREE.Color('#ff7300')

type Axis = 'x' | 'y' | 'z'

interface PieceState {
  ix: number
  iy: number
  iz: number
  matrix: THREE.Matrix4
}

const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _rot = new THREE.Matrix4()
const _axis = new THREE.Vector3()

function isShell(ix: number, iy: number, iz: number): boolean {
  const inner =
    ix >= 1 && ix <= 2 && iy >= 1 && iy <= 2 && iz >= 1 && iz <= 2
  return !inner
}

function gridToPosition(ix: number, iy: number, iz: number): THREE.Vector3 {
  return new THREE.Vector3(ix - 1.5, iy - 1.5, iz - 1.5)
}

function snapComponent(value: number): number {
  let best: number = GRID_OFFSETS[0]
  let min = Math.abs(value - best)
  for (const g of GRID_OFFSETS) {
    const d = Math.abs(value - g)
    if (d < min) {
      min = d
      best = g
    }
  }
  return best
}

function snapVector(target: THREE.Vector3): THREE.Vector3 {
  return target.set(
    snapComponent(target.x),
    snapComponent(target.y),
    snapComponent(target.z),
  )
}

function positionToGrid(p: THREE.Vector3): Pick<PieceState, 'ix' | 'iy' | 'iz'> {
  return {
    ix: THREE.MathUtils.clamp(Math.round(p.x + 1.5), 0, 3),
    iy: THREE.MathUtils.clamp(Math.round(p.y + 1.5), 0, 3),
    iz: THREE.MathUtils.clamp(Math.round(p.z + 1.5), 0, 3),
  }
}

function axisVector(axis: Axis): THREE.Vector3 {
  if (axis === 'x') return _axis.set(1, 0, 0)
  if (axis === 'y') return _axis.set(0, 1, 0)
  return _axis.set(0, 0, 1)
}

export class MagicCubeV8Scene {
  private readonly canvas: HTMLCanvasElement
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly renderer: THREE.WebGLRenderer
  private readonly mesh: THREE.InstancedMesh
  private readonly pieces: PieceState[] = []
  private readonly pmrem: THREE.PMREMGenerator
  private readonly clock = new THREE.Clock()
  private readonly resizeHandler: () => void

  private raf = 0
  private disposed = false
  private isAnimating = false
  private patternIndex = 0
  private activePattern: VoxelFace = PATTERN_ISOTIPO

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    this.camera.position.set(4.2, 3.4, 6.8)
    this.camera.lookAt(0, 0, 0)

    this.scene.background = null

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    this.setupLighting()

    const geometry = new RoundedBoxGeometry(
      PIECE_SIZE,
      PIECE_SIZE,
      PIECE_SIZE,
      2,
      BEVEL,
    )

    const material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      metalness: 0,
      roughness: 0.45,
      clearcoat: 0.12,
    })

    this.mesh = new THREE.InstancedMesh(geometry, material, SHELL_COUNT)
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    const colors = new Float32Array(SHELL_COUNT * 3)
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3)
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)

    this.scene.add(this.mesh)

    let instance = 0
    for (let iz = 0; iz < 4; iz++) {
      for (let iy = 0; iy < 4; iy++) {
        for (let ix = 0; ix < 4; ix++) {
          if (!isShell(ix, iy, iz)) continue
          const matrix = new THREE.Matrix4().compose(
            gridToPosition(ix, iy, iz),
            _quat.identity(),
            _scale.set(1, 1, 1),
          )
          this.pieces.push({ ix, iy, iz, matrix })
          this.mesh.setMatrixAt(instance, matrix)
          this.setInstanceColor(instance, COLOR_WHITE)
          instance++
        }
      }
    }

    this.applyFacePattern(this.activePattern)
    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true

    this.resizeHandler = () => this.resize()
    window.addEventListener('resize', this.resizeHandler)
    this.resize()
    this.animate()
  }

  private setupLighting(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const key = new THREE.DirectionalLight(0xffffff, 1.1)
    key.position.set(-4, 6, 5)
    this.scene.add(key)
    const fill = new THREE.DirectionalLight(0xc8d0e0, 0.45)
    fill.position.set(5, 1, 3)
    this.scene.add(fill)
  }

  private setInstanceColor(index: number, color: THREE.Color): void {
    this.mesh.instanceColor!.setXYZ(index, color.r, color.g, color.b)
  }

  private getSlice(axis: Axis, value: number): number[] {
    const indices: number[] = []
    const key = axis === 'x' ? 'x' : axis === 'y' ? 'y' : 'z'

    this.pieces.forEach((piece, i) => {
      piece.matrix.decompose(_pos, _quat, _scale)
      if (Math.abs(_pos[key] - value) <= SLICE_EPS) indices.push(i)
    })

    return indices
  }

  private flushMatricesToMesh(): void {
    this.pieces.forEach((piece, i) => {
      this.mesh.setMatrixAt(i, piece.matrix)
    })
    this.mesh.instanceMatrix.needsUpdate = true
  }

  private snapSliceMatrices(sliceIndices: number[]): void {
    for (const i of sliceIndices) {
      const piece = this.pieces[i]!
      piece.matrix.decompose(_pos, _quat, _scale)
      snapVector(_pos)
      const grid = positionToGrid(_pos)
      piece.ix = grid.ix
      piece.iy = grid.iy
      piece.iz = grid.iz
      piece.matrix.compose(_pos, _quat, _scale.set(1, 1, 1))
    }
  }

  private async animateSlice(axis: Axis, value: number, direction: 1 | -1): Promise<void> {
    const slice = this.getSlice(axis, value)
    if (slice.length === 0) return

    const startMatrices = slice.map((i) => this.pieces[i]!.matrix.clone())
    const axisVec = axisVector(axis)
    const targetAngle = direction * (Math.PI / 2)

    for (let frame = 1; frame <= ROTATION_FRAMES; frame++) {
      const t = frame / ROTATION_FRAMES
      const angle = targetAngle * t
      _rot.makeRotationAxis(axisVec, angle)

      slice.forEach((pieceIndex, k) => {
        const piece = this.pieces[pieceIndex]!
        piece.matrix.copy(startMatrices[k]!)
        piece.matrix.premultiply(_rot)
      })

      this.flushMatricesToMesh()
      await this.waitFrame()
    }

    this.snapSliceMatrices(slice)
    this.flushMatricesToMesh()
    this.applyFacePattern(this.activePattern)
  }

  private waitFrame(): Promise<void> {
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve())
    })
  }

  /** Aplica padrão 4×4 na face frontal (+Z). */
  applyFacePattern(pattern: VoxelFace): void {
    this.activePattern = pattern

    this.pieces.forEach((piece, instance) => {
      const onFront = piece.iz === 3
      const cell = onFront ? pattern[piece.iy]![piece.ix]! : 'B'

      piece.matrix.decompose(_pos, _quat, _scale)

      if (onFront && cell === '-') {
        _scale.set(0.0001, 0.0001, 0.0001)
        this.setInstanceColor(instance, COLOR_WHITE)
      } else {
        _scale.set(1, 1, 1)
        if (cell === 'O') this.setInstanceColor(instance, COLOR_ORANGE)
        else this.setInstanceColor(instance, COLOR_WHITE)
      }

      piece.matrix.compose(_pos, _quat, _scale)
      this.mesh.setMatrixAt(instance, piece.matrix)
    })

    this.mesh.instanceMatrix.needsUpdate = true
    this.mesh.instanceColor!.needsUpdate = true
  }

  async animateRandomMove(): Promise<void> {
    if (this.isAnimating || this.disposed) return
    this.isAnimating = true

    const axes: Axis[] = ['x', 'y', 'z']
    const axis = axes[Math.floor(Math.random() * axes.length)]!
    const value = GRID_OFFSETS[Math.floor(Math.random() * GRID_OFFSETS.length)]!
    const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1

    try {
      await this.animateSlice(axis, value, direction)
    } finally {
      this.isAnimating = false
    }
  }

  /** Gira fatia aleatória e aplica o próximo padrão 4×4 da sequência. */
  async resolveNextShape(): Promise<void> {
    if (this.isAnimating || this.disposed) return
    this.isAnimating = true

    const axes: Axis[] = ['x', 'y', 'z']
    const axis = axes[Math.floor(Math.random() * axes.length)]!
    const value = GRID_OFFSETS[Math.floor(Math.random() * GRID_OFFSETS.length)]!
    const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1

    try {
      await this.animateSlice(axis, value, direction)
      this.patternIndex = (this.patternIndex + 1) % VOXEL_FACE_SEQUENCE.length
      const id = VOXEL_FACE_SEQUENCE[this.patternIndex]!
      this.applyFacePattern(voxelFaces[id]!)
    } finally {
      this.isAnimating = false
    }
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

    const t = this.clock.getElapsedTime()
    this.mesh.rotation.y = t * 0.15

    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.animate)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resizeHandler)
    this.mesh.geometry.dispose()
    ;(this.mesh.material as THREE.Material).dispose()
    this.scene.environment?.dispose()
    this.pmrem.dispose()
    this.renderer.dispose()
  }
}
