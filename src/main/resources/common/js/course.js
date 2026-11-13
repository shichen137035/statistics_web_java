
import {injectCss, injectJsSequential,loadComponent} from "/common/js/util_tool.js";

// await injectJsSequential(["/common/js/nocache.js"])
await injectJsSequential([
    "/common/js/global_config.js"
])
await Promise.all([
    loadComponent("/component/course_nav_rendered.html", "course-nav"),
    loadComponent("/component/language_switch.html?v=4", "language-switch"),
    loadComponent("/component/pager.html", "pager")
]);
console.log("所有组件加载完成。");

// 注入全局 CSS
injectCss([
    "/common/css/global_style.css?v=11",
    "/common/css/course_style.css?v=11",
    "/common/css/code_style.css?v=11",
    "/common/css/popup_style.css?v=11",
    "/common/css/course_nav.css?v=11",
    "/common/css/algorithm_style.css?v=11",
    "/common/css/theorem_style.css?v=11",
    "/common/css/table.css?v=11",
    "/common/css/pager.css?v=11"
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
injectJsSequential([
    // "/common/js/add_header.js",
    // "/common/js/add_nav.js",
    // "/common/js/add_pager.js",
    "/common/js/language_switch.js?v=5",
    "/common/js/keyword_popup.js",
    "/common/js/pager.js?v=10",
    "/common/js/course_nav_event_controller.js",

    // "/common/js/course_nav.js"
]);

console.log("All scripts finished.");
