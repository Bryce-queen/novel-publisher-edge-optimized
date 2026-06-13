/**
 * 共享通用工具
 * Toast、防抖节流、时间格式化、ID 生成。
 * 通过全局变量 NovelPublisherUtils 暴露。
 */
var NovelPublisherUtils = (function() {
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    var existing = document.querySelector('.novel-toast-container');
    if (existing) existing.remove();

    var container = document.createElement('div');
    container.className = 'novel-toast-container';
    container.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;pointer-events:none;';

    var el = document.createElement('div');
    el.className = 'novel-toast novel-toast--' + type;
    el.textContent = message;
    var colors = { success: '#52c41a', error: '#ff4d4f', warning: '#faad14', info: '#1890ff' };
    el.style.cssText = 'padding:10px 18px;border-radius:8px;font-size:14px;color:#fff;background:' + (colors[type] || colors.info) + ';box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;';

    var style = document.createElement('style');
    style.textContent = '@keyframes novelToastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);

    container.appendChild(el);
    document.body.appendChild(container);

    setTimeout(function() {
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
      setTimeout(function() { container.remove(); }, 300);
    }, duration);
  }

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      var args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  function throttle(fn, interval) {
    var last = 0;
    return function() {
      var now = Date.now(), args = arguments, ctx = this;
      if (now - last >= interval) {
        last = now;
        fn.apply(ctx, args);
      }
    };
  }

  function formatTime(timestamp) {
    var d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  return {
    showToast: showToast,
    debounce: debounce,
    throttle: throttle,
    formatTime: formatTime,
    generateId: generateId
  };
})();
