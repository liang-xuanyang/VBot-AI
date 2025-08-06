<template>
  <div class="model-selector" ref="selector">
    <!-- 触发器按钮 -->
    <button 
      class="selector-trigger"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      role="combobox"
    >
      <div class="selected-model">
        <span class="model-icon">{{ selectedModelData.icon }}</span>
        <div class="model-info">
          <span class="model-name">{{ selectedModelData.name }}</span>
        </div>
      </div>
      <svg 
        class="dropdown-arrow" 
        :class="{ 'rotated': isOpen }"
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- 下拉面板 -->
    <transition name="dropdown">
      <div 
        v-if="isOpen" 
        class="dropdown-panel"
        role="listbox"
        :aria-activedescendant="focusedOptionId"
      >
        <div 
          v-for="(model, index) in models" 
          :key="model.value"
          class="model-option"
          :class="{ 
            'selected': model.value === selectedModel,
            'focused': focusedIndex === index
          }"
          :id="`option-${index}`"
          role="option"
          :aria-selected="model.value === selectedModel"
          @click="selectModel(model.value)"
          @mouseenter="focusedIndex = index"
        >
          <span class="model-icon">{{ model.icon }}</span>
          <div class="model-info">
            <span class="model-name">{{ model.name }}</span>
            <span class="model-desc">{{ model.description }}</span>
          </div>
          <svg 
            v-if="model.value === selectedModel"
            class="check-icon"
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
          >
            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </transition>

    <!-- 遮罩层 -->
    <div 
      v-if="isOpen" 
      class="overlay" 
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'ModelSelector',
  props: {
    selectedModel: {
      type: String,
      default: 'deepseek-chat'
    }
  },
  data() {
    return {
      isOpen: false,
      focusedIndex: -1,
      models: [
        {
          value: 'deepseek-chat',
          name: 'DeepSeek V3',
          icon: '🔬',
          description: '快速响应'
        },
        {
          value: 'deepseek-reasoner',
          name: 'DeepSeek R1',
          icon: '🧠',
          description: '深度思考，复杂推理'
        }
      ]
    }
  },
  computed: {
    selectedModelData() {
      return this.models.find(model => model.value === this.selectedModel) || this.models[0]
    },
    focusedOptionId() {
      return this.focusedIndex >= 0 ? `option-${this.focusedIndex}` : null
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        this.focusedIndex = this.models.findIndex(model => model.value === this.selectedModel)
      }
    },
    closeDropdown() {
      this.isOpen = false
      this.focusedIndex = -1
    },
    selectModel(modelValue) {
      this.$emit('model-change', modelValue)
      this.closeDropdown()
    },
    handleClickOutside(event) {
      if (this.$refs.selector && !this.$refs.selector.contains(event.target)) {
        this.closeDropdown()
      }
    },
    handleKeydown(event) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!this.isOpen) {
            this.toggleDropdown()
          } else {
            this.focusedIndex = Math.min(this.focusedIndex + 1, this.models.length - 1)
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (this.isOpen) {
            this.focusedIndex = Math.max(this.focusedIndex - 1, 0)
          }
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (!this.isOpen) {
            this.toggleDropdown()
          } else if (this.focusedIndex >= 0) {
            this.selectModel(this.models[this.focusedIndex].value)
          }
          break
        case 'Escape':
          this.closeDropdown()
          break
      }
    }
  }
}
</script>

<style scoped>
.model-selector {
  position: relative;
  display: inline-block;
}

.selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 200px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  color: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
  outline: none;
  font-weight: 500;
}

.selector-trigger:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
  color: #000;
}

.selector-trigger:focus {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 1);
  color: #000;
}

.selected-model {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.model-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.model-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.model-name {
  font-weight: 600;
  font-size: 0.9em;
  line-height: 1.2;
  color: inherit;
}

.model-desc {
  font-size: 0.75em;
  color: #555;
  line-height: 1.2;
  font-weight: 400;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  color: #444;
  opacity: 0.8;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  overflow: hidden;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
  color: #1a1a1a;
}

.model-option:last-child {
  border-bottom: none;
}

.model-option .model-name {
  font-weight: 600;
  color: #1a1a1a;
}

.model-option .model-desc {
  color: #666;
  font-weight: 400;
}

.model-option:hover,
.model-option.focused {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.model-option:hover .model-name,
.model-option.focused .model-name {
  color: white;
  font-weight: 600;
}

.model-option:hover .model-desc,
.model-option.focused .model-desc {
  color: rgba(255, 255, 255, 0.9);
}

.model-option.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.model-option.selected .model-name {
  color: white;
  font-weight: 600;
}

.model-option.selected .model-desc {
  color: rgba(255, 255, 255, 0.9);
}

.check-icon {
  margin-left: auto;
  color: white;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* 动画效果 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .selector-trigger {
    min-width: 180px;
    padding: 10px;
  }
  
  .model-name {
    font-size: 0.85em;
  }
  
  .model-desc {
    font-size: 0.7em;
  }
  
  .model-option {
    padding: 14px 12px;
  }
}
</style>