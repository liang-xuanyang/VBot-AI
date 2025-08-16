<template>
  <div id="chat-app">
    <!-- API Key 配置区域 -->
    <ApiKeyConfig v-if="!apiKey" @api-key-set="handleApiKeySet" />

    <!-- 聊天界面 -->
    <div v-else class="chat-container">
      <ChatHeader :current-model="currentModel" @reset-api-key="handleResetApiKey" @model-change="handleModelChange" />

      <ChatMessages :messages="messages" :is-loading="isLoading" ref="chatMessages" />

      <ChatInput :is-loading="isLoading" @send-message="handleSendMessage" />
    </div>
  </div>
</template>

<script>
import ApiKeyConfig from "./ApiKeyConfig.vue";
import ChatHeader from "./ChatHeader.vue";
import ChatMessages from "./ChatMessages.vue";
import ChatInput from "./ChatInput.vue";
import apiService from "../services/apiService.js";
import storage from "../utils/storage.js";

export default {
  name: "ChatApp",
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
      currentModel: storage.getSelectedModel(),
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
    handleModelChange(newModel) {
      this.currentModel = newModel;
      storage.setSelectedModel(newModel);
      apiService.setModel(newModel);
    },
    addWelcomeMessage() {
      const welcomeMessage = {
        role: "assistant",
        content: "你好！我是你的AI助手，有什么可以帮助你的吗？",
        timestamp: new Date(),
        reasoning: "",
        thinkingTime: 0,
        isThinkingComplete: true,
        showThinking: false,
      };
      this.messages.push(welcomeMessage);
    },
    async handleSendMessage(message) {
      // 添加用户消息
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date(),
      };
      this.messages.push(userMessage);

      // 设置加载状态
      this.isLoading = true;

      // 检查是否为推理模型
      const isReasonerModel = this.currentModel.includes("reasoner");
      let thinkingStartTime = null;

      // 发送消息到API
      await apiService.sendMessageStream(
        this.apiKey,
        this.messages,
        (chunk) => {
          // 处理流式响应
          if (this.isLoading) {
            // 首次接收到内容，创建AI消息
            const aiMessage = {
              role: "assistant",
              content: chunk,
              timestamp: new Date(),
              // 扩展消息对象结构
              reasoning: "", // 推理过程内容
              thinkingTime: 0, // 思考用时（秒）
              isThinkingComplete: false, // 思考是否完成，初始为false
              showThinking: isReasonerModel, // 是否显示思考功能
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

          // 如果是推理模型，标记思考完成并计算用时
          if (isReasonerModel && this.messages.length > 0) {
            const lastIndex = this.messages.length - 1;
            const lastMessage = this.messages[lastIndex];
            if (lastMessage.role === "assistant") {
              lastMessage.isThinkingComplete = true;
              if (thinkingStartTime) {
                lastMessage.thinkingTime = Math.round((Date.now() - thinkingStartTime) / 1000);
              }
            }
          }
        },
        (error) => {
          // 处理错误
          if (this.isLoading) {
            // 如果还在loading状态，创建错误消息
            const errorMessage = {
              role: "assistant",
              content: error,
              timestamp: new Date(),
              reasoning: "",
              thinkingTime: 0,
              isThinkingComplete: true,
              showThinking: false,
            };
            this.messages.push(errorMessage);
          } else {
            // 否则更新最后一条消息
            const lastIndex = this.messages.length - 1;
            this.messages[lastIndex].content = error;
            this.messages[lastIndex].isThinkingComplete = true;
          }
          this.isLoading = false;
        },
        // 新增推理内容处理回调
        (reasoningChunk) => {
          console.log("reasoningChunk----", reasoningChunk);

          if (!thinkingStartTime) {
            thinkingStartTime = Date.now();
          }

          // 如果还没有创建AI消息，先创建一个
          if (this.isLoading) {
            const aiMessage = {
              role: "assistant",
              content: "",
              timestamp: new Date(),
              // 扩展消息对象结构
              reasoning: reasoningChunk, // 推理过程内容
              thinkingTime: 0, // 思考用时（秒）
              isThinkingComplete: false, // 思考是否完成，初始为false
              showThinking: isReasonerModel, // 是否显示思考功能
            };
            this.messages.push(aiMessage);
            this.isLoading = false;
          } else {
            // 更新最后一条AI消息的推理内容
            if (this.messages.length > 0) {
              const lastIndex = this.messages.length - 1;
              const lastMessage = this.messages[lastIndex];
              if (lastMessage.role === "assistant") {
                lastMessage.reasoning += reasoningChunk;
              }
            }
          }
        }
      );
    },
  },
  mounted() {
    // 初始化模型设置
    apiService.setModel(this.currentModel);

    if (this.apiKey) {
      this.addWelcomeMessage();
    }
  },
};
</script>

<style scoped>
#chat-app {
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