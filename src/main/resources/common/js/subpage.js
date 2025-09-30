// /common/js/init_config.js
import { injectCss, injectJsSequential } from "/common/js/util_tool.js";


// 注入全局 CSS
injectCss([
    "/common/css/subpage_style.css",
    "/common/css/popup_style.css",
    "/common/css/algorithm_style.css",
    "/common/css/code_style.css"
]);

document.addEventListener("i18nApplied", () => {
    console.log("✅ All JSON loaded and applied");
    injectJsSequential([
        "/common/js/mathjax.js",
        "/common/js/code_highlight.js"
    ])
});

// 注入全局 JS
injectJsSequential([
    "/common/js/language_switch.js",
    "/common/js/subpage_keyword_listener.js",

    "/common/js/adjust_subpage_size.js"

]);



