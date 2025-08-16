<template>
  <div v-if="visible" class="share-dialog-overlay" @click="handleOverlayClick">
    <div class="share-dialog" @click.stop>
      <div class="share-header">
        <h3>分享对话</h3>
        <button class="close-btn" @click="closeDialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="share-content">
        <!-- 分享方式选择 -->
        <div class="share-options">
          <div class="share-option" :class="{ active: shareType === 'link' }" @click="shareType = 'link'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>分享链接</span>
          </div>

          <div class="share-option" :class="{ active: shareType === 'text' }" @click="shareType = 'text'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            <span>复制文本</span>
          </div>


        </div>

        <!-- 分享内容预览 -->
        <div class="share-preview">
          <div v-if="shareType === 'link'" class="link-preview">
            <div class="preview-label">分享链接预览：</div>
            <div class="link-container">
              <input
                ref="linkInput"
                v-model="shareLink"
                readonly
                class="share-link-input"
                placeholder="生成分享链接中..."
              />
              <button
                class="copy-link-btn"
                @click="copyShareLink"
                :disabled="!shareLink || linkCopyState === 'copying'"
                :class="{ copying: linkCopyState === 'copying', success: linkCopyState === 'success' }"
              >
                <svg
                  v-if="linkCopyState === 'idle'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg
                  v-else-if="linkCopyState === 'success'"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <div v-else class="copy-loading"></div>
                {{ linkCopyState === "success" ? "已复制" : "复制" }}
              </button>
            </div>
            <div class="link-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="includeContext" />
                <span>包含上下文对话</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="allowPublicAccess" />
                <span>允许公开访问</span>
              </label>
            </div>
          </div>

          <div v-else-if="shareType === 'text'" class="text-preview">
            <div class="preview-label">文本内容预览：</div>
            <textarea
              v-model="shareText"
              readonly
              class="share-text-area"
              rows="8"
              placeholder="生成分享文本中..."
            ></textarea>
            <button
              class="copy-text-btn"
              @click="copyShareText"
              :disabled="!shareText || textCopyState === 'copying'"
              :class="{ copying: textCopyState === 'copying', success: textCopyState === 'success' }"
            >
              <svg
                v-if="textCopyState === 'idle'"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <svg
                v-else-if="textCopyState === 'success'"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
              <div v-else class="copy-loading"></div>
              {{ textCopyState === "success" ? "已复制到剪贴板" : "复制文本" }}
            </button>
          </div>


        </div>
      </div>

      <!-- Toast 提示 -->
      <Toast
        v-if="toast.visible"
        :message="toast.message"
        :type="toast.type"
        :visible="toast.visible"
        @close="hideToast"
      />
    </div>
  </div>
</template>

<script>
import Toast from "./Toast.vue";
import { copyToClipboard } from "../utils/clipboard.js";
import shareService from "../services/shareService.js";

export default {
  name: "ShareDialog",
  components: {
    Toast,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: Object,
      required: true,
    },
    messages: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      shareType: "link", // link, text
      shareLink: "",
      shareText: "",
      includeContext: true,
      allowPublicAccess: false,
      linkCopyState: "idle", // idle, copying, success
      textCopyState: "idle",
      toast: {
        visible: false,
        message: "",
        type: "info",
      },
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeShareData();
      } else {
        this.resetStates();
      }
    },
    shareType() {
      this.generateShareContent();
    },
    includeContext() {
      if (this.shareType === "link") {
        this.generateShareContent();
      }
    },
  },
  methods: {
    closeDialog() {
      this.$emit("close");
    },

    handleOverlayClick() {
      this.closeDialog();
    },

    initializeShareData() {
      this.generateShareContent();
    },

    resetStates() {
      this.shareLink = "";
      this.shareText = "";
      this.linkCopyState = "idle";
      this.textCopyState = "idle";
      this.hideToast();
    },

    async generateShareContent() {
      try {
        switch (this.shareType) {
          case "link":
            await this.generateShareLink();
            break;
          case "text":
            this.generateShareText();
            break;
        }
      } catch (error) {
        console.error("生成分享内容失败:", error);
        this.showToast("生成分享内容失败，请重试", "error");
      }
    },

    async generateShareLink() {
      // 创建分享数据
      const shareData = shareService.createShareData(
        this.message,
        this.includeContext ? this.getContextMessages() : [],
        {
          allowPublicAccess: this.allowPublicAccess,
          includeContext: this.includeContext,
          shareType: "link",
        }
      );

      // 保存分享数据
      const saved = shareService.saveShareData(shareData);
      if (!saved) {
        throw new Error("保存分享数据失败");
      }

      // 生成分享链接
      this.shareLink = shareService.generateShareLink(shareData.id);
    },

    generateShareText() {
      // 使用shareService生成分享文本
      this.shareText = shareService.formatMessageAsText(
        this.message,
        this.includeContext ? this.getContextMessages() : [],
        {
          includeContext: this.includeContext,
        }
      );
    },



    async copyShareLink() {
      if (!this.shareLink || this.linkCopyState === "copying") return;

      this.linkCopyState = "copying";

      try {
        const success = await copyToClipboard(this.shareLink);
        if (success) {
          this.linkCopyState = "success";
          this.showToast("分享链接已复制到剪贴板", "success");

          setTimeout(() => {
            this.linkCopyState = "idle";
          }, 2000);
        } else {
          throw new Error("复制失败");
        }
      } catch (error) {
        console.error("复制分享链接失败:", error);
        this.linkCopyState = "idle";
        this.showToast("复制失败，请重试", "error");
      }
    },

    async copyShareText() {
      if (!this.shareText || this.textCopyState === "copying") return;

      this.textCopyState = "copying";

      try {
        const success = await copyToClipboard(this.shareText);
        if (success) {
          this.textCopyState = "success";
          this.showToast("文本内容已复制到剪贴板", "success");

          setTimeout(() => {
            this.textCopyState = "idle";
          }, 2000);
        } else {
          throw new Error("复制失败");
        }
      } catch (error) {
        console.error("复制文本失败:", error);
        this.textCopyState = "idle";
        this.showToast("复制失败，请重试", "error");
      }
    },

    getContextMessages() {
      // 获取当前消息前的几条相关对话
      const currentIndex = this.messages.findIndex(
        (msg) => msg.content === this.message.content && msg.role === this.message.role
      );

      if (currentIndex === -1) return [];

      // 返回当前消息前的最多3条消息作为上下文
      const startIndex = Math.max(0, currentIndex - 3);
      return this.messages.slice(startIndex, currentIndex);
    },

    showToast(message, type = "info") {
      this.toast = {
        visible: true,
        message,
        type,
      };
    },

    hideToast() {
      this.toast.visible = false;
    },
  },
};
</script>

<style scoped>
.share-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.share-dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  position: relative;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5e9;
}

.share-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.share-content {
  padding: 24px;
}

.share-options {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.share-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.share-option:hover {
  border-color: #667eea;
  color: #667eea;
}

.share-option.active {
  border-color: #667eea;
  background: #f8f9ff;
  color: #667eea;
}

.share-option span {
  font-size: 14px;
  font-weight: 500;
}

.share-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.preview-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.link-container {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.share-link-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.copy-link-btn,
.copy-text-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.copy-link-btn:hover,
.copy-text-btn:hover {
  background: #5a67d8;
}

.copy-link-btn:disabled,
.copy-text-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.copy-link-btn.copying,
.copy-text-btn.copying {
  background: #ffa500;
}

.copy-link-btn.success,
.copy-text-btn.success {
  background: #52c41a;
}

.link-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.share-text-area {
  width: 100%;
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
  background: white;
}



.copy-loading {
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-dialog {
    width: 95%;
    margin: 20px;
  }

  .share-options {
    flex-direction: column;
  }

  .share-option {
    flex-direction: row;
    justify-content: flex-start;
  }

  .link-container {
    flex-direction: column;
  }


}
</style>