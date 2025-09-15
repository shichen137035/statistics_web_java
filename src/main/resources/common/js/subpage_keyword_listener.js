(function () {
    // 鼠标悬浮到关键词时，向父页面发送消息
    document.addEventListener("mouseover", (e) => {
        const el = e.target.closest(".keyword");
        if (!el) return;

        const url = el.dataset.subpage;
        if (!url) return;

        // 元素相对子页面的矩形
        const rect = el.getBoundingClientRect();

        // 向父页面汇报：我想在这里打开 url
        parent.postMessage({
            type: "SHOW_POPUP",
            url: url,
            rect: {
                left: rect.left,
                top: rect.bottom
            }
        }, "*");
    }, true);
})();
