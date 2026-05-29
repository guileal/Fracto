import * as THREE from 'three'

const GRAY = 0x7d8799
const ORANGE = 0xf26522

interface BlockDef {
  pos: [number, number, number]
  scale: [number, number, number]
  orange?: boolean
}

/** Composição inspirada no isotipo Fracto — cluster central + cubos dispersos */
const BLOCKS: BlockDef[] = [
  { pos: [-0.12, 0.28, 0], scale: [0.42, 1.05, 0.42] },
  { pos: [0.08, -0.28, 0], scale: [0.92, 0.3, 0.42] },
  { pos: [0.58, -0.22, 0.08], scale: [0.3, 0.3, 0.3] },
  { pos: [-0.38, 0.82, 0], scale: [0.34, 0.34, 0.34] },
  { pos: [0.02, 0.92, 0.04], scale: [0.36, 0.36, 0.36], orange: true },
  { pos: [-2.15, 0.05, -0.25], scale: [0.48, 0.48, 0.48] },
  { pos: [-1.42, 1.05, 0], scale: [0.26, 0.26, 0.26] },
  { pos: [-1.48, 0.15, 0], scale: [0.3, 0.3, 0.3] },
  { pos: [-1.52, -0.72, 0], scale: [0.34, 0.34, 0.34] },
  { pos: [1.82, 1.02, -0.15], scale: [0.36, 0.36, 0.36] },
  { pos: [1.68, -0.82, 0.12], scale: [0.3, 0.3, 0.3] },
  { pos: [2.02, -0.88, 0.12], scale: [0.3, 0.3, 0.3] },
  { pos: [0.08, 1.52, 0], scale: [0.33, 0.33, 0.33] },
  { pos: [0, -1.42, 0], scale: [0.2, 0.2, 0.2] },
]

export function createHeroCubesScene(container: HTMLElement): () => void {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0.15, 5.8)
  camera.lookAt(0, 0.1, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.42))
  const key = new THREE.DirectionalLight(0xffffff, 1.25)
  key.position.set(-5, 7, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0xa8b8d8, 0.35)
  fill.position.set(4, 2, -3)
  scene.add(fill)

  const group = new THREE.Group()
  const geometry = new THREE.BoxGeometry(1, 1, 1)

  for (const block of BLOCKS) {
    const material = new THREE.MeshStandardMaterial({
      color: block.orange ? ORANGE : GRAY,
      roughness: 0.84,
      metalness: 0.04,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...block.pos)
    mesh.scale.set(...block.scale)
    group.add(mesh)
  }

  group.rotation.x = -0.12
  group.rotation.y = 0.18
  scene.add(group)

  let mouseX = 0
  let mouseY = 0
  const onMove = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
  }
  window.addEventListener('mousemove', onMove)

  const clock = new THREE.Clock()
  let raf = 0

  const resize = () => {
    const width = container.clientWidth
    const height = container.clientHeight
    if (width === 0 || height === 0) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height, false)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(container)
  resize()

  const tick = () => {
    const t = clock.getElapsedTime()
    const targetY = 0.18 + mouseX * 0.1
    const targetX = -0.12 - mouseY * 0.06
    group.rotation.y += (targetY - group.rotation.y) * 0.04
    group.rotation.x += (targetX - group.rotation.x) * 0.04
    group.position.y = Math.sin(t * 0.4) * 0.05
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  tick()

  return () => {
    cancelAnimationFrame(raf)
    observer.disconnect()
    window.removeEventListener('mousemove', onMove)
    geometry.dispose()
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mat = object.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat.dispose()
      }
    })
    renderer.dispose()
    renderer.domElement.remove()
  }
}
