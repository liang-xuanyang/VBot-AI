import { systemPrompt } from '../config/configLoader';

class ApiService {
  constructor() {
    this.baseURL = "https://api.deepseek.com";
    this.model = "deepseek-chat";
  }

  // 设置模型
  setModel(modelName) {
    if (modelName === "deepseek-chat" || modelName === "deepseek-reasoner") {
      this.model = modelName;
      console.log(`模型已切换到: ${modelName}`);
    } else {
      console.warn(`不支持的模型: ${modelName}`);
    }
  }

  // 获取当前模型
  getModel() {
    return this.model;
  }

  async sendMessageStream(apiKey, messages, onChunk, onComplete, onError, onReasoning) {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...messages.slice(-10).map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        let errorMessage = "抱歉，发生了错误。";

        if (response.status === 401) {
          errorMessage = "API Key 无效，请检查您的密钥是否正确。";
        } else if (response.status === 429) {
          errorMessage = "API 调用频率过高，请稍后再试。";
        } else {
          try {
            const errorData = await response.json();
            errorMessage = `API 错误: ${errorData.error?.message || "未知错误"}`;
          } catch {
            errorMessage = `HTTP 错误: ${response.status}`;
          }
        }

        onError(errorMessage);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === "" || trimmedLine === "data: [DONE]") {
              continue;
            }

            if (trimmedLine.startsWith("data: ")) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const data = JSON.parse(jsonStr);

                if (data.choices?.[0]?.delta?.content) {
                  const content = data.choices[0].delta.content;
                  if (content) {
                    onChunk(content);
                  }
                }
                if (data.choices?.[0]?.delta?.reasoning_content) {
                  const reasoning_content = data.choices[0].delta.reasoning_content;
                  if (reasoning_content && onReasoning && this.model === "deepseek-reasoner") {
                    onReasoning(reasoning_content);
                  }
                }
              } catch (parseError) {
                console.warn("解析流数据失败:", parseError);
              }
            }
          }
        }
      } catch (streamError) {
        console.error("流读取错误:", streamError);
        onError("数据流读取失败，请重试。");
      }
    } catch (error) {
      console.error("API 调用失败:", error);

      let errorMessage = "网络连接失败，请检查您的网络连接。";
      onError(errorMessage);
    }
  }
}

export default new ApiService();
