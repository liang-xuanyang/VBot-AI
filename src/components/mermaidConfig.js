/**
 * Mermaid 图表配置
 * 统一管理所有图表类型的配置选项
 */

// 基础主题配置
const themeConfig = {
  theme: "default",
  themeVariables: {
    primaryColor: "#c7d2fe",
    primaryTextColor: "#6366f1",
    primaryBorderColor: "#6366f1",
    lineColor: "#6366f1",
    secondaryColor: "#e0e7ff",
    tertiaryColor: "#f1f5f9",
  },
};

// 图表类型配置
const chartConfigs = {
  // 流程图配置
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    useMaxWidth: true,
    diagramPadding: 8,
  },

  // 序列图配置
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
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: true,
  },

  // 甘特图配置
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    fontFamily: '"Open Sans", sans-serif',
    fontSize: 11,
    fontWeight: "normal",
    gridLineStartPadding: 35,
    bottomPadding: 50,
    leftPadding: 75,
    topPadding: 50,
    rightPadding: 75,
    useMaxWidth: true,
  },

  // 类图配置
  class: {
    useMaxWidth: true,
    htmlLabels: false,
  },

  // 状态图配置
  state: {
    useMaxWidth: true,
  },

  // 实体关系图配置
  er: {
    diagramPadding: 20,
    layoutDirection: "TB",
    minEntityWidth: 100,
    minEntityHeight: 75,
    entityPadding: 15,
    stroke: "gray",
    fill: "honeydew",
    fontSize: 12,
    useMaxWidth: true,
  },

  // 用户旅程图配置
  journey: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    leftMargin: 150,
    width: 150,
    height: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    bottomMarginAdj: 1,
    useMaxWidth: true,
  },

  // 饼图配置
  pie: {
    useMaxWidth: true,
    textPosition: 0.75,
  },

  // 需求图配置
  requirement: {
    useMaxWidth: true,
    rect_fill: "#f9f9f9",
    text_color: "#333",
    rect_border_size: "0.5px",
    rect_border_color: "#bbb",
    rect_min_width: 200,
    rect_min_height: 200,
    fontSize: 14,
  },

  // Git图配置
  gitGraph: {
    diagramPadding: 8,
    nodeLabel: {
      width: 75,
      height: 100,
      x: -25,
      y: -8,
    },
    mainBranchName: "main",
    showBranches: true,
    showCommitLabel: true,
    rotateCommitLabel: true,
    useMaxWidth: true,
  },

  // C4图配置
  c4: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    c4ShapeMargin: 50,
    c4ShapePadding: 20,
    width: 216,
    height: 60,
    boxMargin: 10,
    useMaxWidth: true,
  },

  // 思维导图配置
  mindmap: {
    useMaxWidth: true,
    padding: 10,
    maxNodeSizeX: 200,
    maxNodeSizeY: 100,
  },

  // 时间线配置
  timeline: {
    useMaxWidth: true,
    diagramMarginX: 50,
    diagramMarginY: 10,
    leftMargin: 150,
    width: 150,
    height: 50,
    padding: 5,
  },

  // Sankey图配置
  sankey: {
    useMaxWidth: true,
    width: 600,
    height: 400,
    linkColor: "gradient",
    nodeAlignment: "justify",
  },

  // XY图配置
  xyChart: {
    useMaxWidth: true,
    width: 700,
    height: 500,
  },

  // 象限图配置
  quadrantChart: {
    useMaxWidth: true,
    chartWidth: 500,
    chartHeight: 500,
    titleFontSize: 20,
    titlePadding: 10,
    quadrantPadding: 5,
    quadrantTextTopPadding: 5,
    quadrantLabelFontSize: 16,
    quadrantInternalBorderStrokeWidth: 1,
    quadrantExternalBorderStrokeWidth: 2,
    quadrantTitlePadding: 5,
    pointTextPadding: 5,
    pointLabelFontSize: 12,
    pointRadius: 5,
    xAxisLabelPadding: 5,
    xAxisLabelFontSize: 16,
    yAxisLabelPadding: 5,
    yAxisLabelFontSize: 16,
  },
};

// 完整的 Mermaid 配置
export const mermaidConfig = {
  startOnLoad: false,
  securityLevel: "loose",
  ...themeConfig,
  ...chartConfigs,
};
