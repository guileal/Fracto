import * as THREE from 'three'

const BASE = {
  color: 0xf63404,
  roughness: 0.198,
  metalness: 0,
  ior: 1,
  reflectivity: 0,
  iridescence: 1,
  iridescenceIOR: 1.51962,
  iridescenceThicknessRange: [100, 400] as [number, number],
  sheen: 0.924,
  sheenRoughness: 0,
  specularIntensity: 1,
  specularColor: 0xc2660f,
}

export interface IridescentSceneHandle {
  resize: () => void
  dispose: () => void
}

export function mountIridescentScene(container: HTMLElement): IridescentSceneHandle {
  const w = container.clientWidth
  const h = container.clientHeight

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a0a06)
  scene.fog = new THREE.Fog(0xde5d17, 4, 14)

  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
  camera.position.set(0, 0, 4.2)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.35))
  const dir = new THREE.DirectionalLight(0xffffff, 1.4)
  dir.position.set(5, 8, 6)
  scene.add(dir)

  const material = new THREE.MeshPhysicalMaterial({
    color: BASE.color,
    roughness: BASE.roughness,
    metalness: BASE.metalness,
    ior: BASE.ior,
    reflectivity: BASE.reflectivity,
    iridescence: BASE.iridescence,
    iridescenceIOR: BASE.iridescenceIOR,
    iridescenceThicknessRange: BASE.iridescenceThicknessRange,
    sheen: BASE.sheen,
    sheenRoughness: BASE.sheenRoughness,
    specularIntensity: BASE.specularIntensity,
    specularColor: BASE.specularColor,
    fog: true,
  })

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), material)
  scene.add(mesh)

  const clock = new THREE.Clock()
  let raf = 0

  const tick = () => {
    raf = requestAnimationFrame(tick)
    const t = clock.getElapsedTime()
    mesh.rotation.x = t * 0.35
    mesh.rotation.y = t * 0.55
    material.iridescenceIOR = BASE.iridescenceIOR + Math.sin(t * 2.2) * 0.35
    renderer.render(scene, camera)
  }
  tick()

  const resize = () => {
    const nw = container.clientWidth
    const nh = container.clientHeight
    camera.aspect = nw / nh
    camera.updateProjectionMatrix()
    renderer.setSize(nw, nh)
  }

  window.addEventListener('resize', resize)

  return {
    resize,
    dispose: () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      material.dispose()
      mesh.geometry.dispose()
      container.removeChild(renderer.domElement)
    },
  }
}
