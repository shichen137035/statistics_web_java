import { sitePathname, siteUrl } from "./site_url.js";
import "./theme.js";

const typography = document.createElement("link");
typography.rel = "stylesheet";
typography.href = siteUrl("common/css/typography.css?v=4");
document.head.appendChild(typography);

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
        const supported = ["en", "ja", "zh","tc"];
        // if (supported.includes(browserLang)) {
        //     return browserLang;
        // }
        return "en"; // 都不符合 → 回退英语
    }

    function storeLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
    }

    // -----------------------------
    const pathname = sitePathname();
    const page = pathname.endsWith("/") ? pathname + "index" : pathname.replace(/\.html?$/i, "");

    async function fetchJson(url) {
        const res = await fetch(siteUrl(url), { cache: 'no-store' });
        if (!res.ok) throw new Error(`Cannot load: ${url} (${res.status})`);
        return res.json();
    }

    // -----------------------------
    // 2. 加载所有字典
    async function loadAllDicts(lang) {
        const base = `i18n/${lang}`;

        // 固定的几个字典
        const urls = [
            `${base}/keyword.json`,
            `${base}/component.json`,
        ];

        // 根据路径动态追加
        if (pathname.startsWith("/main/course/")) {
            urls.push(`${base}/catalog.json`);
        } else if (pathname.startsWith("/main/concept/")) {
            urls.push(`${base}/concept_dic.json`);
        }

        // Section index labels come from the shared concept dictionary.
        if (!page.endsWith("/section_index")) {
            urls.push(`${base}${page}.json`);
        }
        const dicts = await Promise.all(urls.map(url => fetchJson(url).catch(() =>
            lang === "en" ? {} : fetchJson(url.replace(base, "i18n/en")).catch(() => ({}))
        )));

        // 合并所有字典
        return Object.assign({}, ...dicts);
    }

    // -----------------------------
    // 3. 加载关键字配置
    let keywordMeta = {};
    async function loadKeywordMeta() {
        try {
            keywordMeta = await fetchJson("common/json/keyword.json?v=2");
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
                const preview = info.subpage ? ` data-subpage="${siteUrl(info.subpage)}"` : "";
                return `<a href="${siteUrl(info.mainPage)}" class="keyword"${preview}>${translated}</a>`;
            }
            return dict[`keyword.${key}`] || key;
        });
    }

    // Link English course prose to the corresponding dictionary entry.
    const dictionaryLinks = pathname.startsWith("/main/course/")
        ? await fetchJson("common/json/course_dictionary_links.json?v=2").catch(() => ({}))
        : {};
    const genericTerms = new Set(["vector", "matrix", "array", "functions", "loops", "sampling", "classification", "bias", "consistency", "likelihood"]);
    const terms = Object.keys(dictionaryLinks).filter(term => !genericTerms.has(term.toLowerCase())).sort((a, b) => b.length - a.length);
    const termLookup = Object.fromEntries(terms.map(term => [term.toLowerCase(), dictionaryLinks[term]]));
    const termPattern = terms.length ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}])`, "giu") : null;

    function linkCourseTerms(lang) {
        if (lang !== "en" || !termPattern) return;
        document.querySelectorAll("main [data-i18n]").forEach(element => {
            if (element.closest("a, pre, code, h1, h2, h3, h4, button")) return;
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
                acceptNode(node) {
                    return node.parentElement.closest("a, pre, code, script, style, mjx-container") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                }
            });
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(node => {
                const parts = node.data.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]*\$)/g);
                const fragment = document.createDocumentFragment();
                let changed = false;
                parts.forEach((part, index) => {
                    if (index % 2) { fragment.append(document.createTextNode(part)); return; }
                    let position = 0;
                    for (const match of part.matchAll(termPattern)) {
                        fragment.append(document.createTextNode(part.slice(position, match.index)));
                        const link = document.createElement("a");
                        link.href = siteUrl(termLookup[match[0].toLowerCase()]);
                        link.textContent = match[0];
                        link.className = "dictionary-link";
                        fragment.append(link);
                        position = match.index + match[0].length;
                        changed = true;
                    }
                    fragment.append(document.createTextNode(part.slice(position)));
                });
                if (changed) node.replaceWith(fragment);
            });
        });
    }

    // -----------------------------
    // 5. 应用翻译
    function apply(dict, lang) {
        // --- 基本 i18n 文本替换 ---
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

        // --- 支持 data-xxx-i18n 属性的翻译 ---
        document.querySelectorAll('*').forEach(el => {
            // 遍历所有属性
            for (const attr of el.attributes) {
                const name = attr.name;
                // 匹配形如 data-*-i18n 的属性
                if (name.endsWith('-i18n')) {
                    const key = attr.value; // JSON 字典键名
                    const baseAttr = name.replace(/-i18n$/, ''); // 去掉 -i18n 得到目标属性名
                    if (key in dict) {
                        const text = String(dict[key]);
                        el.setAttribute(baseAttr, text);
                        // 对 data-title-i18n 特别处理，保持视觉一致
                        if (baseAttr === 'data-title') {
                            el.setAttribute('aria-label', text);
                        }
                    }
                }
            }
        });

        linkCourseTerms(lang);

        // --- 更新标题与语言属性 ---
        if (dict['meta.title']) document.title = dict['meta.title'];
        document.documentElement.setAttribute('lang', lang);
    }

    // -----------------------------
    // 6. 设置语言
    let languageRequest = 0;
    async function setLang(lang) {
        const requestId = ++languageRequest;
        try {
            const [_, dict] = await Promise.all([loadKeywordMeta(), loadAllDicts(lang)]);
            // Rapid changes can finish fetching out of order. Only the latest
            // requested language may update the page or persisted preference.
            if (requestId !== languageRequest) return;
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

    if (select) {
        select.value = initialLang; // 页面有下拉框 → 初始值同步
        select.addEventListener('change', e => setLang(e.target.value));
    }
})();
