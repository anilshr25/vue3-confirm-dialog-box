<template>
  <teleport to="body">
    <transition name="fade">
      <div 
        v-if="isShow" 
        class="vc-overlay" 
        id="confirm-box"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="dialog.title ? 'vc-dialog-title' : undefined"
        :aria-describedby="dialog.message ? 'vc-dialog-message' : undefined"
        @click="handleClickOverlay"
      >
        <transition name="zoom">
          <div 
            v-if="isShow" 
            ref="vueConfirmDialog" 
            class="vc-container"
            @click.stop
          >
            <div class="vc-text-grid">
              <h4 
                v-if="dialog.title" 
                id="vc-dialog-title"
                class="vc-title" 
                v-html="dialog.title"
              ></h4>
              <p
                v-if="dialog.message"
                id="vc-dialog-message"
                class="vc-text"
                v-html="dialog.message"
              ></p>
              <div v-if="dialog.auth" class="vc-auth-container">
                <input
                  ref="passwordInput"
                  v-model="password"
                  class="vc-input"
                  type="password"
                  name="vc-password"
                  :placeholder="dialog.authPlaceholder || 'Password'"
                  autocomplete="current-password"
                  :aria-label="dialog.authPlaceholder || 'Password'"
                  @keydown.enter="handleEnterKey"
                  @keydown.escape="handleEscapeKey"
                />
              </div>
            </div>
            <div
              class="vc-btn-grid"
              :class="{ isMono: !dialog.button.no || !dialog.button.yes }"
            >
              <button
                v-if="dialog.button.no"
                ref="cancelButton"
                @click="handleClickButton($event, false)"
                class="vc-btn left"
                type="button"
                :aria-label="`${dialog.button.no} - Cancel action`"
              >
                {{ dialog.button.no }}
              </button>

              <button
                ref="confirmButton"
                :disabled="dialog.auth && !password"
                @click="handleClickButton($event, true)"
                class="vc-btn"
                :class="{ 'vc-btn-primary': !dialog.button.no }"
                type="button"
                :aria-label="`${dialog.button.yes} - Confirm action`"
              >
                {{ dialog.button.yes }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script>
import event from "../event";
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from "vue";

export default {
  name: 'Vue3ConfirmDialogBox',
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const isShow = ref(false);
    const password = ref('');
    const passwordInput = ref(null);
    const cancelButton = ref(null);
    const confirmButton = ref(null);
    const vueConfirmDialog = ref(null);
    
    const dialog = reactive({
      auth: false,
      title: "",
      message: "",
      button: { yes: 'Yes', no: 'Cancel' },
      authPlaceholder: 'Password'
    });
    
    let currentParams = null;
    let previousActiveElement = null;

    // Event handlers
    const handleOpen = (params) => {
      open(params);
    };

    const handleClose = () => {
      handleClickOverlay();
    };

    onMounted(() => {
      event.on("open", handleOpen);
      event.on("close", handleClose);
      document.addEventListener("keydown", handleGlobalKeydown);
    });

    onUnmounted(() => {
      event.off("open", handleOpen);
      event.off("close", handleClose);
      document.removeEventListener("keydown", handleGlobalKeydown);
      
      // Restore focus if dialog is still open
      if (previousActiveElement) {
        try {
          previousActiveElement.focus();
        } catch (e) {
          // Element might not be focusable anymore
        }
      }
    });

    // Watch for dialog visibility to manage focus
    watch(isShow, async (newVal) => {
      if (newVal) {
        // Store the previously focused element
        previousActiveElement = document.activeElement;
        
        // Wait for DOM update
        await nextTick();
        
        // Set initial focus
        if (dialog.auth && passwordInput.value) {
          passwordInput.value.focus();
        } else if (cancelButton.value) {
          cancelButton.value.focus();
        } else if (confirmButton.value) {
          confirmButton.value.focus();
        }
      } else {
        // Restore focus when dialog closes
        if (previousActiveElement && previousActiveElement !== document.body) {
          try {
            previousActiveElement.focus();
          } catch (e) {
            // Element might not be focusable anymore
          }
        }
        previousActiveElement = null;
      }
    });

    function resetState() {
      password.value = '';
      Object.assign(dialog, {
        auth: false,
        title: "",
        message: "",
        button: { yes: 'Yes', no: 'Cancel' },
        authPlaceholder: 'Password'
      });
      currentParams = null;
    }

    function handleClickButton(event, confirm) {
      if (event?.target?.id === "confirm-box") return;
      
      // Validate auth requirement
      if (confirm && dialog.auth && !password.value.trim()) {
        return;
      }
      
      isShow.value = false;
      
      // Emit Vue events
      emit(confirm ? 'confirm' : 'cancel', {
        confirmed: confirm,
        password: password.value
      });
      
      // Call callback if provided
      if (currentParams?.callback) {
        currentParams.callback(confirm, password.value);
      }
    }

    function handleClickOverlay() {
      isShow.value = false;
      
      emit('cancel', {
        confirmed: false,
        password: password.value
      });
      
      if (currentParams?.callback) {
        currentParams.callback(false, password.value);
      }
    }

    function handleGlobalKeydown(e) {
      if (!isShow.value) return;
      
      // Trap focus within dialog
      if (e.key === 'Tab') {
        trapFocus(e);
      } else if (e.key === 'Escape') {
        handleEscapeKey();
      } else if (e.key === 'Enter' && !dialog.auth) {
        // Only auto-confirm on Enter if not in auth mode
        handleEnterKey();
      }
    }

    function handleEnterKey() {
      if (dialog.auth && !password.value.trim()) {
        return;
      }
      handleClickButton(null, true);
    }

    function handleEscapeKey() {
      handleClickOverlay();
    }

    function trapFocus(e) {
      const focusableElements = vueConfirmDialog.value?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    function open(parameters) {
      if (!parameters || typeof parameters !== 'object') {
        console.warn('vue3-confirm-dialog-box: Invalid parameters provided to open()');
        return;
      }
      
      resetState();
      currentParams = parameters;
      isShow.value = true;
      
      // Safely merge parameters with dialog state
      Object.keys(parameters).forEach((key) => {
        if (key === 'button' && typeof parameters.button === 'object') {
          Object.assign(dialog.button, parameters.button);
        } else if (key in dialog && typeof parameters[key] === typeof dialog[key]) {
          dialog[key] = parameters[key];
        }
      });
    }

    return {
      isShow,
      password,
      dialog,
      passwordInput,
      cancelButton,
      confirmButton,
      vueConfirmDialog,
      handleClickButton,
      handleClickOverlay,
      handleEnterKey,
      handleEscapeKey,
    };
  }
};
</script>

<style>
:root {
  --vc-title-color: #1a1a1a;
  --vc-message-color: #4a4a4a;
  --vc-overlay-background-color: rgba(0, 0, 0, 0.5);
  --vc-container-box-shadow: rgba(0, 0, 0, 0.15) 0px 10px 40px 0px;
  --vc-base-background-color: #ffffff;
  --vc-button-color: #007bff;
  --vc-button-background-color: #ffffff;
  --vc-button-border-color: #e0e0e0;
  --vc-button-background-color-disabled: #f8f9fa;
  --vc-button-background-color-hover: #f8f9fa;
  --vc-button-box-shadow-active: inset 0 2px 4px 0px rgba(0, 0, 0, 0.1);
  --vc-primary-button-background: #007bff;
  --vc-primary-button-color: #ffffff;
  --vc-input-background-color: #f8f9fa;
  --vc-input-background-color-focus: #ffffff;
  --vc-input-border-color: #dee2e6;
  --vc-input-border-color-focus: #007bff;
  --vc-font-size-base: 16px;
  --vc-font-size-sm: 14px;
  --vc-font-weight-bold: 600;
  --vc-font-weight-medium: 500;
  --vc-font-weight-normal: 400;
  --vc-border-radius: 12px;
  --vc-border-radius-sm: 8px;
}

/**
* Dialog Styles
*/
.vc-overlay *,
.vc-overlay *:before,
.vc-overlay *:after {
  box-sizing: border-box;
}

.vc-overlay {
  background-color: var(--vc-overlay-background-color);
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 9999;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.vc-container {
  background-color: var(--vc-base-background-color);
  border-radius: var(--vc-border-radius);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--vc-container-box-shadow);
  overflow: hidden;
}

.vc-text-grid {
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
}

.vc-title {
  color: var(--vc-title-color);
  font-weight: var(--vc-font-weight-bold);
  font-size: var(--vc-font-size-base);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
}

.vc-text {
  color: var(--vc-message-color);
  font-weight: var(--vc-font-weight-normal);
  font-size: var(--vc-font-size-sm);
  line-height: 1.5;
  margin: 0;
}

.vc-auth-container {
  margin-top: 1.5rem;
}

.vc-input {
  width: 100%;
  outline: none;
  border-radius: var(--vc-border-radius-sm);
  height: 44px;
  border: 1px solid var(--vc-input-border-color);
  background-color: var(--vc-input-background-color);
  padding: 0 1rem;
  font-size: var(--vc-font-size-base);
  transition: all 0.2s ease;
  color: var(--vc-title-color);
}

.vc-input:hover {
  background-color: var(--vc-input-background-color-focus);
  border-color: var(--vc-input-border-color-focus);
}

.vc-input:focus {
  background-color: var(--vc-input-background-color-focus);
  border-color: var(--vc-input-border-color-focus);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.vc-btn-grid {
  display: flex;
  border-top: 1px solid var(--vc-button-border-color);
}

.vc-btn-grid.isMono {
  display: block;
}

.vc-btn {
  flex: 1;
  background-color: var(--vc-button-background-color);
  border: 0;
  color: var(--vc-button-color);
  font-size: var(--vc-font-size-base);
  font-weight: var(--vc-font-weight-medium);
  cursor: pointer;
  outline: none;
  min-height: 52px;
  padding: 0 1rem;
  transition: all 0.2s ease;
}

.vc-btn:hover:not(:disabled) {
  background-color: var(--vc-button-background-color-hover);
}

.vc-btn:focus {
  box-shadow: inset 0 0 0 2px var(--vc-button-color);
}

.vc-btn:active:not(:disabled) {
  box-shadow: var(--vc-button-box-shadow-active);
}

.vc-btn:disabled {
  background-color: var(--vc-button-background-color-disabled);
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.vc-btn.left {
  border-right: 1px solid var(--vc-button-border-color);
}

.vc-btn-primary {
  background-color: var(--vc-primary-button-background);
  color: var(--vc-primary-button-color);
}

.vc-btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.vc-btn-primary:focus {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
}

/**
* Transitions
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zoom-leave-active {
  transition: all 0.2s ease-in;
}

.zoom-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/**
* Responsive Design
*/
@media (max-width: 480px) {
  .vc-container {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
  
  .vc-text-grid {
    padding: 1.5rem 1rem 1rem;
  }
  
  .vc-title {
    font-size: calc(var(--vc-font-size-base) - 1px);
  }
  
  .vc-btn {
    min-height: 48px;
  }
}

/**
* Dark mode support
*/
@media (prefers-color-scheme: dark) {
  :root {
    --vc-title-color: #ffffff;
    --vc-message-color: #e0e0e0;
    --vc-overlay-background-color: rgba(0, 0, 0, 0.8);
    --vc-base-background-color: #2d2d2d;
    --vc-button-color: #4dabf7;
    --vc-button-background-color: #2d2d2d;
    --vc-button-border-color: #404040;
    --vc-button-background-color-disabled: #3a3a3a;
    --vc-button-background-color-hover: #3a3a3a;
    --vc-input-background-color: #3a3a3a;
    --vc-input-background-color-focus: #404040;
    --vc-input-border-color: #555555;
    --vc-input-border-color-focus: #4dabf7;
  }
}
</style>