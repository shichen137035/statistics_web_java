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

    const COPY_ICON = "/common/img/code_paste.png";
    const DONE_ICON = "/common/img/paste_finish.png";

    function wrapCodeBlocks() {
        document.querySelectorAll("pre > code").forEach(code => {
            const pre = code.parentElement;
            if (pre.parentElement.classList.contains("code-block")) return; // 已经处理过

            // 创建容器
            const wrapper = document.createElement("div");
            wrapper.className = "code-block";

            // 创建 header
            const header = document.createElement("div");
            header.className = "code-header";

            // ===== 左侧语言名 =====
            const langLabel = document.createElement("span");
            langLabel.className = "lang-label";

            // 从 classList 里找 language-xxx
            const langClass = [...code.classList].find(c => c.startsWith("language-"));
            if (langClass) {
                langLabel.textContent = langClass.replace("language-", "").toUpperCase();
            } else {
                langLabel.textContent = "R"; // 默认
            }

            // ===== 右侧复制按钮 =====
            const copyBtn = document.createElement("button");
            copyBtn.className = "copy-btn";
            const img = new Image();
            img.src = COPY_ICON;
            img.alt = "Copy";
            copyBtn.appendChild(img);

            copyBtn.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(code.innerText);
                    img.src = DONE_ICON;
                    setTimeout(() => img.src = COPY_ICON, 1200);
                } catch (e) {
                    console.error("Copy failed:", e);
                }
            });

            header.appendChild(langLabel);
            header.appendChild(copyBtn);

            // ===== 包装 DOM =====
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", wrapCodeBlocks);
    } else {
        wrapCodeBlocks();
    }
    console.log("successfully load code format.")
})();