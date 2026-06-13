import * as THREE from 'three'
import type { FractoLogoMaterialConfig } from './fractoLogoConfig'

export function applyFractoLogoMaterialProps(
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

export function createFractoLogoPhysicalMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    emissive: 0x000000,
  })
}
