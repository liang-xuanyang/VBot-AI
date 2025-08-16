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

    <!-- 用户消息内容区域 -->
    <div v-if="message.role === 'user'" class="message-content">
      <div class="message-text" v-html="userFormattedContent"></div>
    </div>

    <!-- AI消息内容区域 -->
    <div v-else class="message-content">
      <!-- 深度思考显示组件 -->
      <ThinkingDisplay
        v-if="message.showThinking"
        :reasoning-content="message.reasoning || ''"
        :is-thinking-complete="message.isThinkingComplete || false"
        :thinking-time="message.thinkingTime || 0"
        :show-thinking="message.showThinking || false"
      />

      <div class="message-text">
        <div v-for="(block, index) in contentBlocks" :key="`block-${index}`" class="content-block">
          <!-- Mermaid图表渲染 -->
          <MermaidChart
            v-if="block.type === 'mermaid'"
            :code="block.content"
            class="mermaid-block"
            @copy-success="handleCopySuccess"
            @copy-error="handleCopyError"
            @download-error="handleDownloadError"
          />

          <!-- Markdown内容渲染 -->
          <div v-else-if="block.type === 'markdown'" v-html="block.content" class="markdown-block"></div>
        </div>
      </div>
      <!-- AI消息操作按钮 - 独占一行显示在内容下方右下角 -->
      <div class="ai-action-buttons-container">
        <!-- 分享按钮 -->
        <div class="message-action-button ai-share-button" @click="openShareDialog" title="分享消息">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" fill="none" />
            <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none" />
            <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" fill="none" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>

        <!-- 复制按钮 -->
        <div
          class="message-action-button ai-copy-button"
          @click="copyMessage"
          :class="{ copying: messageCopyState === 'copying', success: messageCopyState === 'success' }"
          title="复制消息"
        >
          <svg
            v-if="messageCopyState === 'idle'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none" />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
          </svg>
          <svg
            v-else-if="messageCopyState === 'success'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
          <div v-else class="copy-loading"></div>
        </div>
      </div>
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

    <!-- 分享对话框 -->
    <ShareDialog
      :visible="showShareDialog"
      :message="message"
      :messages="$parent.messages || []"
      @close="closeShareDialog"
    />
  </div>
</template>

<script>
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
// 导入Vue语言支持
import vue from "highlight.js/lib/languages/xml"; // Vue使用XML语法

import DOMPurify from "dompurify";

// 注册语言
hljs.registerLanguage("vue", vue);

import MermaidChart from "./MermaidChart.vue";
import ThinkingDisplay from "./ThinkingDisplay.vue";
import ShareDialog from "./ShareDialog.vue";
import { copyToClipboard } from "../utils/clipboard.js";

export default {
  name: "MessageItem",
  components: {
    MermaidChart,
    ThinkingDisplay,
    ShareDialog,
  },
  props: {
    message: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value.role === "string" && typeof value.content === "string";
      },
    },
  },
  data() {
    return {
      // 标记是否已配置 marked
      markedConfigured: false,
      messageCopyState: "idle", // 消息复制状态: idle, copying, success
      showShareDialog: false, // 控制分享对话框显示
    };
  },
  computed: {
    // 用户消息格式化：保持换行和基本格式，但不解析 Markdown
    userFormattedContent() {
      if (!this.message || !this.message.content || typeof this.message.content !== "string") {
        return "";
      }

      // 手动进行HTML转义，确保安全性
      let safeContent = this.message.content
        .replace(/&/g, "&amp;") // 先转义 &
        .replace(/</g, "&lt;") // 转义 <
        .replace(/>/g, "&gt;") // 转义 >
        .replace(/"/g, "&quot;") // 转义 "
        .replace(/'/g, "&#x27;"); // 转义 '

      // 增强的格式化处理
      safeContent = safeContent
        // 将换行符转换为HTML换行标签
        .replace(/\n/g, "<br>")
        // 保留多个空格（可选：让用户的缩进更明显）
        .replace(/  /g, "&nbsp;&nbsp;")
        // 简单的URL链接识别（安全版本）
        .replace(/(https?:\/\/[^\s<>"']+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

      return safeContent;
    },

    // 内容块解析：处理 Mermaid 和普通 Markdown
    contentBlocks() {
      // 只有 AI 消息才需要解析
      if (this.message.role !== "assistant") {
        return [];
      }
      // 边界情况检查
      if (!this.message || !this.message.content || typeof this.message.content !== "string") {
        return [];
      }
      // 解析内容块
      const blocks = this.processMarkdownContent(this.message.content);
      return blocks;
    },
  },
  methods: {
    /**
     * 处理Markdown内容，分离Mermaid和普通Markdown
     * @param {string} content - 原始Markdown内容
     * @returns {Array} 处理后的块数组
     */
    processMarkdownContent(content) {
      const blocks = [];

      try {
        // 1. 使用marked.lexer进行词法分析
        const tokens = marked.lexer(content);

        // 2. 分组处理tokens
        let currentMarkdownTokens = [];

        for (const token of tokens) {
          if (
            token.type === "code" &&
            typeof token.lang === "string" &&
            token.lang.trim().split(/\s+/, 1)[0].toLowerCase() === "mermaid"
          ) {
            // 3. 处理之前累积的markdown内容
            if (currentMarkdownTokens.length > 0) {
              blocks.push({
                type: "markdown",
                content: this.processMarkdownTokens(currentMarkdownTokens),
              });
              currentMarkdownTokens = [];
            }

            // 4. 处理mermaid块
            blocks.push({
              type: "mermaid",
              content: token.text,
              id: this.generateUniqueId(),
            });
          } else {
            // 5. 累积非mermaid内容
            currentMarkdownTokens.push(token);
          }
        }

        // 6. 处理剩余的markdown内容
        if (currentMarkdownTokens.length > 0) {
          blocks.push({
            type: "markdown",
            content: this.processMarkdownTokens(currentMarkdownTokens),
          });
        }

        return blocks;
      } catch (error) {
        console.error("内容处理失败:", error);
        return [
          {
            type: "markdown",
            content: DOMPurify.sanitize(content.replace(/\n/g, "<br>")),
          },
        ];
      }
    },

    /**
     * 处理Markdown tokens并转换为安全的HTML
     * @param {Array} tokens - Token数组
     * @returns {string} 处理后的HTML字符串
     */
    processMarkdownTokens(tokens) {
      try {
        // 配置marked渲染器（仅一次）
        if (!this.markedConfigured) {
          marked.use({
            renderer: {
              // 自定义代码块渲染
              code(token) {
                try {
                  const code = token.text || "";
                  const language = token.lang || "";
                  console.log("原始语言:", language);
                  console.log("原始代码:", code);

                  const safeLang = language && typeof language === "string" ? language.trim() : "";
                  const validLanguage = safeLang && hljs.getLanguage(safeLang) ? safeLang : "plaintext";

                  let highlightedCode;
                  try {
                    highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
                  } catch (highlightError) {
                    console.warn("代码高亮失败:", highlightError);
                    highlightedCode = DOMPurify.sanitize(code, { ALLOWED_TAGS: [] });
                  }

                  const displayLanguage = DOMPurify.sanitize(safeLang || "text", { ALLOWED_TAGS: [] });

                  return `
                    <div class="code-block">
                      <div class="code-header">
                        <span class="code-language">${displayLanguage}</span>
                        <button class="copy-btn" onclick="copyCode(this)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="m5 15-4-4 4-4"></path>
                            <path d="M5 15H9a2 2 0 0 0 2-2V9"></path>
                          </svg>
                          复制
                        </button>
                      </div>
                      <pre><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>
                    </div>
                  `;
                } catch (error) {
                  console.error("代码块渲染失败:", error);
                  const safeCode = DOMPurify.sanitize(token.text || "", { ALLOWED_TAGS: [] });
                  return `<pre><code>${safeCode}</code></pre>`;
                }
              },

              // 自定义行内代码渲染
              codespan(token) {
                try {
                  const code = token.text || "";
                  const safeCode = DOMPurify.sanitize(code, { ALLOWED_TAGS: [] });
                  return `<code class="inline-code">${safeCode}</code>`;
                } catch (error) {
                  console.error("行内代码渲染失败:", error);
                  const safeCode = DOMPurify.sanitize(token.text || "", { ALLOWED_TAGS: [] });
                  return `<code>${safeCode}</code>`;
                }
              },
            },
          });
          this.markedConfigured = true;
        }

        // 使用marked.parser将tokens转换为HTML
        const html = marked.parser(tokens);

        // 使用DOMPurify进行安全处理
        return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "em",
            "u",
            "del",
            "s",
            "strike",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ul",
            "ol",
            "li",
            "blockquote",
            "a",
            "img",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
            "pre",
            "code",
            "div",
            "span",
            "button",
            "svg",
            "rect",
            "path",
            "polyline",
          ],
          ALLOWED_ATTR: [
            "href",
            "title",
            "alt",
            "src",
            "class",
            "id",
            "width",
            "height",
            "viewBox",
            "fill",
            "stroke",
            "stroke-width",
            "onclick",
            "x",
            "y",
            "rx",
            "ry",
            "d",
            "points",
          ],
        });
      } catch (error) {
        console.error("Markdown tokens处理失败:", error);
        // 降级处理：返回安全的简单文本
        return DOMPurify.sanitize(tokens.map((t) => t.raw || "").join(""), { ALLOWED_TAGS: [] }).replace(/\n/g, "<br>");
      }
    },

    /**
     * 生成唯一的Mermaid图表ID
     * @returns {string} 唯一标识符
     */
    generateUniqueId() {
      return `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    // 处理复制成功事件
    handleCopySuccess(message) {
      console.log("复制成功:", message);
      // 可以在这里添加用户提示
    },

    // 处理复制错误事件
    handleCopyError(error) {
      console.error("复制失败:", error);
      // 可以在这里添加错误提示
    },

    // 处理下载错误事件
    handleDownloadError(error) {
      console.error("下载失败:", error);
      // 可以在这里添加错误提示
    },

    // 复制消息内容到剪贴板
    async copyMessage() {
      if (this.messageCopyState === "copying") return;

      this.messageCopyState = "copying";

      try {
        const success = await copyToClipboard(this.message.content);
        if (success) {
          this.messageCopyState = "success";
          this.$emit("copy-success", "消息已复制到剪贴板");

          // 2秒后重置状态
          setTimeout(() => {
            this.messageCopyState = "idle";
          }, 2000);
        } else {
          throw new Error("复制失败");
        }
      } catch (error) {
        console.error("复制消息失败:", error);
        this.messageCopyState = "idle";
        this.$emit("copy-error", "复制失败，请重试");
      }
    },
    // 处理鼠标进入
    handleMouseEnter() {
      if (this.message.role === "user") {
        this.isHovered = true;
      }
    },
    // 处理鼠标离开
    handleMouseLeave() {
      if (this.message.role === "user") {
        this.isHovered = false;
      }
    },

    // 打开分享对话框
    openShareDialog() {
      this.showShareDialog = true;
    },

    // 关闭分享对话框
    closeShareDialog() {
      this.showShareDialog = false;
    },
  },
  mounted() {
    // 添加全局复制函数
    if (!window.copyCode) {
      window.copyCode = function (button) {
        const codeBlock = button.closest(".code-block");
        const code = codeBlock.querySelector("code").textContent;

        navigator.clipboard
          .writeText(code)
          .then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            已复制
          `;
            button.style.color = "#52c41a";

            setTimeout(() => {
              button.innerHTML = originalText;
              button.style.color = "";
            }, 2000);
          })
          .catch(() => {
            button.textContent = "复制失败";
            setTimeout(() => {
              button.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="m5 15-4-4 4-4"></path>
                <path d="M5 15H9a2 2 0 0 0 2-2V9"></path>
              </svg>
              复制
            `;
            }, 2000);
          });
      };
    }
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
  padding-top: 16px;
  padding-bottom: 16px;
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

/* 代码块样式 */
.message-text :deep(.code-block) {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
  background: #f8f9fa;
}

.message-text :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f1f3f4;
  border-bottom: 1px solid #e1e8ed;
  font-size: 12px;
}

.message-text :deep(.code-language) {
  color: #666;
  font-weight: 500;
}

.message-text :deep(.copy-btn) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #d0d7de;
  border-radius: 4px;
  color: #656d76;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-text :deep(.copy-btn:hover) {
  background: #f3f4f6;
  border-color: #8c959f;
}

.message-text :deep(.code-block pre) {
  margin: 0;
  padding: 16px;
  background: #ffffff;
  overflow-x: auto;
  font-family: "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace;
  font-size: 14px;
  line-height: 1.45;
}

.message-text :deep(.code-block code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-family: inherit;
}

/* 行内代码样式 */
.message-text :deep(.inline-code) {
  background: #f6f8fa;
  color: #d73a49;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace;
  font-size: 0.9em;
  border: 1px solid #e1e4e8;
}

/* 覆盖默认的pre和code样式 */
.message-text :deep(pre:not(.code-block pre)) {
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 10px 0;
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
}

.message-text :deep(code:not(.hljs):not(.inline-code)) {
  background: #f6f8fa;
  color: #d73a49;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace;
  font-size: 0.9em;
}

/* 内容块样式 */
.message-text :deep(.content-block) {
  margin-bottom: 16px;
}

.message-text :deep(.content-block:last-child) {
  margin-bottom: 0;
}

.message-text :deep(.mermaid-block) {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
  background: #f8f9fa;
}

.message-text :deep(.markdown-block) {
  /* 继承现有的markdown样式 */
}

/* 消息操作按钮样式 */
.message-action-button {
  position: absolute;
  top: 8px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  backdrop-filter: blur(4px);
  z-index: 10;
}

/* AI消息操作按钮容器 - 独占一行右对齐 */
.ai-action-buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

/* AI消息操作按钮 - 右下角 */
.ai-copy-button,
.ai-share-button {
  position: static;
  margin: 0;
}

.message-action-button:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: #667eea;
  color: #667eea;
  transform: scale(1.05);
}

.message-action-button.copying {
  color: #ffa500;
  cursor: not-allowed;
}

.message-action-button.success {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  border-color: #52c41a;
}

.copy-loading {
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ffa500;
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

/* 消息内容相对定位以支持绝对定位的复制按钮 */
.message-content {
  position: relative;
}

/* AI消息固定复制按钮样式调整 */
.fixed-copy-button {
  opacity: 0.8;
}

.fixed-copy-button:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .ai-message .message-content {
    width: auto;
    max-width: 85%;
  }

  .message-text :deep(.code-header) {
    padding: 6px 12px;
  }

  .message-text :deep(.code-block pre) {
    padding: 12px;
    font-size: 13px;
  }

  .message-text :deep(.content-block) {
    margin-bottom: 12px;
  }

  .message-text :deep(.mermaid-block) {
    margin: 12px 0;
  }

  .message-action-button {
    width: 28px;
    height: 28px;
    top: 6px;
  }

  .ai-action-buttons-container {
    margin-top: 6px;
    padding-top: 6px;
    gap: 6px;
  }
}
</style>
