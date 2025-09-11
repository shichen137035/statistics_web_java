(function () {
    let popup = null;
    let activeKeyword = null;

    // --- 新增状态 & 计时器 ---
    let inKeyword = false;
    let inPopup = false;
    let hideTimer = null;
    let lockTimer = null;
    let locked = false;
    let lastXY = { x: 0, y: 0 };

    function ensurePopup() {
        if (popup) return popup;
        popup = document.createElement("div");
        popup.className = "keyword-popup";
        const frame = document.createElement("iframe");
        frame.className = "keyword-popup__frame";
        frame.setAttribute("title", "keyword preview");
        popup.appendChild(frame);

        // 关键：用 mouseenter/leave 直接感知是否还在“浮窗矩形”内
        popup.addEventListener("mouseenter", () => {
            inPopup = true;
            if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
            locked = true; // 人已经进入浮窗，认为锁定成立
        });

        popup.addEventListener("mouseleave", () => {
            inPopup = false;
            scheduleMaybeHide(); // 离开浮窗，评估是否该关闭
        });

        document.body.appendChild(popup);
        return popup;
    }

    function show(el, url) {
        const p = ensurePopup();
        const rect = el.getBoundingClientRect();
        p.style.setProperty("--top", (window.scrollY + rect.bottom + 6) + "px");
        p.style.setProperty("--left", (window.scrollX + rect.left) + "px");

        const iframe = p.querySelector("iframe.keyword-popup__frame");
        if (iframe && iframe.src !== url) {
            try { iframe.src = url; } catch { iframe.setAttribute("src", url); }
        }
        p.classList.add("is-open");
    }

    function hide() {
        if (popup) popup.classList.remove("is-open");
        activeKeyword = null;
        inKeyword = false;
        inPopup = false;
        locked = false;
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        if (lockTimer) { clearTimeout(lockTimer); lockTimer = null; }
    }

    // 命中检测（带容差 padding，减少边缘抖动）
    function pointInBox(el, x, y, pad = 6) {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
    }

    // 统一关窗评估：两个传感器都认为“出界”时才关
    function scheduleMaybeHide(delay = 140) {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            const overByRect =
                pointInBox(popup, lastXY.x, lastXY.y) ||
                (activeKeyword && pointInBox(activeKeyword, lastXY.x, lastXY.y));

            if (!inPopup && !inKeyword && !overByRect) {
                hide();
            }
        }, delay);
    }

    // --- 记录鼠标坐标，供矩形复核 ---
    document.addEventListener("mousemove", (e) => {
        lastXY.x = e.clientX;
        lastXY.y = e.clientY;
    }, true);

    // --- 关键词进入：显示 & 启动短暂锁定窗口 ---
    document.addEventListener("mouseover", (e) => {
        const el = e.target.closest(".keyword");
        if (!el) return;
        if (activeKeyword === el) { inKeyword = true; return; }

        const url = el.dataset.subpage;
        if (!url) return;

        activeKeyword = el;
        inKeyword = true;
        locked = false;
        if (lockTimer) clearTimeout(lockTimer);
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }

        show(el, url);
        lockTimer = setTimeout(() => { locked = true; }, 500);
    }, true);

    // --- 关键词离开：不立刻关，交给评估器 ---
    document.addEventListener("mouseout", (e) => {
        const el = e.target.closest(".keyword");
        if (!el || el !== activeKeyword) return;
        inKeyword = false;
        // 若尚未“真正进入过”浮窗且也不在浮窗附近，就关闭
        scheduleMaybeHide( locked ? 140 : 0 );
    }, true);

    // 失焦就关（你之前的“离开浏览器才解锁”的逻辑可以保留）
    window.addEventListener("blur", hide);
})();
