/**
 * 共享章节解析工具
 * 中文数字转换、章节号提取、分卷名提取、自动格式化。
 * 通过全局变量 NovelPublisherParser 暴露。
 *
 * @typedef {Object} ParsedChapter
 * @property {number} number - 章节序号
 * @property {string} title - 章节标题（含序号）
 * @property {string} content - 章节正文
 * @property {number} charCount - 字数
 *
 * @typedef {Object} NovelPublisherParserType
 * @property {(str: string) => number} chineseToNumber - 中文数字转阿拉伯数字
 * @property {(title: string) => number|null} extractChapterNumber - 从标题提取章节号
 * @property {(filename: string) => string} extractVolumeName - 从文件名提取分卷名
 * @property {(text: string) => string} autoFormat - 文本格式化（统一换行、去空行）
 * @property {(text: string) => ParsedChapter[]} parseChapters - 解析章节文本
 */
var NovelPublisherParser = (function() {
  var DIGITS = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };
  var UNITS = { '十': 10, '百': 100, '千': 1000, '万': 10000 };

  function chineseToNumber(str) {
    if (!str) return 0;
    var result = 0, current = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (DIGITS[ch] !== undefined) {
        current = DIGITS[ch];
      } else if (UNITS[ch] !== undefined) {
        var unit = UNITS[ch];
        if (unit === 10000) {
          result += (current || 1) * unit;
          current = 0;
        } else {
          if (current === 0) current = 1;
          result += current * unit;
          current = 0;
        }
      }
    }
    result += current;
    return result || 0;
  }

  function extractChapterNumber(title) {
    if (!title) return null;
    var match = title.match(/第([零一二三四五六七八九十百千万\d]+)[章节回卷集部篇]/);
    if (!match) return null;
    var numStr = match[1];
    if (/^\d+$/.test(numStr)) return parseInt(numStr, 10);
    return chineseToNumber(numStr);
  }

  function extractVolumeName(filename) {
    if (!filename) return '';
    var clean = filename.replace(/\.[^/.]+$/, '');
    var volMatch = clean.match(/(第[一二三四五六七八九十百千万\d]+卷|卷[一二三四五六七八九十百千万\d]+|[Vv]ol\.?\s*\d+)/);
    if (volMatch) return volMatch[1];
    return clean;
  }

  function autoFormat(content) {
    if (!content) return '';
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(function(line) { return line.trim(); })
      .filter(function(line) { return line.length > 0; })
      .join('\n');
  }

  function parseChapters(text) {
    if (!text) return [];
    var lines = text.split(/\r?\n/);
    var chapters = [];
    var current = null;
    var chapterRegex = /^(第[零一二三四五六七八九十百千万\d]+[章节节回卷集部篇])\s*[\s:：]\s*(.*)$/;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var match = line.match(chapterRegex);
      if (match) {
        if (current) chapters.push(current);
        current = { title: line, content: '', number: extractChapterNumber(line) };
      } else if (current) {
        current.content += (current.content ? '\n' : '') + line;
      }
    }
    if (current) chapters.push(current);
    return chapters;
  }

  return {
    chineseToNumber: chineseToNumber,
    extractChapterNumber: extractChapterNumber,
    extractVolumeName: extractVolumeName,
    autoFormat: autoFormat,
    parseChapters: parseChapters
  };
})();
