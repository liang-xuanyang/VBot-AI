import yaml from "js-yaml";

/**
 * 配置加载器
 * 用于加载和解析YAML格式的配置文件
 */
class ConfigLoader {
  constructor() {
    this.config = null;
  }

  /**
   * 异步加载YAML配置文件
   * @param {string} configPath - 配置文件路径
   * @returns {Promise<Object>} 解析后的配置对象
   */
  async loadConfig(configPath) {
    try {
      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      const yamlText = await response.text();
      this.config = yaml.load(yamlText);
      return this.config;
    } catch (error) {
      console.error("Error loading config:", error);
      throw error;
    }
  }

  /**
   * 获取系统提示词
   * @returns {string} 系统提示词内容
   */
  getSystemPrompt() {
    if (!this.config) {
      throw new Error("Config not loaded. Call loadConfig() first.");
    }
    return this.config.system_prompt || "";
  }

  /**
   * 获取配置元数据
   * @returns {Object} 配置元数据
   */
  getMetadata() {
    if (!this.config) {
      throw new Error("Config not loaded. Call loadConfig() first.");
    }
    return this.config.metadata || {};
  }

  /**
   * 获取完整配置
   * @returns {Object} 完整配置对象
   */
  getFullConfig() {
    if (!this.config) {
      throw new Error("Config not loaded. Call loadConfig() first.");
    }
    return this.config;
  }
}

// 创建单例实例
const configLoader = new ConfigLoader();

// 导出系统提示词（保持向后兼容）
export let systemPrompt = "";

// 异步初始化配置
const initConfig = async () => {
  await configLoader.loadConfig("/src/config/systemPrompts.yaml");
  systemPrompt = configLoader.getSystemPrompt();
};

// 立即初始化
initConfig();

export { configLoader };
export default configLoader;
