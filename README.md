# Vue Bot AI

一个基于 Vue 2 和 DeepSeek API 的现代化 AI 聊天应用。

## 功能特性

- 🤖 **AI 对话**：集成 DeepSeek API，支持智能对话
- 💬 **流式响应**：实时流式显示 AI 回复，提升用户体验
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎨 **现代化 UI**：简洁美观的聊天界面，支持深浅色主题
- 📝 **Markdown 支持**：支持 Markdown 格式的消息渲染
- 🔐 **API Key 管理**：安全的 API Key 配置和存储
- 💾 **本地存储**：自动保存 API Key 配置
- 🎯 **组件化架构**：模块化设计，易于维护和扩展

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 克隆项目

```bash
git clone https://github.com/liang-xuanyang/VBot-AI.git
cd VBot-AI
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:8080` 启动。

### 配置 API Key

1. 访问 [DeepSeek 平台](https://platform.deepseek.com)
2. 注册并登录账户
3. 在 API Keys 页面创建新的密钥
4. 在应用中输入您的 API Key

### 开始对话

配置完成后即可开始与 AI 助手对话！

## 构建部署

```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run serve
```

## 技术栈

- Vue 2.6
- Webpack 5
- Marked (Markdown 解析)
- DeepSeek API

## 技术架构

### 组件化设计

项目采用 Vue.js 组件化架构，代码结构清晰，易于维护：

- **组件层**：

  - `ApiKeyConfig.vue` - API 密钥配置组件
  - `ChatHeader.vue` - 聊天界面头部组件
  - `ChatMessages.vue` - 消息列表容器组件
  - `MessageItem.vue` - 单条消息显示组件
  - `TypingIndicator.vue` - 打字动画指示器组件
  - `ChatInput.vue` - 消息输入组件

- **服务层**：
  - `apiService.js` - DeepSeek API 交互服务，支持流式响应
  - `storage.js` - 本地存储工具

### 流式响应实现

使用原生 Fetch API 实现流式响应：

- 实时接收 AI 回复内容
- 支持 Server-Sent Events 格式的数据流解析

## 项目结构

```
vue-chat/
├── public/
│   └── index.html          # HTML 模板
├── src/
│   ├── components/         # Vue 组件
│   │   ├── ApiKeyConfig.vue    # API Key 配置组件
│   │   ├── ChatHeader.vue      # 聊天头部组件
│   │   ├── ChatInput.vue       # 消息输入组件
│   │   ├── ChatMessages.vue    # 消息列表组件
│   │   ├── MessageItem.vue     # 单条消息组件
│   │   └── TypingIndicator.vue # 输入指示器组件
│   ├── services/
│   │   └── apiService.js   # API 服务
│   ├── utils/
│   │   └── storage.js      # 本地存储工具
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── package.json
├── webpack.config.js      # Webpack 配置
├── .babelrc              # Babel 配置
├── .gitignore            # Git 忽略文件
└── README.md             # 项目说明
```

## 技术栈

- **前端框架**：Vue 2.6.14
- **构建工具**：Webpack 5
- **Markdown 解析**：marked 9.1.6
- **HTTP 请求**：原生 Fetch API
- **样式**：原生 CSS + Scoped Styles
- **API**：DeepSeek Chat API

## 组件说明

### ApiKeyConfig

API Key 配置组件，用于首次设置和验证 DeepSeek API Key。

### ChatHeader

聊天应用头部，包含标题和重置功能。

### ChatMessages

消息列表容器，负责显示所有聊天消息和滚动管理。

### MessageItem

单条消息组件，支持 AI 和用户消息的不同样式显示。

### ChatInput

消息输入组件，支持多行输入和发送功能。

### TypingIndicator

AI 思考时的动画 loading 组件，显示三个跳动的圆点。

## 注意事项

- API Key 仅存储在本地浏览器中，不会上传到服务器
- 请妥善保管您的 API Key，避免泄露
- 建议在生产环境中使用 HTTPS

## License

MIT
