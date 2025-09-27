// 配置并动态加载 Prism.js
(function () {
    // 1. 注入 Prism.js VSCode(okaidia) 风格 CSS
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-solarizedlight.css";
    document.head.appendChild(css);

    // 2. 注入 Prism.js 主库
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/prismjs/prism.js";
    script.async = true;
    script.onload = () => {
        // 3. 注入常用语言支持 (这里强制加载 R)
        const langScript = document.createElement("script");
        langScript.src = "https://cdn.jsdelivr.net/npm/prismjs/components/prism-r.min.js";
        langScript.async = true;
        document.head.appendChild(langScript);

        // 4. 扫描所有 <pre><code> 块
        langScript.onload = () => {
            document.querySelectorAll("pre code").forEach(block => {
                // 如果没有显式声明 language-xxx，则默认用 R
                if (![...block.classList].some(c => c.startsWith("language-"))) {
                    block.classList.add("language-r");
                }
            });
            // 手动触发 Prism 高亮
            Prism.highlightAll();
        };
    };
    document.head.appendChild(script);
    console.log("successfully load latex format.")
})();