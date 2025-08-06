const STORAGE_KEYS = {
  API_KEY: 'deepseek_api_key',
  SELECTED_MODEL: 'deepseek_selected_model'
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
  },

  // 获取选中的模型
  getSelectedModel() {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL) || 'deepseek-chat';
  },

  // 设置选中的模型
  setSelectedModel(model) {
    if (model === 'deepseek-chat' || model === 'deepseek-reasoner') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
    }
  },

  // 删除模型偏好
  removeSelectedModel() {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_MODEL);
  }
};

export default storage;