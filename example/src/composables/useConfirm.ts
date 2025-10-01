import { getCurrentInstance, inject } from 'vue'
import type { ConfirmFunction } from '../../../index'

export function useConfirm(): ConfirmFunction | undefined {
  // Try injection first (cleaner approach)
  const injectedConfirm = inject<ConfirmFunction>('vue3-confirm-dialog-box')
  if (injectedConfirm) {
    return injectedConfirm
  }

  // Fallback to global properties
  const instance = getCurrentInstance()
  return instance?.appContext.config.globalProperties.$confirm
}
