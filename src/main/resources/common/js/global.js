// /common/js/init_config.js
import { injectCss, injectJsSequential, loadComponent } from "/common/js/util_tool.js";
// import "./add_header.js";
// await injectJsSequential(["/common/js/nocache.js"])
await injectJsSequential([
    "/common/js/global_config.js"
])
await loadComponent("/component/language_switch.html?v=4", "language-switch");

(function () {
    // 注入全局 CSS
    injectCss([
        "/common/css/global_style.css?v=11",
        "/common/css/popup_style.css?v=11"
    ]);

    let pageEnhancementsStarted = false;
    document.addEventListener("i18nApplied", () => {
        if (!pageEnhancementsStarted) {
            pageEnhancementsStarted = true;
            void injectJsSequential([
                "/common/js/mathjax.js",
                "/common/js/code_highlight.js"
            ]);
            return;
        }
        window.MathJax?.typesetPromise?.();
    });

    // 注入全局 JS
    void injectJsSequential([
        // "/common/js/add_header.js",
        "/common/js/language_switch.js?v=5",
        "/common/js/keyword_popup.js"
    ]);


})();
