<template>
  <div class="config-container">
    <div class="config-card">
      <div class="logo-container">
        <img style="width: 120px; height: 120px" src="/favicon.svg" alt="VueBot" class="logo" />

        <h1>VueBot</h1>
      </div>
      <p class="subtitle">请配置您的 DeepSeek API Key 开始对话</p>
      <div class="input-group">
        <input
          v-model="inputApiKey"
          type="password"
          placeholder="请输入您的 DeepSeek API Key"
          class="api-input"
          @keyup.enter="handleSetApiKey"
        />
        <button @click="handleSetApiKey" class="set-btn" :disabled="!inputApiKey.trim()">设置</button>
      </div>
      <div class="help-text">
        <p>💡 如何获取 API Key：</p>
        <p>1. 访问 <a href="https://platform.deepseek.com" target="_blank">DeepSeek 平台</a></p>
        <p>2. 注册并登录账户</p>
        <p>3. 在 API Keys 页面创建新的密钥</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ApiKeyConfig",
  data() {
    return {
      inputApiKey: "",
    };
  },
  methods: {
    handleSetApiKey() {
      if (this.inputApiKey.trim()) {
        this.$emit("api-key-set", this.inputApiKey.trim());
        this.inputApiKey = "";
      }
    },
  },
};
</script>

<style scoped>
.config-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.config-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.logo {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.config-card h1 {
  font-size: 2.5em;
  margin: 0;
  color: #333;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1em;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.api-input {
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.api-input:focus {
  outline: none;
  border-color: #667eea;
}

.set-btn {
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.set-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.set-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.help-text {
  text-align: left;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  color: #666;
}

.help-text p {
  margin-bottom: 5px;
}

.help-text a {
  color: #667eea;
  text-decoration: none;
}

@media (max-width: 768px) {
  .config-card {
    padding: 30px 20px;
  }

  .logo {
    width: 44px;
    height: 44px;
  }

  .config-card h1 {
    font-size: 2em;
  }

  .input-group {
    flex-direction: column;
  }

  .api-input,
  .set-btn {
    width: 100%;
  }
}
</style>
