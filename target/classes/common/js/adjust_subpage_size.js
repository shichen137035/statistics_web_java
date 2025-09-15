(function () {
    function sendSize() {
        const de = document.documentElement;
        const b  = document.body;

        // 三种维度分别取最大值
        const w = Math.max(
            de.scrollWidth, de.offsetWidth, de.clientWidth,
            b.scrollWidth,  b.offsetWidth,  b.clientWidth
        );

        const h = Math.max(
            de.scrollHeight, de.offsetHeight, de.clientHeight,
            b.scrollHeight,  b.offsetHeight,  b.clientHeight
        );

        // console.log("[SUBPAGE] report size", w, h);
        parent.postMessage({ type: "SUBPAGE_SIZE", width: w, height: h }, "*");
    }


    // 初次 + 字体/图片等后续变化
    window.addEventListener("load", sendSize);
    document.fonts && document.fonts.ready.then(sendSize).catch(()=>{});
    window.addEventListener("resize", sendSize);

    // 精准监听布局变化
    const ro = new ResizeObserver(() => sendSize());
    ro.observe(document.documentElement);

    // 图片逐一加载也触发一次
    Array.from(document.images || []).forEach(img => {
        if (!img.complete) img.addEventListener("load", sendSize, { once: true });
    });
})();