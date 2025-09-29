// /common/js/init_config.js
import {injectCss, injectJsSequential,loadComponent} from "/common/js/util_tool.js";
// import "./add_nav.js";
// import "./add_header.js";
// import "./add_pager.js";
await Promise.all([
    loadComponent("/component/course_nav_rendered.html", "course-nav"),
    loadComponent("/component/language_switch.html", "language-switch"),
    loadComponent("/component/pager.html", "pager")
]);
console.log("所有组件加载完成。");

// 注入全局 CSS
injectCss([
    "/common/css/global_style.css",
    "/common/css/course_style.css",
    "/common/css/code_style.css",
    "/common/css/popup_style.css",
    "/common/css/course_nav.css",
    "/common/css/algorithm_style.css",
    "/common/css/table.css",
    "/common/css/pager.css"
]);

// 注入全局 JS
void injectJsSequential([
    // "/common/js/add_header.js",
    // "/common/js/add_nav.js",
    // "/common/js/add_pager.js",
    "/common/js/keyword_popup.js",
    "/common/js/pager.js",
    "/common/js/course_nav_event_controller.js",
    "/common/js/language_switch.js",
    "/common/js/mathjax.js",
    "/common/js/code_highlight.js"
    // "/common/js/course_nav.js"
]);
