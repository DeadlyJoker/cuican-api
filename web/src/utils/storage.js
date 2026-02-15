/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import { logger } from './logger';

/**
 * 统一的存储工具
 * 提供类型安全、错误处理、过期时间等功能
 */

/**
 * 存储工具类
 */
class Storage {
  /**
   * 获取存储值
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      // 尝试解析 JSON
      try {
        const parsed = JSON.parse(item);
        
        // 检查是否过期
        if (parsed && parsed._expires && parsed._expires < Date.now()) {
          this.remove(key);
          return defaultValue;
        }
        
        // 返回实际值（移除内部元数据）
        return parsed._value !== undefined ? parsed._value : parsed;
      } catch {
        // 如果不是 JSON，直接返回字符串
        return item;
      }
    } catch (error) {
      logger.error('Storage get failed:', error);
      return defaultValue;
    }
  }

  /**
   * 设置存储值
   * @param {string} key - 存储键
   * @param {any} value - 要存储的值
   * @param {number} expiresIn - 过期时间（毫秒），可选
   */
  set(key, value, expiresIn = null) {
    try {
      let itemToStore = value;
      
      // 如果需要设置过期时间，包装值
      if (expiresIn) {
        itemToStore = {
          _value: value,
          _expires: Date.now() + expiresIn,
        };
      }
      
      // 尝试序列化为 JSON
      try {
        localStorage.setItem(key, JSON.stringify(itemToStore));
      } catch {
        // 如果序列化失败，尝试直接存储字符串
        localStorage.setItem(key, String(value));
      }
    } catch (error) {
      logger.error('Storage set failed:', error);
      
      // 如果是存储空间不足，尝试清理过期项
      if (error.name === 'QuotaExceededError') {
        this.clearExpired();
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch (retryError) {
          logger.error('Storage set retry failed:', retryError);
        }
      }
    }
  }

  /**
   * 移除存储值
   * @param {string} key - 存储键
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage remove failed:', error);
    }
  }

  /**
   * 清空所有存储
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Storage clear failed:', error);
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 存储键
   * @returns {boolean} 是否存在
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }

  /**
   * 获取所有键
   * @returns {string[]} 所有存储键
   */
  keys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error('Storage keys failed:', error);
      return [];
    }
  }

  /**
   * 获取存储大小（字节）
   * @returns {number} 存储大小
   */
  size() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      logger.error('Storage size calculation failed:', error);
      return 0;
    }
  }

  /**
   * 清理过期的项
   */
  clearExpired() {
    try {
      const keys = this.keys();
      keys.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed && parsed._expires && parsed._expires < Date.now()) {
              this.remove(key);
            }
          } catch {
            // 忽略解析错误
          }
        }
      });
    } catch (error) {
      logger.error('Storage clearExpired failed:', error);
    }
  }

  /**
   * 监听存储变化（支持多标签页同步）
   * @param {string} key - 要监听的键，如果为 null 则监听所有键
   * @param {function} callback - 回调函数
   * @returns {function} 取消监听的函数
   */
  watch(key, callback) {
    const handleStorage = (e) => {
      if (key === null || e.key === key) {
        callback(e.key, this.get(e.key), e.oldValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    
    // 返回取消监听的函数
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }
}

// 创建单例实例
export const storage = new Storage();

// 导出常用方法（向后兼容）
export const getStorage = (key, defaultValue) => storage.get(key, defaultValue);
export const setStorage = (key, value, expiresIn) => storage.set(key, value, expiresIn);
export const removeStorage = (key) => storage.remove(key);
export const clearStorage = () => storage.clear();

export default storage;

