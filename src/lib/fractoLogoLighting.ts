import * as THREE from 'three'

/** Rig de iluminação partilhado pelo isotipo (logo-fracto / logo-fracto-light). */
export function addFractoLogoLighting(scene: THREE.Scene): void {
  scene.add(new THREE.AmbientLight(0xffffff, 0.42))
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc8ccd8, 0.38))

  const key = new THREE.DirectionalLight(0xfff8f2, 1.15)
  key.position.set(-5, 7, 6)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xd8dce8, 0.48)
  fill.position.set(6, 2, 4)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xffffff, 0.35)
  rim.position.set(2, 3, -6)
  scene.add(rim)
}
