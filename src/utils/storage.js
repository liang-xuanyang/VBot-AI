const STORAGE_KEYS = {
  API_KEY: 'deepseek_api_key'
};

export const storage = {
  // 获取API Key
  getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  // 设置API Key
  setApiKey(apiKey) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  },

  // 删除API Key
  removeApiKey() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  },

  // 检查API Key是否存在
  hasApiKey() {
    return !!this.getApiKey();
  }
};

export default storage;