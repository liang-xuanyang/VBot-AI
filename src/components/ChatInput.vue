<template>
  <div class="chat-input">
    <div class="input-container">
      <textarea
        v-model="currentMessage"
        placeholder="输入您的问题..."
        class="message-input"
        rows="1"
        @keyup.enter.exact="handleSend"
        @keyup.enter.shift.exact="addNewLine"
        :disabled="isLoading"
      ></textarea>
      <button
        @click="handleSend"
        class="send-btn"
        :disabled="!currentMessage.trim() || isLoading"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentMessage: ''
    };
  },
  methods: {
    handleSend() {
      if (!this.currentMessage.trim() || this.isLoading) return;
      
      const message = this.currentMessage.trim();
      this.currentMessage = '';
      this.$emit('send-message', message);
    },
    addNewLine() {
      this.currentMessage += '\n';
    }
  }
};
</script>

<style scoped>
.chat-input {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #e1e5e9;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  resize: none;
  max-height: 120px;
  min-height: 50px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.send-btn {
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-input {
    padding: 15px 20px;
  }
}
</style>