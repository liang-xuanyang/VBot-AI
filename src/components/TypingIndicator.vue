<template>
  <div class="message ai-message">
    <!-- AI消息图标 -->
    <div class="message-avatar ai-avatar">
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
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TypingIndicator",
};
</script>

<style scoped>
.message {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
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

.message-content {
  max-width: 70%;
  padding: 15px 20px;
  border-radius: 18px;
  background: white;
  color: #333;
  border: 1px solid #e1e5e9;
  border-bottom-left-radius: 4px;
  height: 57.6px;
  width: 800px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
