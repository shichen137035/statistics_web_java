(function() {
    // ----------- 注入全局 CSS -----------
    const baseLink = document.createElement("link");
    baseLink.rel = "stylesheet";
    baseLink.href = "/common/css/global_style.css";
    baseLink.href = "/common/css/subpage_style.css";

    const head = document.head;
    if (head.firstChild) {
        head.insertBefore(baseLink, head.firstChild);
    } else {
        head.appendChild(baseLink);
    }

    // ----------- 工具函数：注入 JS -----------
    function injectJs(src) {
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        head.appendChild(script);
    }

    // ----------- 注入全局 JS -----------
    injectJs("/common/js/language_switch.js");   // 切换语言
    injectJs("/common/js/keyword_popup.js");     // 悬浮显示子页面（你刚才的功能）
    // 以后还可以继续加
    // injectJs("/common/other.js");
})();