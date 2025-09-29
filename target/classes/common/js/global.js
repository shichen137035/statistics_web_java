// /common/js/init_config.js
import { injectCss, injectJsSequential, loadComponent } from "/common/js/util_tool.js";
// import "./add_header.js";
await loadComponent("/component/language_switch.html", "language-switch");

(function () {
    // 注入全局 CSS
    injectCss([
        "/common/css/global_style.css",
        "/common/css/popup_style.css"
    ]);

    // 注入全局 JS
    void injectJsSequential([
        // "/common/js/add_header.js",
        "/common/js/language_switch.js",
        "/common/js/keyword_popup.js"
    ]);
})();
