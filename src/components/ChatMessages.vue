<template>
  <div class="chat-messages" ref="messagesContainer">
    <MessageItem 
      v-for="(message, index) in messages" 
      :key="index" 
      :message="message" 
      @copy-success="handleCopySuccess"
      @copy-error="handleCopyError"
    />

    <TypingIndicator v-if="isLoading" />
    
    <!-- Toast 提示 -->
    <Toast 
      v-if="toast.visible"
      :message="toast.message"
      :type="toast.type"
      :visible="toast.visible"
      @close="hideToast"
    />
  </div>
</template>

<script>
import MessageItem from "./MessageItem.vue";
import TypingIndicator from "./TypingIndicator.vue";
import Toast from "./Toast.vue";

export default {
  name: "ChatMessages",
  components: {
    MessageItem,
    TypingIndicator,
    Toast,
  },
  props: {
    messages: {
      type: Array,
      required: true,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      toast: {
        visible: false,
        message: '',
        type: 'info'
      }
    };
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    // 处理复制成功事件
    handleCopySuccess(message) {
      this.showToast(message, 'success');
    },
    // 处理复制失败事件
    handleCopyError(message) {
      this.showToast(message, 'error');
    },
    // 显示Toast提示
    showToast(message, type = 'info') {
      this.toast = {
        visible: true,
        message,
        type
      };
    },
    // 隐藏Toast提示
    hideToast() {
      this.toast.visible = false;
    },
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true,
    },
    isLoading() {
      this.scrollToBottom();
    },
  },
  mounted() {
    this.scrollToBottom();
  },
};
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .chat-messages {
    padding: 15px;
  }
}
</style>
