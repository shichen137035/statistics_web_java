(function () {
    let popups = [];   // 用数组维护所有 popup
    let activeKeyword = null;
    let creatingPopup = false;
    const PAD = 3;             // 命中判定的容差
    const LOCK_DELAY = 750;    // 0.75s 后进入锁定

    let inKeyword = false;
    let inPopup = false;
    let hideTimer = null;
    let lockTimer = null;
    let locked = false;
    let lastXY = { x: 0, y: 0 };

    const MAX_W = 560, MIN_W = 280;
    const MAX_H = 420, MIN_H = 160;

    function ensurePopup() {
        const popup = document.createElement("div");
        popup.className = "keyword-popup";

        const frame = document.createElement("iframe");
        frame.className = "keyword-popup__frame";
        frame.setAttribute("title", "keyword preview");
        // 入栈前，先把旧栈顶监听去掉
        const oldTop = popups[popups.length - 1];
        if (oldTop) detachPopupListeners(oldTop);
        popup.appendChild(frame);

        // popup.addEventListener("mouseenter", () => {
        //     inPopup = true;
        //     if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        //     locked = true;
        // });
        // popup.addEventListener("mouseleave", () => {
        //     inPopup = false;
        //     locked = false;   // 🚩 离开浮窗立刻解除锁定
        //     scheduleMaybeHide();
        // });

        document.body.appendChild(popup);
        popups.push(popup);
        attachPopupListeners(popup);
        return popup;
    }

    // 绑定监听
    function attachPopupListeners(popup) {
        popup._onEnter = () => {
            console.log("entering:",popup)
            inPopup = true;
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            // locked = true;
        };
        popup._onLeave = () => {
            console.log("leaving:",popup)
            inPopup = false;
            locked = false;   // 🚩 离开浮窗立刻解除锁定
            scheduleMaybeHide();
        };
        popup.addEventListener("mouseenter", popup._onEnter);
        popup.addEventListener("mouseleave", popup._onLeave);
    }


// 移除监听
    function detachPopupListeners(popup) {
        if (popup._onEnter) popup.removeEventListener("mouseenter", popup._onEnter);
        if (popup._onLeave) popup.removeEventListener("mouseleave", popup._onLeave);
        popup._onEnter = popup._onLeave = null;
    }

    function showAtPosition(url, left, top) {
        const p = ensurePopup();
        p.style.setProperty("--top", (window.scrollY + top + 6) + "px");
        p.style.setProperty("--left", (window.scrollX + left) + "px");

        const iframe = p.querySelector("iframe.keyword-popup__frame");
        if (iframe && iframe.src !== url) {
            iframe.src = url;
        }
        p.classList.add("is-open");
    }

    function hide() {
        // 只关闭最上层（栈顶）浮窗
        const popup = popups.pop();
        if (!popup) return;

        popup.classList.remove("is-open");
        popup.remove();
        // 新栈顶重新监听
        const newTop = popups[popups.length - 1];
        if (newTop) attachPopupListeners(newTop);

        // 清理计时器，避免和后续判定竞争
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        if (lockTimer) { clearTimeout(lockTimer); lockTimer = null; }

        // 若还有下层，则立刻触发一次判定；没有则重置状态后返回
        if (popups.length > 0) {
            // 不在这里递归关闭，把决策交给 scheduleMaybeHide
            scheduleMaybeHide(0);
        } else {
            inKeyword = false;
            inPopup = false;
            locked = false;

        }
    }

    function pointInBox(el, x, y, pad = PAD) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const eps = 1.0
        console.log("detected object position:",r)
        return x >= r.left + eps && x <= r.right - eps &&
            y >= r.top  + eps && y <= r.bottom - eps;
    }

    function pointInRect(rect, x, y, pad = PAD) {
        if (!rect) return false;
        return x >= rect.left && x <= rect.right &&
            y >= rect.top && y <= rect.bottom ;
    }

    function armLock(delay = LOCK_DELAY) {
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => { if (popups.length) locked = true; }, delay);
    }

    function clearLock() {
        clearTimeout(lockTimer);
        lockTimer = null;
        locked = false;
    }

    function stackTop() { return popups[popups.length - 1] || null; }

    function scheduleMaybeHide(delay = 100) {
        if (hideTimer) clearTimeout(hideTimer);

        hideTimer = setTimeout(() => {
            const top = popups[popups.length - 1]; // 只判断最上层
            if (!top) return; // 没有更下层了，直接返回
            console.log("top_layer:",top)

            const overTop =
                pointInBox(top, lastXY.x, lastXY.y) ||
                (pointInBox(activeKeyword, lastXY.x, lastXY.y));
            console.log("last position:",lastXY)
            console.log("over_box:",overTop)

            // 不在浮窗、不在关键词、且鼠标不在最上层矩形 → 关闭一层
            if (!inPopup && !inKeyword && !overTop) {
                hide(); // 关闭后由 hide() 再次调用 scheduleMaybeHide 继续判断
            }
        }, delay);
    }

    function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

    function resizePopupByContent(width, height) {
        const popup = popups[popups.length - 1];
        const iframe = popup && popup.querySelector("iframe.keyword-popup__frame");
        if (!popup || !iframe) return;

        const w = clamp(Math.round(width), MIN_W, Math.min(MAX_W, window.innerWidth - 24));
        const h = clamp(Math.round(height), MIN_H, Math.min(MAX_H, window.innerHeight - 24));

        popup.style.width = w + "px";
        iframe.style.height = h + "px";
    }



    // --- 记录鼠标坐标，供矩形复核 ---
    document.addEventListener("mousemove", (e) => {
        lastXY.x = e.clientX;
        lastXY.y = e.clientY;
    }, true);


// 主页面监听鼠标悬浮信息
    document.addEventListener("mouseover", (e) => {
        const el = e.target.closest(".keyword");
        if (!el) return;

        const url = el.dataset.subpage;
        if (!url) return;

        const rect = el.getBoundingClientRect();

        // 父页面自己也向自己报告
        window.postMessage({
            type: "SHOW_POPUP",
            url: url,
            rect: {
                left: rect.left,
                top: rect.bottom
            }
        }, "*");
    }, true);

// 根据监听信息，生成子页面
    window.addEventListener("message", (e) => {

        const data = e.data;
        if (!data || data.type !== "SHOW_POPUP") return;

        let left = data.rect.left;
        let top  = data.rect.top;

        // 如果是子页面发来的，加上 iframe 偏移量
        if (e.source !== window && e.source.frameElement) {
            const iframeRect = e.source.frameElement.getBoundingClientRect();
            left += iframeRect.left;
            top  += iframeRect.top;
        }
        creatingPopup = true;   // 🔒 开始创建 → 上锁

        showAtPosition(data.url, left, top);
        console.log("show");
        setTimeout(() => { creatingPopup = false; }, 50);
    }, true);

// 根据监听信息，调整页面大小
    window.addEventListener("message", (e) => {
        const data = e.data;
        if (!data || data.type !== "SUBPAGE_SIZE") return;
        resizePopupByContent(data.width, data.height);
        // console.log("Received height:",data.height)
        // console.log("Received width:",data.width)
    });

    // // --- 关键词离开：由坐标判定是否还需要保留 ---
    // document.addEventListener("mousemove", (e) => {
    //     const el = e.target.closest(".keyword");
    //     console.log("Main page listening.")
    //     if (!el || el !== activeKeyword) return;
    //
    //     // 标记离开当前关键词
    //     inKeyword = false;
    //
    //     // 用鼠标坐标判断是否仍在关键词矩形内
    //     const stillInsideKeyword = pointInBox(activeKeyword, lastXY.x, lastXY.y);
    //     console.log("last position:",lastXY)
    //
    //     // 如果不在关键词范围，交给调度器决定是否关
    //     if (!stillInsideKeyword) {
    //         scheduleMaybeHide(locked ? 140 : 0);
    //     }
    // }, true);

    // // 失焦就关（你之前的“离开浏览器才解锁”的逻辑可以保留）
    // window.addEventListener("blur", hide);
})();