<template>
  <div id="app">
    <!-- API Key 配置区域 -->
    <ApiKeyConfig v-if="!apiKey" @api-key-set="handleApiKeySet" />

    <!-- 聊天界面 -->
    <div v-else class="chat-container">
      <ChatHeader @reset-api-key="handleResetApiKey" />

      <ChatMessages :messages="messages" :is-loading="isLoading" ref="chatMessages" />

      <ChatInput :is-loading="isLoading" @send-message="handleSendMessage" />
    </div>
  </div>
</template>

<script>
import ApiKeyConfig from "./components/ApiKeyConfig.vue";
import ChatHeader from "./components/ChatHeader.vue";
import ChatMessages from "./components/ChatMessages.vue";
import ChatInput from "./components/ChatInput.vue";
import apiService from "./services/apiService.js";
import storage from "./utils/storage.js";

export default {
  name: "App",
  components: {
    ApiKeyConfig,
    ChatHeader,
    ChatMessages,
    ChatInput,
  },
  data() {
    return {
      apiKey: storage.getApiKey(),
      messages: [],
      isLoading: false,
    };
  },
  methods: {
    handleApiKeySet(apiKey) {
      this.apiKey = apiKey;
      storage.setApiKey(apiKey);
      this.addWelcomeMessage();
    },
    handleResetApiKey() {
      this.apiKey = "";
      this.messages = [];
      storage.removeApiKey();
    },
    addWelcomeMessage() {
      this.messages.push({
        role: "assistant",
        content: `您好！我是 AI 助手，很高兴为您服务！`,
        timestamp: new Date(),
      });
    },
    async handleSendMessage(messageContent) {
      const userMessage = {
        role: "user",
        content: messageContent,
        timestamp: new Date(),
      };

      this.messages.push(userMessage);
      this.isLoading = true;

      // 使用流式请求
      apiService.sendMessageStream(
        this.apiKey,
        this.messages, // 使用当前所有消息
        (chunk) => {
          // 第一次收到数据时创建AI消息
          if (this.isLoading) {
            const aiMessage = {
              role: "assistant",
              content: chunk,
              timestamp: new Date(),
            };
            this.messages.push(aiMessage);
            this.isLoading = false;
          } else {
            // 后续更新最后一条AI消息
            const lastIndex = this.messages.length - 1;
            this.messages[lastIndex].content += chunk;
          }
        },
        () => {
          // 流式传输完成
          this.isLoading = false;
        },
        (error) => {
          // 处理错误
          if (this.isLoading) {
            // 如果还在loading状态，创建错误消息
            const errorMessage = {
              role: "assistant",
              content: error,
              timestamp: new Date(),
            };
            this.messages.push(errorMessage);
          } else {
            // 否则更新最后一条消息
            const lastIndex = this.messages.length - 1;
            this.messages[lastIndex].content = error;
          }
          this.isLoading = false;
        }
      );
    },
  },
  mounted() {
    if (this.apiKey) {
      this.addWelcomeMessage();
    }
  },
};
</script>

<style>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 1200px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1240px) {
  .chat-container {
    width: calc(100% - 40px);
    margin: 0 20px;
  }
}

@media (max-width: 768px) {
  .chat-container {
    width: 100%;
    margin: 0;
    box-shadow: none;
  }
}
</style>
