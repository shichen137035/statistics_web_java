// /common/js/init_config.js
import { injectCss, injectJsSequential } from "./util_tool.js?v=2";
// await injectJsSequential(["common/js/nocache.js"])

// 注入全局 CSS
injectCss([
    "common/css/subpage_style.css?v=11",
    "common/css/popup_style.css?v=11",
    "common/css/algorithm_style.css?v=11",
    "common/css/code_style.css?v=11"
]);

let pageEnhancementsStarted = false;
document.addEventListener("i18nApplied", () => {
    if (!pageEnhancementsStarted) {
        pageEnhancementsStarted = true;
        void injectJsSequential([
            "common/js/mathjax.js",
            "common/js/code_highlight.js?v=2"
        ]);
        return;
    }
    window.MathJax?.typesetPromise?.();
});

// 注入全局 JS
injectJsSequential([
    "common/js/language_switch.js?v=6",
    "common/js/subpage_keyword_listener.js",

    "common/js/adjust_subpage_size.js"

]);



