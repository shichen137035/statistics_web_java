// /common/js/init_config.js
import { injectCss, injectJs } from "/common/js/util_tool.js";

(function () {
    // 注入全局 CSS
    injectCss([
        "/common/css/global_style.css",
        "/common/css/popup_style.css"
    ]);

    // 注入全局 JS
    injectJs([
        "/common/js/add_header.js",
        "/common/js/language_switch.js",
        "/common/js/keyword_popup.js"
    ]);
})();
