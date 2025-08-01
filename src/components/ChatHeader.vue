<template>
  <div class="chat-header">
    <h1>🤖 AI 对话助手</h1>
    <button @click="handleReset" class="reset-btn">重新配置</button>
  </div>
</template>

<script>
export default {
  name: "ChatHeader",
  methods: {
    handleReset() {
      this.$emit("reset-api-key");
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

.chat-header h1 {
  font-size: 1.5em;
  margin: 0;
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
}
</style>
