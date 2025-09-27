// /common/js/init_config.js
import {injectCss, injectJsSequential} from "/common/js/util_tool.js";

(function () {
    // 注入全局 CSS
    injectCss([
        "/common/css/global_style.css",
        "/common/css/course_style.css",
        "/common/css/code_style.css",
        "/common/css/popup_style.css",
        "/common/css/course_nav.css",
        "/common/css/algorithm_style.css",
        "/common/css/pager.css"
    ]);

    // 注入全局 JS
    void injectJsSequential([
        "/common/js/add_header.js",
        "/common/js/add_nav.js",
        "/common/js/add_pager.js",
        "/common/js/language_switch.js",
        "/common/js/keyword_popup.js",
        "/common/js/course_nav_event_controller.js",
        "/common/js/pager.js",
        "/common/js/mathjax.js",
        "/common/js/code_highlight.js"
        // "/common/js/course_nav.js"
    ]);
})();
