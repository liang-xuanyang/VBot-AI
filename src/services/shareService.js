/**
 * 分享服务
 * 处理AI对话消息的分享功能，包括链接生成、数据存储和格式化
 */

/**
 * 分享数据存储键名
 */
const SHARE_STORAGE_KEY = "ai_chat_shares";
const SHARE_HISTORY_KEY = "ai_chat_share_history";

/**
 * 分享服务类
 */
class ShareService {
  constructor() {
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  /**
   * 生成唯一的分享ID
   * @returns {string} 分享ID
   */
  generateShareId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `share_${timestamp}_${random}`;
  }

  /**
   * 创建分享数据
   * @param {Object} message - 要分享的消息
   * @param {Array} contextMessages - 上下文消息
   * @param {Object} options - 分享选项
   * @returns {Object} 分享数据对象
   */
  createShareData(message, contextMessages = [], options = {}) {
    const shareId = this.generateShareId();
    const timestamp = new Date().toISOString();

    const shareData = {
      id: shareId,
      message: {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date(),
      },
      context: contextMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date(),
      })),
      metadata: {
        createdAt: timestamp,
        publicAccess: options.allowPublicAccess || false,
        includeContext: options.includeContext || false,
        shareType: options.shareType || "link",
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      stats: {
        views: 0,
        lastViewed: null,
      },
    };

    return shareData;
  }

  /**
   * 保存分享数据到本地存储
   * @param {Object} shareData - 分享数据
   * @returns {boolean} 保存是否成功
   */
  saveShareData(shareData) {
    try {
      // 获取现有的分享数据
      const existingShares = this.getAllShares();

      // 添加新的分享数据
      existingShares.push(shareData);

      // 限制存储数量，只保留最近的100条
      if (existingShares.length > 100) {
        existingShares.splice(0, existingShares.length - 100);
      }

      // 保存到本地存储
      localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(existingShares));

      // 更新分享历史
      this.updateShareHistory(shareData);

      return true;
    } catch (error) {
      console.error("保存分享数据失败:", error);
      return false;
    }
  }

  /**
   * 根据ID获取分享数据
   * @param {string} shareId - 分享ID
   * @returns {Object|null} 分享数据或null
   */
  getShareData(shareId) {
    try {
      const shares = this.getAllShares();
      const shareData = shares.find((share) => share.id === shareId);

      if (shareData) {
        // 更新查看统计
        shareData.stats.views += 1;
        shareData.stats.lastViewed = new Date().toISOString();
        this.updateShareData(shareData);
      }

      return shareData || null;
    } catch (error) {
      console.error("获取分享数据失败:", error);
      return null;
    }
  }

  /**
   * 获取所有分享数据
   * @returns {Array} 分享数据数组
   */
  getAllShares() {
    try {
      const sharesJson = localStorage.getItem(SHARE_STORAGE_KEY);
      return sharesJson ? JSON.parse(sharesJson) : [];
    } catch (error) {
      console.error("获取分享数据失败:", error);
      return [];
    }
  }

  /**
   * 更新分享数据
   * @param {Object} updatedShareData - 更新后的分享数据
   * @returns {boolean} 更新是否成功
   */
  updateShareData(updatedShareData) {
    try {
      const shares = this.getAllShares();
      const index = shares.findIndex((share) => share.id === updatedShareData.id);

      if (index !== -1) {
        shares[index] = updatedShareData;
        localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
        return true;
      }

      return false;
    } catch (error) {
      console.error("更新分享数据失败:", error);
      return false;
    }
  }

  /**
   * 删除分享数据
   * @param {string} shareId - 分享ID
   * @returns {boolean} 删除是否成功
   */
  deleteShareData(shareId) {
    try {
      const shares = this.getAllShares();
      const filteredShares = shares.filter((share) => share.id !== shareId);

      localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(filteredShares));

      // 同时从历史记录中删除
      this.removeFromShareHistory(shareId);

      return true;
    } catch (error) {
      console.error("删除分享数据失败:", error);
      return false;
    }
  }

  /**
   * 生成分享链接
   * @param {string} shareId - 分享ID
   * @returns {string} 分享链接
   */
  generateShareLink(shareId) {
    return `${this.baseUrl}#/share/${shareId}`;
  }

  /**
   * 格式化消息内容为文本
   * @param {Object} message - 消息对象
   * @param {Array} contextMessages - 上下文消息
   * @param {Object} options - 格式化选项
   * @returns {string} 格式化后的文本
   */
  formatMessageAsText(message, contextMessages = [], options = {}) {
    let text = "";

    // 添加标题
    text += "=== AI 对话分享 ===\n\n";

    // 如果包含上下文，添加相关对话
    if (options.includeContext && contextMessages.length > 0) {
      text += "--- 上下文对话 ---\n";
      contextMessages.forEach((msg, index) => {
        const role = msg.role === "user" ? "用户" : "AI助手";
        const timestamp = this.formatTimestamp(msg.timestamp);
        text += `${role} [${timestamp}]: ${msg.content}\n\n`;
      });
      text += "--- 当前对话 ---\n";
    }

    // 添加当前消息
    const currentRole = message.role === "user" ? "用户" : "AI助手";
    const currentTimestamp = this.formatTimestamp(message.timestamp);
    text += `${currentRole} [${currentTimestamp}]: ${message.content}\n\n`;

    // 添加分享信息
    text += `--- 分享信息 ---\n`;
    text += `分享时间: ${new Date().toLocaleString()}\n`;
    text += `来源: Vue Bot AI\n`;

    if (options.shareLink) {
      text += `分享链接: ${options.shareLink}\n`;
    }

    return text;
  }

  /**
   * 格式化时间戳
   * @param {Date|string} timestamp - 时间戳
   * @returns {string} 格式化后的时间字符串
   */
  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "未知时间";
    }
  }

  /**
   * 更新分享历史
   * @param {Object} shareData - 分享数据
   */
  updateShareHistory(shareData) {
    try {
      const history = this.getShareHistory();

      const historyItem = {
        id: shareData.id,
        messagePreview: this.getMessagePreview(shareData.message.content),
        shareType: shareData.metadata.shareType,
        createdAt: shareData.metadata.createdAt,
        views: shareData.stats.views,
        publicAccess: shareData.metadata.publicAccess,
      };

      history.unshift(historyItem); // 添加到开头

      // 限制历史记录数量
      if (history.length > 50) {
        history.splice(50);
      }

      localStorage.setItem(SHARE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("更新分享历史失败:", error);
    }
  }

  /**
   * 获取分享历史
   * @returns {Array} 分享历史数组
   */
  getShareHistory() {
    try {
      const historyJson = localStorage.getItem(SHARE_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error("获取分享历史失败:", error);
      return [];
    }
  }

  /**
   * 从分享历史中删除项目
   * @param {string} shareId - 分享ID
   */
  removeFromShareHistory(shareId) {
    try {
      const history = this.getShareHistory();
      const filteredHistory = history.filter((item) => item.id !== shareId);
      localStorage.setItem(SHARE_HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error("从分享历史中删除失败:", error);
    }
  }

  /**
   * 获取消息预览文本
   * @param {string} content - 消息内容
   * @param {number} maxLength - 最大长度
   * @returns {string} 预览文本
   */
  getMessagePreview(content, maxLength = 100) {
    if (!content || typeof content !== "string") {
      return "无内容";
    }

    // 移除Markdown格式和多余空白
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, "[代码块]") // 替换代码块
      .replace(/`([^`]+)`/g, "$1") // 移除行内代码格式
      .replace(/\*\*([^*]+)\*\*/g, "$1") // 移除粗体格式
      .replace(/\*([^*]+)\*/g, "$1") // 移除斜体格式
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 移除链接格式，保留文本
      .replace(/#+\s*/g, "") // 移除标题格式
      .replace(/\s+/g, " ") // 合并多个空白字符
      .trim();

    return cleanContent.length > maxLength ? cleanContent.substring(0, maxLength) + "..." : cleanContent;
  }

  /**
   * 清理过期的分享数据
   * @param {number} daysToKeep - 保留天数，默认30天
   */
  cleanupExpiredShares(daysToKeep = 30) {
    try {
      const shares = this.getAllShares();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const validShares = shares.filter((share) => {
        const shareDate = new Date(share.metadata.createdAt);
        return shareDate > cutoffDate;
      });

      localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(validShares));

      // 同时清理历史记录
      const history = this.getShareHistory();
      const validHistory = history.filter((item) => {
        const itemDate = new Date(item.createdAt);
        return itemDate > cutoffDate;
      });

      localStorage.setItem(SHARE_HISTORY_KEY, JSON.stringify(validHistory));

      console.log(`清理完成，删除了 ${shares.length - validShares.length} 条过期分享`);
    } catch (error) {
      console.error("清理过期分享失败:", error);
    }
  }

  /**
   * 获取分享统计信息
   * @returns {Object} 统计信息
   */
  getShareStats() {
    try {
      const shares = this.getAllShares();
      const history = this.getShareHistory();

      const totalShares = shares.length;
      const totalViews = shares.reduce((sum, share) => sum + (share.stats.views || 0), 0);
      const publicShares = shares.filter((share) => share.metadata.publicAccess).length;

      const shareTypes = shares.reduce((acc, share) => {
        const type = share.metadata.shareType || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalShares,
        totalViews,
        publicShares,
        privateShares: totalShares - publicShares,
        shareTypes,
        historyCount: history.length,
      };
    } catch (error) {
      console.error("获取分享统计失败:", error);
      return {
        totalShares: 0,
        totalViews: 0,
        publicShares: 0,
        privateShares: 0,
        shareTypes: {},
        historyCount: 0,
      };
    }
  }
}

// 创建单例实例
const shareService = new ShareService();

// 导出服务实例和类
export default shareService;
export { ShareService };