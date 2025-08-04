<template>
  <transition name="toast" appear>
    <div 
      v-if="visible" 
      class="toast"
      :class="[`toast-${type}`, { 'toast-mobile': isMobile }]"
    >
      <div class="toast-icon">
        <svg v-if="type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <svg v-else-if="type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="toast-content">
        <div class="toast-message">{{ message }}</div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'info', 'warning'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isMobile: false
    };
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    
    if (this.visible && this.duration > 0) {
      setTimeout(() => {
        this.$emit('close');
      }, this.duration);
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    }
  }
};
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  font-size: 14px;
  line-height: 1.4;
}

.toast-success {
  background: rgba(82, 196, 26, 0.9);
  color: white;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.toast-error {
  background: rgba(255, 77, 79, 0.9);
  color: white;
  border: 1px solid rgba(255, 77, 79, 0.3);
}

.toast-info {
  background: rgba(24, 144, 255, 0.9);
  color: white;
  border: 1px solid rgba(24, 144, 255, 0.3);
}

.toast-warning {
  background: rgba(250, 173, 20, 0.9);
  color: white;
  border: 1px solid rgba(250, 173, 20, 0.3);
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-weight: 500;
  word-break: break-word;
}

/* 移动端适配 */
.toast-mobile {
  top: 10px;
  right: 10px;
  left: 10px;
  min-width: auto;
  max-width: none;
  padding: 12px;
  font-size: 13px;
}

/* 动画效果 */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* 移动端动画 */
.toast-mobile.toast-enter {
  transform: translateY(-100%) scale(0.9);
}

.toast-mobile.toast-leave-to {
  transform: translateY(-100%) scale(0.9);
}
</style>