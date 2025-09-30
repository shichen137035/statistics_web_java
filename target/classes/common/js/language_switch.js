(async function () {
    const select = document.getElementById('lang-select');
    const STORAGE_KEY = "globalLang";

    // -----------------------------
    // 读取全局语言（无则默认 en）
    function getStoredLang() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;

        // 从浏览器语言获取前两个字符
        const browserLang = (navigator.language || navigator.userLanguage || "en").slice(0,2).toLowerCase();

        // 支持的语言列表（可以根据你项目调整）
        const supported = ["en", "ja", "zh"];
        if (supported.includes(browserLang)) {
            return browserLang;
        }
        return "en"; // 都不符合 → 回退英语
    }
    function storeLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
    }

    // -----------------------------
    // 1. 路径 & 文件加载逻辑（保持不变）
    function normalizePathname() {
        let p = location.pathname || '/';
        p = p.replace(/\/{2,}/g, '/');
        if (p === '/') return '/index';
        if (p.endsWith('/')) p += 'index';
        p = p.replace(/\.html?$/i, '');
        return p;
    }


    async function makePageI18nUrl(lang) {
        const p = normalizePathname();
        let pp = `/i18n/${lang}${p}.json`;

        try {
            // 尝试获取文件 (仅 HEAD 请求即可)
            const res = await fetch(pp, { method: 'HEAD' });
            if (res.ok) {
                return pp;  // 文件存在
            } else {
                console.warn(`i18n file not found: ${pp}, fallback to English`);
                return `/i18n/en${p}.json`;
            }
        } catch (e) {
            console.error(`Error checking i18n file ${pp}:`, e);
            return `/i18n/en${p}.json`;
        }
    }

    async function fetchJson(url) {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Cannot load: ${url} (${res.status})`);
        return res.json();
    }

    // -----------------------------
    // 2. 加载所有字典
    async function loadAllDicts(lang) {
        const base = `/i18n/${lang}`;
        const urls = [
            `${base}/keyword.json`,
            `${base}/component.json`,
            `${base}/catalog.json`,
            await makePageI18nUrl(lang)
        ];
        // console.log(urls);
        const results = await Promise.allSettled(urls.map(fetchJson));
        const dicts = results.map(r => (r.status === 'fulfilled' ? r.value : {}));


        return Object.assign({}, ...dicts);
    }

    // -----------------------------
    // 3. 加载关键字配置
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
    // 4. 渲染关键字
    function renderWithKeywords(text, dict, keywordDict) {
        return text.replace(/\[\[(.+?)\]\]/g, (match, key) => {
            const info = keywordDict[key];
            if (info) {
                const translated = dict[info.i18nKey] || key;
                const subpage = info.subpage || info.mainPage || "";
                return `<a href="${info.mainPage}" class="keyword" data-subpage="${subpage}">${translated}</a>`;
            }
            return key;
        });
    }

    // -----------------------------
    // 5. 应用翻译
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
    async function setLang(lang) {
        try {
            await loadKeywordMeta();
            const dict = await loadAllDicts(lang);
            apply(dict, lang);
            storeLang(lang); // 保存全局语言
            if (select) select.value = lang; // 同步下拉框
            document.dispatchEvent(new Event("i18nApplied"));
        } catch (e) {
            console.error(e);
        }
    }

    // -----------------------------
    // 7. 启动逻辑
    const initialLang = getStoredLang();
    await setLang(initialLang);
    console.log("json file loaded");
    document.dispatchEvent(new Event("i18nApplied"));

    if (select) {
        select.value = initialLang; // 页面有下拉框 → 初始值同步
        select.addEventListener('change', e => setLang(e.target.value));
    }
})();
