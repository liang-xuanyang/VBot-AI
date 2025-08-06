<template>
  <div class="thinking-display" v-if="showThinking">
    <!-- 思考状态按钮 -->
    <div class="thinking-header" @click="toggleExpanded">
      <div class="thinking-text">
        <span v-if="isThinkingComplete"> 已深度思考（用时{{ thinkingTime }}秒） </span>
        <span v-else>
          思考中<span class="dots">{{ dots }}</span>
        </span>
      </div>
      <div class="thinking-arrow" :class="{ expanded: isExpanded }">▼</div>
    </div>

    <!-- 思考内容区域 -->
    <div class="thinking-content" v-show="isExpanded" :class="{ 'thinking-in-progress': !isThinkingComplete }">
      <div class="thinking-text-content">
        {{ reasoningContent || "正在思考..." }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ThinkingDisplay",
  props: {
    // 推理内容
    reasoningContent: {
      type: String,
      default: "",
    },
    // 思考是否完成
    isThinkingComplete: {
      type: Boolean,
      default: false,
    },
    // 思考用时（秒）
    thinkingTime: {
      type: Number,
      default: 0,
    },
    // 是否显示思考功能（仅在deepseek-reasoner模型下显示）
    showThinking: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 是否展开思考内容
      isExpanded: true, // 默认展开
      // 思考中的动态点点点效果
      dots: "",
      // 动画定时器
      dotsTimer: null,
    };
  },
  mounted() {
    // 启动思考中的动画效果
    this.startDotsAnimation();
  },
  beforeUnmount() {
    // 清理定时器
    if (this.dotsTimer) {
      clearInterval(this.dotsTimer);
    }
  },
  watch: {
    // 监听思考完成状态，停止动画
    isThinkingComplete(newVal) {
      if (newVal && this.dotsTimer) {
        clearInterval(this.dotsTimer);
        this.dotsTimer = null;
      } else if (!newVal) {
        this.startDotsAnimation();
      }
    },
  },
  methods: {
    // 切换展开/收起状态
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    // 启动思考中的点点点动画
    startDotsAnimation() {
      if (this.dotsTimer) {
        clearInterval(this.dotsTimer);
      }

      this.dotsTimer = setInterval(() => {
        if (this.isThinkingComplete) {
          return;
        }

        if (this.dots.length >= 3) {
          this.dots = "";
        } else {
          this.dots += ".";
        }
      }, 500);
    },
  },
};
</script>

<style scoped>
.thinking-display {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.thinking-header {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px 8px 0 0;
}

.thinking-header:hover {
  background-color: #eeeeee;
}

.thinking-icon {
  font-size: 16px;
  margin-right: 8px;
}

.thinking-text {
  flex: 1;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.dots {
  display: inline-block;
  width: 20px;
  text-align: left;
}

.thinking-arrow {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s ease;
  transform: rotate(-90deg);
}

.thinking-arrow.expanded {
  transform: rotate(0deg);
}

.thinking-content {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
}

.thinking-content.thinking-in-progress {
  border-top: 1px dashed #ccc;
}

.thinking-text-content {
  padding: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .thinking-header {
    padding: 10px 12px;
  }

  .thinking-text-content {
    padding: 12px;
    font-size: 13px;
  }

  .thinking-content {
    max-height: 200px;
  }
}
</style>
