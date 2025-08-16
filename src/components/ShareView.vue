<template>
  <div class="share-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载分享内容...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h2>无法加载分享内容</h2>
      <p class="error-message">{{ error }}</p>
      <button @click="retry" class="retry-button">重试</button>
      <router-link to="/" class="back-home-link">返回首页</router-link>
    </div>

    <!-- 分享内容 -->
    <div v-else-if="shareData" class="share-content">
      <!-- 分享头部信息 -->
      <div class="share-header">
        <div class="share-info">
          <h1 class="share-title">AI 对话分享</h1>
          <div class="share-meta">
            <span class="share-date">分享时间: {{ formatDate(shareData.metadata.createdAt) }}</span>
            <span class="share-views">查看次数: {{ shareData.stats.views }}</span>
            <span v-if="shareData.metadata.publicAccess" class="public-badge">公开</span>
            <span v-else class="private-badge">私有</span>
          </div>
        </div>
        <div class="share-actions">
          <button @click="copyShareLink" class="action-button copy-button">
            <span class="button-icon">🔗</span>
            复制链接
          </button>
          <button @click="downloadAsText" class="action-button download-button">
            <span class="button-icon">📄</span>
            下载文本
          </button>
        </div>
      </div>

      <!-- 上下文对话 -->
      <div v-if="shareData.metadata.includeContext && shareData.context.length > 0" class="context-section">
        <h3 class="section-title">上下文对话</h3>
        <div class="messages-container">
          <div
            v-for="(message, index) in shareData.context"
            :key="`context-${index}`"
            class="message-item"
            :class="message.role"
          >
            <div class="message-avatar">
              <span v-if="message.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">{{ message.role === "user" ? "用户" : "AI助手" }}</span>
                <span class="message-time">{{ formatDate(message.timestamp) }}</span>
              </div>
              <div class="message-text" v-html="formatMessageContent(message.content)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要消息 -->
      <div class="main-message-section">
        <h3 class="section-title">{{ shareData.metadata.includeContext ? "当前对话" : "分享内容" }}</h3>
        <div class="messages-container">
          <div class="message-item main-message" :class="shareData.message.role">
            <div class="message-avatar">
              <span v-if="shareData.message.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-role">{{ shareData.message.role === "user" ? "用户" : "AI助手" }}</span>
                <span class="message-time">{{ formatDate(shareData.message.timestamp) }}</span>
              </div>
              <div class="message-text" v-html="formatMessageContent(shareData.message.content)"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分享信息 -->
      <div class="share-footer">
        <div class="footer-info">
          <p class="powered-by">由 <strong>Vue Bot AI</strong> 提供支持</p>
          <p class="disclaimer">此内容由AI生成，仅供参考</p>
        </div>
        <div class="footer-actions">
          <router-link to="/" class="create-chat-link">创建新对话</router-link>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Toast v-if="toast.show" :message="toast.message" :type="toast.type" @close="closeToast" />
  </div>
</template>

<script>
import { marked } from "marked";
import hljs from "highlight.js";
import shareService from "../services/shareService.js";
import { copyToClipboard } from "../utils/clipboard.js";
import Toast from "./Toast.vue";

export default {
  name: "ShareView",
  components: {
    Toast,
  },
  data() {
    return {
      shareData: null,
      loading: true,
      error: null,
      toast: {
        show: false,
        message: "",
        type: "success",
      },
    };
  },
  async mounted() {
    await this.loadShareData();
  },
  watch: {
    $route() {
      this.loadShareData();
    },
  },
  methods: {
    /**
     * 加载分享数据
     */
    async loadShareData() {
      this.loading = true;
      this.error = null;

      try {
        const shareId = this.$route.params.shareId;

        if (!shareId) {
          throw new Error("分享ID不能为空");
        }

        const data = shareService.getShareData(shareId);

        if (!data) {
          throw new Error("分享内容不存在或已过期");
        }

        this.shareData = data;
      } catch (error) {
        console.error("加载分享数据失败:", error);
        this.error = error.message || "加载失败，请稍后重试";
      } finally {
        this.loading = false;
      }
    },

    /**
     * 重试加载
     */
    async retry() {
      await this.loadShareData();
    },

    /**
     * 格式化消息内容
     * @param {string} content - 消息内容
     * @returns {string} 格式化后的HTML
     */
    formatMessageContent(content) {
      if (!content) return "";

      try {
        // 配置marked选项
        marked.setOptions({
          highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
              try {
                return hljs.highlight(code, { language: lang }).value;
              } catch (err) {
                console.warn("代码高亮失败:", err);
              }
            }
            return hljs.highlightAuto(code).value;
          },
          breaks: true,
          gfm: true,
        });

        return marked(content);
      } catch (error) {
        console.error("格式化消息内容失败:", error);
        return content.replace(/\n/g, "<br>");
      }
    },

    /**
     * 格式化日期
     * @param {string|Date} date - 日期
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(date) {
      try {
        return new Date(date).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return "未知时间";
      }
    },

    /**
     * 复制分享链接
     */
    async copyShareLink() {
      try {
        const shareLink = shareService.generateShareLink(this.shareData.id);
        const success = await copyToClipboard(shareLink);

        if (success) {
          this.showToast("分享链接已复制到剪贴板", "success");
        } else {
          throw new Error("复制失败");
        }
      } catch (error) {
        console.error("复制分享链接失败:", error);
        this.showToast("复制失败，请手动复制链接", "error");
      }
    },

    /**
     * 下载为文本文件
     */
    downloadAsText() {
      try {
        const shareLink = shareService.generateShareLink(this.shareData.id);
        const textContent = shareService.formatMessageAsText(this.shareData.message, this.shareData.context, {
          includeContext: this.shareData.metadata.includeContext,
          shareLink: shareLink,
        });

        // 创建下载链接
        const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `AI对话分享_${this.formatDate(this.shareData.metadata.createdAt).replace(/[:/\s]/g, "_")}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 清理URL对象
        URL.revokeObjectURL(url);

        this.showToast("文件下载已开始", "success");
      } catch (error) {
        console.error("下载文本失败:", error);
        this.showToast("下载失败，请稍后重试", "error");
      }
    },

    /**
     * 显示Toast提示
     * @param {string} message - 提示消息
     * @param {string} type - 提示类型
     */
    showToast(message, type = "success") {
      this.toast = {
        show: true,
        message,
        type,
      };
    },

    /**
     * 关闭Toast提示
     */
    closeToast() {
      this.toast.show = false;
    },
  },
};
</script>

<style scoped>
.share-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-container h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.error-message {
  margin: 0 0 30px 0;
  opacity: 0.8;
  font-size: 16px;
}

.retry-button {
  background: #667eea;
  border: 2px solid #667eea;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: #5a6fd8;
  border-color: #5a6fd8;
}

.back-home-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.back-home-link:hover {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline;
}

/* 分享内容 */
.share-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 分享头部 */
.share-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.share-title {
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: 600;
}

.share-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  opacity: 0.9;
}

.public-badge,
.private-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.share-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.button-icon {
  font-size: 16px;
}

/* 内容区域 */
.context-section,
.main-message-section {
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.main-message-section {
  border-bottom: none;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

/* 消息容器 */
.messages-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-item.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-item.assistant .message-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.message-role {
  font-weight: 600;
  color: #333;
}

.message-time {
  color: #666;
  font-size: 12px;
}

.message-text {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
}

.message-item.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.main-message .message-text {
  border: 2px solid #667eea;
  background: #f8f9ff;
}

/* 代码块样式 */
.message-text :deep(pre) {
  background: #2d3748;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
}

.message-text :deep(pre code) {
  background: none;
  padding: 0;
}

/* 分享页脚 */
.share-footer {
  background: #f8f9fa;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-info {
  color: #666;
  font-size: 14px;
}

.footer-info p {
  margin: 0 0 5px 0;
}

.powered-by {
  font-weight: 500;
}

.disclaimer {
  font-size: 12px;
  opacity: 0.8;
}

.create-chat-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.create-chat-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-view {
    padding: 10px;
  }

  .share-header {
    padding: 20px;
    flex-direction: column;
    align-items: stretch;
  }

  .share-actions {
    justify-content: center;
  }

  .context-section,
  .main-message-section {
    padding: 20px;
  }

  .share-footer {
    padding: 20px;
    flex-direction: column;
    text-align: center;
  }

  .message-item {
    gap: 10px;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .share-title {
    font-size: 24px;
  }
}
</style>
