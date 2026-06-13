/**
 * 共享存储工具
 * 对 chrome.storage 的 Promise 封装，支持精准读写和批量操作。
 * 通过全局变量 NovelPublisherStorage 暴露。
 *
 * @typedef {Object} NovelPublisherStorageType
 * @property {(keys: string|string[]) => Promise<Object>} storageSyncGet - 读取 chrome.storage.sync
 * @property {(data: Object) => Promise<void>} storageSyncSet - 写入 chrome.storage.sync
 * @property {(keys: string|string[]) => Promise<Object>} storageLocalGet - 读取 chrome.storage.local
 * @property {(data: Object) => Promise<void>} storageLocalSet - 写入 chrome.storage.local
 */
var NovelPublisherStorage = (function() {
  function storageSyncGet(keys) {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get(keys, function(result) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  function storageSyncSet(data) {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.set(data, function() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  function storageLocalGet(keys) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get(keys, function(result) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  function storageLocalSet(data) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.set(data, function() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  function storageLocalRemove(keys) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.remove(keys, function() {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  return {
    storageSyncGet: storageSyncGet,
    storageSyncSet: storageSyncSet,
    storageLocalGet: storageLocalGet,
    storageLocalSet: storageLocalSet,
    storageLocalRemove: storageLocalRemove
  };
})();
