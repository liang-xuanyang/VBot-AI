<template>
  <div :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
    <!-- AI消息图标 -->
    <div v-if="message.role === 'assistant'" class="message-avatar ai-avatar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 机器人头部 -->
        <rect x="6" y="6" width="12" height="10" rx="2" fill="#667eea" />
        <!-- 机器人眼睛 -->
        <circle cx="9" cy="9" r="1" fill="white" />
        <circle cx="15" cy="9" r="1" fill="white" />
        <!-- 机器人嘴巴 -->
        <rect x="10" y="12" width="4" height="1" rx="0.5" fill="white" />
        <!-- 机器人天线 -->
        <line x1="12" y1="6" x2="12" y2="4" stroke="#667eea" stroke-width="2" stroke-linecap="round" />
        <circle cx="12" cy="3" r="1" fill="#667eea" />
        <!-- 机器人身体 -->
        <rect x="8" y="16" width="8" height="6" rx="1" fill="#667eea" />
        <!-- 机器人手臂 -->
        <rect x="5" y="17" width="2" height="4" rx="1" fill="#667eea" />
        <rect x="17" y="17" width="2" height="4" rx="1" fill="#667eea" />
      </svg>
    </div>

    <div class="message-content">
      <div class="message-text" v-html="formattedContent"></div>
    </div>

    <!-- 用户消息图标 -->
    <div v-if="message.role === 'user'" class="message-avatar user-avatar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
          fill="#667eea"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import { marked } from "marked";

export default {
  name: "MessageItem",
  props: {
    message: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.role === "string" && typeof value.content === "string";
      },
    },
  },
  computed: {
    formattedContent() {
      return marked(this.message.content, {
        breaks: true,
        gfm: true,
      });
    },
  },
};
</script>

<style scoped>
.message {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.user-message {
  justify-content: flex-end;
}

.ai-message {
  justify-content: flex-start;
}

.message-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 6px;
}

.ai-avatar {
  background: #f0f2f5;
  border: 1px solid #e1e5e9;
}

.user-avatar {
  background: #f0f2f5;
  border: 1px solid #e1e5e9;
}

.message-content {
  max-width: 70%;
  padding: 0px 20px;
  border-radius: 18px;
  position: relative;
}

.user-message .message-content {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  border-bottom-right-radius: 4px;
}

.ai-message .message-content {
  background: white;
  color: #333;
  border: 1px solid #e1e5e9;
  border-bottom-left-radius: 4px;
  width: 800px;
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text :deep(pre) {
  /* background: rgba(0, 0, 0, 0.1); */
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-text :deep(code) {
  /* background: rgba(0, 0, 0, 0.1); */
  /* padding: 2px 6px; */
  border-radius: 4px;
  font-family: "Courier New", monospace;
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .ai-message .message-content {
    width: auto;
    max-width: 85%;
  }
}
</style>
