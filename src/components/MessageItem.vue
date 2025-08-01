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
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

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
      // 配置marked使用highlight.js进行代码高亮
      const renderer = new marked.Renderer();
      
      // 自定义代码块渲染
      renderer.code = function(code, language) {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        const highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
        
        return `
          <div class="code-block">
            <div class="code-header">
              <span class="code-language">${language || 'text'}</span>
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
      };

      // 自定义行内代码渲染
      renderer.codespan = function(code) {
        return `<code class="inline-code">${code}</code>`;
      };

      return marked(this.message.content, {
        breaks: true,
        gfm: true,
        renderer: renderer,
      });
    },
  },
  mounted() {
    // 添加全局复制函数
    if (!window.copyCode) {
      window.copyCode = function(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code).then(() => {
          const originalText = button.innerHTML;
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            已复制
          `;
          button.style.color = '#52c41a';
          
          setTimeout(() => {
            button.innerHTML = originalText;
            button.style.color = '';
          }, 2000);
        }).catch(() => {
          button.textContent = '复制失败';
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
  text-transform: uppercase;
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
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
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
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
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
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
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
