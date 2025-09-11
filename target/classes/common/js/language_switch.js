(function () {
    const select = document.getElementById('lang-select');

    // -----------------------------
    // 1. 路径 & 文件加载逻辑（保持不变）
    // -----------------------------
    function normalizePathname() {
        let p = location.pathname || '/';
        p = p.replace(/\/{2,}/g, '/'); // 清理重复斜杠
        if (p === '/') return '/index';
        if (p.endsWith('/')) p += 'index'; // 目录 → index
        // 去掉最后的 .html 扩展
        p = p.replace(/\.html?$/i, '');
        return p;
    }

    function makePageI18nUrl(lang) {
        const p = normalizePathname();
        return `/i18n/${lang}${p}.json`;
    }

    async function fetchJson(url) {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Cannot load: ${url} (${res.status})`);
        return res.json();
    }

    // -----------------------------
    // 2. 加载所有字典（页面 + component + keyword）
    // -----------------------------
    async function loadAllDicts(lang) {
        const base = `/i18n/${lang}`;
        const urls = [
            `${base}/keyword.json`,    // 低优先级
            `${base}/component.json`,  // 中优先级
            makePageI18nUrl(lang)      // 高优先级（页面）
        ];

        const results = await Promise.allSettled(urls.map(fetchJson));
        const dicts = results.map(r => (r.status === 'fulfilled' ? r.value : {}));

        // 合并：keyword < component < page
        return Object.assign({}, dicts[0], dicts[1], dicts[2]);
    }

    // -----------------------------
    // 3. 加载关键字配置（共通）
    // -----------------------------
    let keywordMeta = {};
    async function loadKeywordMeta() {
        try {
            const res = await fetch('/common/json/keyword.json', { cache: 'no-store' });
            keywordMeta = await res.json();
        } catch (e) {
            console.warn('Cannot load keyword meta:', e);
        }
    }

    // -----------------------------
    // 4. 渲染关键字 [[Key]]
    // -----------------------------
    function renderWithKeywords(text, dict, keywordDict) {
        return text.replace(/\[\[(.+?)\]\]/g, (match, key) => {
            const info = keywordDict[key];
            if (info) {
                // 默认规则：关键字的翻译 key = keyword.<变量名>
                const translated = dict[info.i18nKey] || key;
                const subpage = info.subpage || info.mainPage || "";
                console.log("data-subpage 属性:", subpage);
                return `<a href="${info.mainPage}" class="keyword" data-subpage="${subpage}">${translated}</a>`;
            }
            return key; // 没找到就原样返回
        });
    }
    // -----------------------------
    // 5. 应用翻译到页面
    // -----------------------------
    function apply(dict, lang) {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key in dict) {
                const raw = String(dict[key]);
                if (raw.includes('[[')) {
                    el.innerHTML = renderWithKeywords(raw, dict, keywordMeta);
                } else {
                    el.textContent = raw;
                }
            }
        });
        if (dict['meta.title']) document.title = dict['meta.title'];
        document.documentElement.setAttribute('lang', lang);
    }

    // -----------------------------
    // 6. 设置语言
    // -----------------------------
    async function setLang(lang) {
        try {
            await loadKeywordMeta(); // 确保 keywordMeta 已经加载
            const dict = await loadAllDicts(lang);
            apply(dict, lang);
            if (select) select.value = lang;
        } catch (e) {
            console.error(e);
        }
    }

    // -----------------------------
    // 7. 启动逻辑
    // -----------------------------


    setLang(document.documentElement.getAttribute('lang') || 'en');

    if (select) {
        select.addEventListener('change', e => setLang(e.target.value));
    }
})();
