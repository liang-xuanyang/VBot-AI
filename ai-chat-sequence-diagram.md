# AI 对话功能时序图

## 系统架构概述

这是一个基于 Vue.js 的 AI 对话应用，使用 DeepSeek API 进行流式对话。

## 时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant ChatInput as ChatInput组件
    participant App as App.vue主组件
    participant ApiService as ApiService服务
    participant DeepSeekAPI as DeepSeek API
    participant ChatMessages as ChatMessages组件
    participant MessageItem as MessageItem组件
    participant Storage as LocalStorage

    Note over User,Storage: 1. 应用初始化阶段
    User->>App: 访问应用
    App->>Storage: getApiKey()
    Storage-->>App: 返回API Key (如果存在)

    alt API Key不存在
        App->>User: 显示ApiKeyConfig组件
        User->>App: 输入API Key
        App->>Storage: setApiKey(apiKey)
        App->>App: addWelcomeMessage()
    else API Key存在
        App->>App: addWelcomeMessage()
    end

    App->>ChatMessages: 传递messages数组
    ChatMessages->>MessageItem: 渲染欢迎消息

    Note over User,Storage: 2. 用户发送消息阶段
    User->>ChatInput: 输入消息内容
    User->>ChatInput: 按Enter或点击发送按钮
    ChatInput->>ChatInput: handleSend()
    ChatInput->>App: emit('send-message', message)

    App->>App: handleSendMessage(messageContent)
    App->>App: 创建用户消息对象
    App->>App: messages.push(userMessage)
    App->>App: isLoading = true

    Note over User,Storage: 3. API调用和流式响应阶段
    App->>ApiService: sendMessageStream(apiKey, messages, callbacks)
    ApiService->>DeepSeekAPI: POST /chat/completions (stream: true)

    alt API调用成功
        DeepSeekAPI-->>ApiService: 开始流式响应

        loop 流式数据接收
            DeepSeekAPI-->>ApiService: 数据块 (chunk)
            ApiService->>ApiService: 解析SSE数据
            ApiService->>App: onChunk(content)

            alt 第一次接收数据
                App->>App: 创建AI消息对象
                App->>App: messages.push(aiMessage)
                App->>App: isLoading = false
            else 后续数据
                App->>App: 更新最后一条AI消息内容
            end

            App->>ChatMessages: 更新messages数组
            ChatMessages->>MessageItem: 重新渲染消息
            ChatMessages->>ChatMessages: scrollToBottom()
        end

        DeepSeekAPI-->>ApiService: 流式响应结束
        ApiService->>App: onComplete()
        App->>App: isLoading = false

    else API调用失败
        DeepSeekAPI-->>ApiService: 错误响应
        ApiService->>App: onError(errorMessage)
        App->>App: 创建或更新错误消息
        App->>App: isLoading = false
    end

    Note over User,Storage: 4. 消息显示和渲染阶段
    App->>ChatMessages: 传递更新后的messages
    ChatMessages->>MessageItem: 渲染所有消息
    MessageItem->>MessageItem: 使用marked解析Markdown
    MessageItem-->>User: 显示格式化的消息内容

    Note over User,Storage: 5. 可选操作
    alt 用户重置API Key
        User->>App: 点击重置API Key
        App->>Storage: removeApiKey()
        App->>App: 清空messages数组
        App->>User: 显示ApiKeyConfig组件
    end
```

## 关键组件说明

### 1. App.vue (主控制器)

- **职责**: 管理整体状态，协调各组件交互
- **关键状态**:
  - `apiKey`: API 密钥
  - `messages`: 消息历史数组
  - `isLoading`: 加载状态
- **关键方法**:
  - `handleSendMessage()`: 处理用户发送消息
  - `handleApiKeySet()`: 处理 API 密钥设置

### 2. ApiService (API 服务层)

- **职责**: 封装与 DeepSeek API 的交互
- **关键功能**:
  - 流式请求处理
  - 错误处理和重试机制
  - SSE (Server-Sent Events) 数据解析

### 3. ChatInput (输入组件)

- **职责**: 处理用户输入
- **关键功能**:
  - 支持 Enter 发送，Shift+Enter 换行
  - 输入状态管理
  - 发送按钮状态控制

### 4. ChatMessages (消息容器)

- **职责**: 管理消息显示区域
- **关键功能**:
  - 自动滚动到底部
  - 消息列表渲染
  - 加载状态显示

### 5. MessageItem (消息项)

- **职责**: 单条消息的渲染
- **关键功能**:
  - Markdown 内容解析
  - 用户/AI 消息样式区分
  - 头像和布局管理

## 数据流特点

1. **流式响应**: 使用 SSE 实现实时的 AI 回复显示
2. **状态管理**: 通过 Vue 的响应式系统管理消息状态
3. **本地存储**: API Key 持久化存储
4. **错误处理**: 完善的错误处理和用户提示机制
5. **响应式设计**: 支持移动端和桌面端适配

## 技术栈

- **前端框架**: Vue.js 2.x
- **HTTP 客户端**: Fetch API
- **Markdown 解析**: marked.js
- **样式**: CSS3 + 响应式设计
- **存储**: localStorage
- **API**: DeepSeek Chat Completions API
