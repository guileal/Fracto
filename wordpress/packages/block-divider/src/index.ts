import './embed.css'
import { bootstrapFracto3dAutoInit } from '@fracto/lib/fracto3dDomBootstrap'
import { autoInitBlockDividers } from '@fracto/lib/blockDivider/mount'

export const ASSET_ID = 'block-divider' as const

export function autoInit(): void {
  autoInitBlockDividers()
}

const api = { assetId: ASSET_ID, autoInit }

if (typeof window !== 'undefined') {
  window.FractoBlockDivider = api
  bootstrapFracto3dAutoInit(autoInit)
}

export { autoInitBlockDividers, mountBlockDivider, unmountBlockDivider } from '@fracto/lib/blockDivider/mount'
