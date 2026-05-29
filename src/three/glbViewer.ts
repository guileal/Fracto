import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { buildSummaryTimeline, clipEndTime } from './summaryClip'

export interface GlbViewerState {
  loaded: boolean
  loading: boolean
  progress: number
  error: string | null
  fileName: string | null
  /** Timeline usada (Summary ou união de todas as keyframes). */
  timelineName: string | null
  /** 0–1 na timeline — controlado pelo scroll. */
  timelineProgress: number
  time: number
  duration: number
  exposure: number
  autoRotate: boolean
  scrollDriven: boolean
}

export interface GlbViewerOptions {
  /** Canvas e cena sem fundo opaco — para sobrepor background da página. */
  transparent?: boolean
  showGrid?: boolean
}

export interface GlbViewerHandle {
  loadFile: (file: File) => Promise<void>
  loadUrl: (url: string, fileName?: string) => Promise<void>
  /** Define posição na timeline Summary (0–1). Pausa e fixa o frame. */
  setTimelineProgress: (normalized: number) => void
  /** Hero: animação em loop + orbit; sem scrub por scroll. */
  setHeroPresentation: (enabled: boolean) => void
  setExposure: (value: number) => void
  setAutoRotate: (enabled: boolean) => void
  getState: () => GlbViewerState
  resize: () => void
  dispose: () => void
}

export function createGlbViewer(
  container: HTMLElement,
  onState: (state: GlbViewerState) => void,
  options: GlbViewerOptions = {},
): GlbViewerHandle {
  const transparent = options.transparent ?? false
  const showGrid = options.showGrid ?? !transparent
  const state: GlbViewerState = {
    loaded: false,
    loading: false,
    progress: 0,
    error: null,
    fileName: null,
    timelineName: null,
    timelineProgress: 0,
    time: 0,
    duration: 0,
    exposure: 1,
    autoRotate: false,
    scrollDriven: true,
  }

  const emit = () => onState({ ...state })

  const scene = new THREE.Scene()
  if (!transparent) {
    scene.background = new THREE.Color(0x141414)
  }

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 2000)
  camera.position.set(2.5, 1.8, 3.5)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: transparent })
  if (transparent) {
    renderer.setClearColor(0x000000, 0)
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = state.exposure
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08

  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const key = new THREE.DirectionalLight(0xffffff, 1.1)
  key.position.set(5, 8, 6)
  scene.add(key)
  if (showGrid) {
    scene.add(new THREE.GridHelper(12, 24, 0x3a3a3a, 0x252525))
  }

  let model: THREE.Object3D | null = null
  let mixer: THREE.AnimationMixer | null = null
  let mainAction: THREE.AnimationAction | null = null
  let targetProgress = 0
  let displayProgress = 0
  let heroPresentation = false
  const clock = new THREE.Clock()
  let raf = 0

  const fitCamera = (root: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(root)
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 1.8
    controls.target.copy(center)
    camera.position.set(center.x + distance * 0.7, center.y + distance * 0.45, center.z + distance * 0.85)
    camera.updateProjectionMatrix()
    controls.update()
  }

  const frameModel = (root: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(root)
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray()) || 1
    root.position.sub(center)
    root.scale.setScalar(1.75 / maxDim)
  }

  const applyTimeFromProgress = (normalized: number) => {
    const t = Math.max(0, Math.min(1, normalized))
    state.timelineProgress = t
    state.time = state.duration > 0 ? t * state.duration : 0
    if (mainAction && mixer) {
      mainAction.time = state.time
      mainAction.paused = true
      mixer.update(0)
    }
    emit()
  }

  const setTimelineProgress = (normalized: number) => {
    targetProgress = Math.max(0, Math.min(1, normalized))
    state.scrollDriven = true
  }

  const clearModel = () => {
    mixer?.stopAllAction()
    mixer = null
    mainAction = null
    state.timelineName = null
    state.duration = 0
    state.time = 0
    state.timelineProgress = 0
    targetProgress = 0
    displayProgress = 0

    if (model) {
      scene.remove(model)
      model.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => m.dispose())
        }
      })
      model = null
    }
    state.loaded = false
  }

  const tick = () => {
    raf = requestAnimationFrame(tick)
    const delta = clock.getDelta()

    if (heroPresentation && mainAction && mixer && !mainAction.paused) {
      mixer.update(delta)
      state.time = mainAction.time
      state.timelineProgress =
        state.duration > 0 ? Math.min(1, mainAction.time / state.duration) : 0
    } else if (state.scrollDriven && mainAction) {
      displayProgress += (targetProgress - displayProgress) * 0.14
      if (Math.abs(targetProgress - displayProgress) < 0.0005) {
        displayProgress = targetProgress
      }
      state.timelineProgress = displayProgress
      state.time = state.duration > 0 ? displayProgress * state.duration : 0
      mainAction.time = state.time
      mainAction.paused = true
      mixer?.update(0)
    }

    controls.autoRotate = state.autoRotate
    controls.autoRotateSpeed = 1.2
    controls.update()
    renderer.render(scene, camera)
  }
  tick()

  const resize = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  const applyGltf = (gltf: import('three/examples/jsm/loaders/GLTFLoader.js').GLTF) => {
    model = gltf.scene
    model.updateMatrixWorld(true)
    frameModel(model)
    scene.add(model)
    fitCamera(model)

    const timeline = buildSummaryTimeline(gltf.animations)

    if (!timeline) {
      if (!heroPresentation) {
        state.error =
          'GLB sem animação. No Blender, exporte com keyframes (action Summary ou NLA).'
      }
      state.loaded = true
      state.loading = false
      state.progress = 1
      emit()
      return
    }

    const { clip: summaryClip, label } = timeline
    state.timelineName = label
    state.duration = clipEndTime(summaryClip)
    mixer = new THREE.AnimationMixer(model)
    mainAction = mixer.clipAction(summaryClip)

    if (heroPresentation) {
      mainAction.setLoop(THREE.LoopRepeat, Infinity)
      mainAction.clampWhenFinished = false
      mainAction.play()
      mainAction.paused = false
      state.scrollDriven = false
    } else {
      mainAction.setLoop(THREE.LoopOnce, 1)
      mainAction.clampWhenFinished = true
      mainAction.play()
      mainAction.paused = true
      targetProgress = 0
      displayProgress = 0
      applyTimeFromProgress(0)
    }

    state.loaded = true
    state.loading = false
    state.progress = 1
    emit()
  }

  const loadFromUrl = async (url: string, fileName: string, revokeAfter = false) => {
    clearModel()
    state.loading = true
    state.error = null
    state.progress = 0
    state.fileName = fileName
    emit()

    const loader = new GLTFLoader()

    try {
      const gltf = await new Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>(
        (resolve, reject) => {
          loader.load(
            url,
            resolve,
            (ev) => {
              state.progress = ev.total > 0 ? ev.loaded / ev.total : 0
              emit()
            },
            reject,
          )
        },
      )
      applyGltf(gltf)
    } catch (err) {
      state.loading = false
      state.error = err instanceof Error ? err.message : 'Erro ao carregar o arquivo'
      state.loaded = false
      emit()
      throw err
    } finally {
      if (revokeAfter) URL.revokeObjectURL(url)
    }
  }

  const loadFile = async (file: File) => {
    const url = URL.createObjectURL(file)
    await loadFromUrl(url, file.name, true)
  }

  const loadUrl = async (url: string, fileName?: string) => {
    const name = fileName ?? url.split('/').pop() ?? 'modelo.glb'
    await loadFromUrl(url, name, false)
  }

  const setHeroPresentation = (enabled: boolean) => {
    heroPresentation = enabled
    state.scrollDriven = !enabled
    if (enabled) {
      state.autoRotate = true
      if (mainAction && mixer) {
        mainAction.setLoop(THREE.LoopRepeat, Infinity)
        mainAction.clampWhenFinished = false
        mainAction.paused = false
        if (!mainAction.isRunning()) mainAction.play()
      }
    } else if (mainAction) {
      mainAction.setLoop(THREE.LoopOnce, 1)
      mainAction.clampWhenFinished = true
      mainAction.paused = true
      applyTimeFromProgress(state.timelineProgress)
    }
    emit()
  }

  return {
    loadFile,
    loadUrl,
    setTimelineProgress,
    setHeroPresentation,
    setExposure: (value: number) => {
      state.exposure = value
      renderer.toneMappingExposure = value
      emit()
    },
    setAutoRotate: (enabled: boolean) => {
      state.autoRotate = enabled
      emit()
    },
    getState: () => ({ ...state }),
    resize,
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      clearModel()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    },
  }
}
