<template>
  <div class="chat-messages" ref="messagesContainer">
    <MessageItem v-for="(message, index) in messages" :key="index" :message="message" />

    <TypingIndicator v-if="isLoading" />
  </div>
</template>

<script>
import MessageItem from "./MessageItem.vue";
import TypingIndicator from "./TypingIndicator.vue";

export default {
  name: "ChatMessages",
  components: {
    MessageItem,
    TypingIndicator,
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
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
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
