<template>
  <div class="chat-header">
    <div class="logo-container">
      <svg class="logo" width="42" height="42" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Vue.js V形状 -->
        <path d="M6 4L16 24L26 4H20L16 14L12 4H6Z" fill="#4FC08D" />
        <!-- AI机器人头部 -->
        <rect
          x="10"
          y="8"
          width="12"
          height="8"
          rx="2"
          fill="rgba(255,255,255,0.9)"
          stroke="#667eea"
          stroke-width="1"
        />
        <!-- 机器人眼睛 -->
        <circle cx="13" cy="11" r="1" fill="#667eea" />
        <circle cx="19" cy="11" r="1" fill="#667eea" />
        <!-- 机器人嘴巴 -->
        <path d="M14 13.5H18" stroke="#667eea" stroke-width="1" stroke-linecap="round" />
        <!-- AI神经网络连接线 -->
        <circle cx="8" cy="6" r="1" fill="rgba(255,255,255,0.7)" />
        <circle cx="24" cy="6" r="1" fill="rgba(255,255,255,0.7)" />
        <line x1="8" y1="6" x2="12" y2="10" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
        <line x1="24" y1="6" x2="20" y2="10" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
      </svg>
      <h1>VueBot</h1>
    </div>
    <div class="header-controls">
      <div class="model-selector">
        <label class="model-label">模型:</label>
        <ModelSelector :selectedModel="selectedModel" @model-change="handleModelChange" />
      </div>
      <button @click="handleReset" class="reset-btn">重新配置</button>
    </div>
  </div>
</template>

<script>
import ModelSelector from "./ModelSelector.vue";

export default {
  name: "ChatHeader",
  components: {
    ModelSelector,
  },
  props: {
    currentModel: {
      type: String,
      default: "deepseek-chat",
    },
  },
  data() {
    return {
      selectedModel: this.currentModel,
    };
  },
  watch: {
    currentModel(newModel) {
      this.selectedModel = newModel;
    },
  },
  methods: {
    handleReset() {
      this.$emit("reset-api-key");
    },
    handleModelChange(modelValue) {
      this.selectedModel = modelValue;
      this.$emit("model-change", modelValue);
    },
  },
};
</script>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.chat-header h1 {
  font-size: 1.5em;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.model-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-label {
  font-size: 0.9em;
  font-weight: 500;
  white-space: nowrap;
}

.reset-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .chat-header {
    padding: 15px 20px;
  }

  .logo-container {
    gap: 8px;
  }

  .logo {
    width: 36px;
    height: 36px;
  }

  .chat-header h1 {
    font-size: 1.2em;
  }

  .header-controls {
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  }

  .model-selector {
    font-size: 0.8em;
  }
}
</style>
