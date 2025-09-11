(function(){
    const select = document.getElementById('lang-select');

    function normalizePathname() {
        let p = location.pathname || '/';
        p = p.replace(/\/{2,}/g, '/');      // 清理重复斜杠
        if (p === '/') return '/index';
        if (p.endsWith('/')) p += 'index';  // 目录 → index
        // 去掉最后的 .html 扩展
        p = p.replace(/\.html?$/i, '');
        return p;
    }

    function makeI18nUrl(lang) {
        const p = normalizePathname();

        // case 1: /frontend/ 开头 → 插入 i18n/{lang}/
        if (p.startsWith('/frontend/')) {
            const rest = p.slice('/frontend/'.length);
            return `/frontend/i18n/${lang}/${rest}.json`;
        }

        // case 2: 其他路径 → 前置 /i18n/{lang}
        return `/i18n/${lang}${p}.json`;
    }

    async function loadDict(lang){
        const url = makeI18nUrl(lang);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Cannot load: ${url}`);
        return res.json();
    }

    function apply(dict, lang){
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key in dict) el.textContent = String(dict[key]);
        });
        if (dict['meta.title']) document.title = dict['meta.title'];
        document.documentElement.setAttribute('lang', lang);
    }

    async function setLang(lang){
        try{
            const dict = await loadDict(lang);
            apply(dict, lang);
            if (select) select.value = lang;
        }catch(e){
            console.error(e);
        }
    }

    // 默认语言：HTML lang 属性或 en
    setLang(document.documentElement.getAttribute('lang') || 'en');

    if (select) select.addEventListener('change', e => setLang(e.target.value));
})();