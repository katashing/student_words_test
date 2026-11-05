/* 今日入口以香港/上海日历为准，不能把最近生成的明日试卷当成今日试卷。 */
(function (root) {
  function shanghaiDate(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now);
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function selectDate(entries, now) {
    const today = shanghaiDate(now);
    const date = Object.keys(entries).filter(day => day <= today).sort().pop();
    return { date: date || null, today, current: date === today };
  }
  function apply(document, entries, now = new Date()) {
    const selection = selectDate(entries, now);
    const entry = entries[selection.date];
    for (const anchor of document.querySelectorAll('a[href], a[data-practice-link]')) {
      const href = anchor.getAttribute('data-practice-link') || anchor.getAttribute('href');
      const match = href.match(/(?:printables\/|history\/\d{4}-\d{2}-\d{2}\/)((?:daily_practice|passed_review)_(?:student|teacher))(?:_[^/?]+)?\.(html|pdf)(?:\?.*)?$/);
      if (!match) continue;
      anchor.setAttribute('data-practice-link', href);
      const target = entry && entry[match[1]] && entry[match[1]][match[2]];
      if (target) {
        anchor.setAttribute('href', target);
        anchor.removeAttribute('aria-disabled');
      } else {
        anchor.removeAttribute('href');
        anchor.setAttribute('aria-disabled', 'true');
      }
    }
    const label = selection.current ? '试卷日期：' : '今日试卷尚未生成；最近试卷：';
    for (const el of document.querySelectorAll('.entry-date, .word-flow .quick-date')) {
      el.textContent = entry ? label + selection.date : '今日试卷尚未生成';
    }
    return selection;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { shanghaiDate, selectDate, apply };
  else {
    const data = document.getElementById('practice-date-catalog');
    if (!data) return;
    const entries = JSON.parse(data.textContent);
    const refresh = () => apply(document, entries);
    refresh();
    // 已打开的首页跨过午夜、从后台返回或从浏览器缓存恢复时也更新。
    setInterval(refresh, 30000);
    root.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
  }
})(typeof window === 'undefined' ? globalThis : window);
