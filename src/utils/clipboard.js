/**
 * 剪贴板工具函数
 * 提供复制文本到剪贴板的功能，包含降级方案
 */

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本内容
 * @returns {Promise<boolean>} - 复制是否成功
 */
export async function copyToClipboard(text) {
  if (!text || typeof text !== 'string') {
    console.warn('复制内容为空或格式不正确');
    return false;
  }

  try {
    // 优先使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // 降级方案：使用传统的document.execCommand
    return fallbackCopyToClipboard(text);
  } catch (error) {
    console.error('复制失败:', error);
    // 如果现代API失败，尝试降级方案
    return fallbackCopyToClipboard(text);
  }
}

/**
 * 降级复制方案
 * @param {string} text - 要复制的文本内容
 * @returns {boolean} - 复制是否成功
 */
function fallbackCopyToClipboard(text) {
  try {
    // 创建临时textarea元素
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // 设置样式使其不可见
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    
    // 添加到DOM
    document.body.appendChild(textArea);
    
    // 选择文本
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    
    // 执行复制命令
    const successful = document.execCommand('copy');
    
    // 清理DOM
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('降级复制方案失败:', error);
    return false;
  }
}

/**
 * 检查剪贴板API是否可用
 * @returns {boolean} - 是否支持剪贴板API
 */
export function isClipboardSupported() {
  return !!(navigator.clipboard && window.isSecureContext) || document.queryCommandSupported('copy');
}

export default {
  copyToClipboard,
  isClipboardSupported
};