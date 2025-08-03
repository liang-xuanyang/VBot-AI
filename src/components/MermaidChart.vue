<template>
  <div v-bind:class="['mermaid-container', { fullscreen: isFullscreen }]">
    <!-- 按钮工具栏 -->
    <div class="toolbar">
      <!-- 切换按钮 - 左侧 -->
      <div class="view-toggle">
        <button v-bind:class="['toggle-btn', { active: currentView === 'chart' }]" v-on:click="switchView('chart')">
          图表
        </button>
        <button v-bind:class="['toggle-btn', { active: currentView === 'code' }]" v-on:click="switchView('code')">
          代码
        </button>
      </div>

      <!-- 操作按钮 - 右侧 -->
      <div class="action-buttons">
        <!-- 图表视图时显示的按钮 -->
        <template v-if="currentView === 'chart'">
          <button class="action-btn" v-on:click="zoomIn" title="放大">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button class="action-btn" v-on:click="zoomOut" title="缩小">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button class="action-btn" v-on:click="resetTransform" title="重置视图">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
          </button>
          <button class="action-btn" v-on:click="toggleFullscreen" v-bind:title="isFullscreen ? '退出全屏' : '全屏'">
            <svg
              v-if="!isFullscreen"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
              ></path>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
              ></path>
            </svg>
          </button>
        </template>

        <!-- 所有视图都显示的按钮 -->
        <button class="action-btn" v-on:click="copyCode" title="复制代码">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="action-btn" v-on:click="downloadChart" title="下载图表">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 图表视图 -->
    <div v-if="currentView === 'chart'" class="chart-view">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>正在渲染图表...</span>
      </div>
      <div v-else-if="hasError" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">{{ errorMessage }}</div>
      </div>
      <div
        v-else
        ref="chartContainer"
        class="chart-container"
        v-on:wheel="handleWheel"
        v-on:mousedown="handleMouseDown"
        v-on:mousemove="handleMouseMove"
        v-on:mouseup="handleMouseUp"
        v-on:mouseleave="handleMouseLeave"
        v-bind:style="{
          transform: 'scale(' + zoomLevel + ') translate(' + translateX + 'px, ' + translateY + 'px)',
          transformOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : 'grab',
        }"
        v-html="renderedChart"
      ></div>
    </div>

    <!-- 代码视图 -->
    <div v-if="currentView === 'code'" class="code-view">
      <pre class="code-content">{{ mermaidCode }}</pre>
    </div>
  </div>
</template>

<script>
import mermaid from "mermaid";

export default {
  name: "MermaidChart",
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentView: "chart", // 默认显示图表视图
      renderedChart: "",
      isLoading: false,
      hasError: false,
      errorMessage: "",
      zoomLevel: 1,
      isFullscreen: false,
      chartId: `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      // 平移相关状态
      translateX: 0,
      translateY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      startTranslateX: 0,
      startTranslateY: 0,
    };
  },
  computed: {
    mermaidCode() {
      return this.code.trim();
    },
  },
  mounted() {
    this.initMermaid();
    this.renderChart();
    // 监听ESC键退出全屏
    document.addEventListener("keydown", this.handleKeydown);
  },
  beforeUnmount() {
    // 清理事件监听器
    document.removeEventListener("keydown", this.handleKeydown);
  },
  watch: {
    code() {
      this.renderChart();
    },
  },
  methods: {
    initMermaid() {
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        themeVariables: {
          primaryColor: "#c7d2fe",
          primaryTextColor: "#6366f1",
          primaryBorderColor: "#6366f1",
          lineColor: "#6366f1",
          secondaryColor: "#e0e7ff",
          tertiaryColor: "#f1f5f9",
        },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
        },
      });
    },
    async renderChart() {
      if (!this.mermaidCode) return;

      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = "";

      try {
        const { svg } = await mermaid.render(this.chartId, this.mermaidCode);
        this.renderedChart = svg;
      } catch (error) {
        console.error("Mermaid渲染失败:", error);
        this.hasError = true;
        this.errorMessage = "图表渲染失败，请检查语法是否正确";
      } finally {
        this.isLoading = false;
      }
    },
    switchView(view) {
      this.currentView = view;
    },
    zoomIn() {
      if (this.zoomLevel < 2) {
        this.zoomLevel = Math.min(2, this.zoomLevel * 1.2);
        this.constrainTranslation();
      }
    },
    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel = Math.max(0.5, this.zoomLevel * 0.8);
        this.constrainTranslation();
      }
    },
    constrainTranslation() {
      // 根据当前缩放级别限制平移范围
      const maxTranslate = Math.max(0, (this.zoomLevel - 1) * 200);
      this.translateX = Math.max(-maxTranslate, Math.min(maxTranslate, this.translateX));
      this.translateY = Math.max(-maxTranslate, Math.min(maxTranslate, this.translateY));
    },
    resetTransform() {
      this.zoomLevel = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    handleWheel(event) {
      event.preventDefault();
      const delta = event.deltaY;

      if (delta < 0) {
        // 向上滚动，放大
        if (this.zoomLevel < 2) {
          this.zoomLevel = Math.min(2, this.zoomLevel * 1.2);
          this.constrainTranslation();
        }
      } else {
        // 向下滚动，缩小
        if (this.zoomLevel > 0.5) {
          this.zoomLevel = Math.max(0.5, this.zoomLevel * 0.8);
          this.constrainTranslation();
        }
      }
    },
    handleMouseDown(event) {
      if (event.button === 0) {
        // 只处理左键
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.startTranslateX = this.translateX;
        this.startTranslateY = this.translateY;
        event.preventDefault();
      }
    },
    handleMouseMove(event) {
      if (this.isDragging) {
        const deltaX = event.clientX - this.dragStartX;
        const deltaY = event.clientY - this.dragStartY;

        // 计算新的平移位置
        const newTranslateX = this.startTranslateX + deltaX / this.zoomLevel;
        const newTranslateY = this.startTranslateY + deltaY / this.zoomLevel;

        // 获取容器尺寸来限制平移范围
        const container = this.$refs.chartContainer;
        if (container) {
          const maxTranslate = Math.max(0, (this.zoomLevel - 1) * 200); // 根据缩放级别动态调整最大平移距离

          // 限制平移范围
          this.translateX = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateX));
          this.translateY = Math.max(-maxTranslate, Math.min(maxTranslate, newTranslateY));
        } else {
          this.translateX = newTranslateX;
          this.translateY = newTranslateY;
        }

        event.preventDefault();
      }
    },
    handleMouseUp(event) {
      if (event.button === 0) {
        this.isDragging = false;
      }
    },
    handleMouseLeave() {
      this.isDragging = false;
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    handleKeydown(event) {
      // ESC键退出全屏
      if (event.key === "Escape" && this.isFullscreen) {
        this.isFullscreen = false;
      }
    },
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.mermaidCode);
        this.$emit("copy-success", "代码已复制到剪贴板");
      } catch (error) {
        console.error("复制失败:", error);
        this.$emit("copy-error", "复制失败，请手动复制");
      }
    },
    downloadChart() {
      if (!this.renderedChart) return;

      try {
        // 创建一个临时的SVG元素
        const svgElement = document.createElement("div");
        svgElement.innerHTML = this.renderedChart;
        const svg = svgElement.querySelector("svg");

        if (!svg) return;

        // 获取SVG的尺寸
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // 下载图片
          const link = document.createElement("a");
          link.download = `mermaid-chart-${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      } catch (error) {
        console.error("下载失败:", error);
        this.$emit("download-error", "下载失败，请重试");
      }
    },
  },
};
</script>

<style scoped>
.mermaid-container {
  position: relative;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 16px 0;
  min-height: 200px;
  transition: all 0.3s ease-in-out;
}

/* 工具栏容器 */
.toolbar {
  padding: 8px;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(248, 250, 252, 0.95);
  padding: 8px 12px;
  backdrop-filter: blur(4px);
}

/* 切换按钮 - 左侧 */
.view-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 2px;
}

.toggle-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #6366f1;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.toggle-btn.active {
  background: #6366f1;
  color: white;
}

/* 操作按钮 - 右侧 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #6366f1;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 图表视图 */
.chart-view {
  padding: 60px 20px 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 防止内容溢出 */
  position: relative;
}

.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center center;
  overflow: hidden;
  user-select: none;
  position: relative;
  max-width: 100%;
  max-height: 100%;
}

.chart-container :deep(svg) {
  max-width: none;
  height: auto;
  display: block;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #6366f1;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e0e7ff;
  border-top: 2px solid #6366f1;
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

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #dc2626;
}

.error-icon {
  font-size: 24px;
}

.error-message {
  font-size: 14px;
  text-align: center;
}

/* 代码视图 */
.code-view {
  padding: 20px;
}

.code-content {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  padding: 16px;
  border-radius: 6px;
  font-family: "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

/* 全屏样式 */
.mermaid-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  border-radius: 0;
  margin: 0;
  background: #ffffff;
}

.mermaid-container.fullscreen .chart-view {
  padding: 60px 20px 20px;
  height: calc(100vh - 60px);
  min-height: auto;
}

.mermaid-container.fullscreen .chart-container {
  width: 100%;
  height: 100%;
}

.mermaid-container.fullscreen .chart-container :deep(svg) {
  max-width: 90vw;
  max-height: 80vh;
}

.mermaid-container.fullscreen .toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  background: rgba(248, 250, 252, 0.98);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e5e7eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-wrap: wrap;
    gap: 4px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }

  .toggle-btn {
    padding: 4px 8px;
    font-size: 11px;
  }

  .chart-view,
  .code-view {
    padding: 55px 12px 12px;
  }

  .toolbar {
    padding: 6px 8px;
  }
}
</style>
