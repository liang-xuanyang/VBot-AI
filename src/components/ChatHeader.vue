<template>
  <div class="chat-header">
    <div class="logo-container">
      <img style="width: 42px; height: 42px" src="/favicon.svg" alt="VBot AI" class="logo" />

      <h1>VBot AI</h1>
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
