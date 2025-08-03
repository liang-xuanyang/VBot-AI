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
      <!-- 用户消息保持基本格式（换行等），但不解析 Markdown -->
      <div v-if="message.role === 'user'" class="message-text" v-html="userFormattedContent"></div>
      <!-- AI 消息使用 Markdown 解析 -->
      <div v-else class="message-text">
        <div v-for="(block, index) in contentBlocks" v-bind:key="index">
          <MermaidChart
            v-if="block.type === 'mermaid'"
            v-bind:code="block.content"
            v-on:copy-success="handleCopySuccess"
            v-on:copy-error="handleCopyError"
            v-on:download-error="handleDownloadError"
          />
          <div v-else v-html="block.content"></div>
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
  </div>
</template>

<script>
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import DOMPurify from "dompurify";
import MermaidChart from "./MermaidChart.vue";

export default {
  name: "MessageItem",
  components: {
    MermaidChart,
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
    // 处理 Markdown 内容
    processMarkdownContent(content) {
      const blocks = [];
      try {
        // 使用 marked.use() 配置渲染器（仅一次）
        if (!this.markedConfigured) {
          marked.use({
            renderer: {
              // 自定义代码块渲染 - 新版本使用 token 对象
              code(token) {
                try {
                  // 从 token 对象中获取代码和语言
                  const code = token.text || "";
                  const language = token.lang || "";
                  // 安全的语言检查
                  const safeLang = language && typeof language === "string" ? language.trim() : "";
                  const validLanguage = safeLang && hljs.getLanguage(safeLang) ? safeLang : "plaintext";

                  // 安全的代码高亮
                  let highlightedCode;
                  try {
                    highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
                  } catch (highlightError) {
                    console.warn("代码高亮失败:", highlightError);
                    // 如果高亮失败，使用原始代码但进行HTML转义
                    highlightedCode = DOMPurify.sanitize(code, { ALLOWED_TAGS: [] });
                  }

                  // 安全的显示语言
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
                  // 降级处理：返回安全的简单代码块
                  const safeCode = DOMPurify.sanitize(token.text || "", { ALLOWED_TAGS: [] });
                  return `<pre><code>${safeCode}</code></pre>`;
                }
              },

              // 自定义行内代码渲染 - 新版本使用 token 对象
              codespan(token) {
                try {
                  // 从 token 对象中获取代码
                  const code = token.text || "";
                  // 对行内代码进行安全处理
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

        // 安全的Markdown解析配置
        const result = marked.parse(content, {
          breaks: true,
          gfm: true,
          // 启用更严格的解析
          pedantic: false,
        });

        // 使用DOMPurify进行最终的安全清理，允许常见的格式化标签
        const sanitizedResult = DOMPurify.sanitize(result, {
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
          ALLOW_DATA_ATTR: false,
        });

        blocks.push({ type: "markdown", content: sanitizedResult });
        return blocks;
      } catch (error) {
        console.error("Markdown解析失败:", error);
        // 降级处理：返回原始文本，但进行安全清理
        const safeContent = DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
        return safeContent.replace(/\n/g, "<br>");
      }
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
}
</style>
