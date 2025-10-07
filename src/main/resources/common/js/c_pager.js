function initConceptNav() {
    const homeBtn = document.getElementById("home-btn");
    const sectionBtn = document.getElementById("section-btn");

    // 🔹 如果按钮不存在，直接结束函数
    if (!homeBtn || !sectionBtn) {
        // console.warn("concept_nav.js: 找不到导航按钮，已跳过初始化。");
        return;
    }

    // 1️⃣ 首页按钮：始终返回主页
    homeBtn.addEventListener("click", () => {
        window.location.href = "/main/concept/Introduction/page/Concept introduction.html";
    });

    // 2️⃣ 获取当前路径
    const currentPath = window.location.pathname;

    // 3️⃣ 判断是否是 section_index 页面
    if (currentPath.endsWith("section_index.html")) {
        // 当前是 section_index 页面 → 隐藏右侧按钮
        sectionBtn.style.display = "none";
    } else {
        // 当前是子页面 → 跳转到同目录下的 section_index.html
        const sectionIndexPath = currentPath.replace(/\/[^/]+\.html$/, "/section_index.html");
        sectionBtn.addEventListener("click", () => {
            window.location.href = sectionIndexPath;
        });
    }
}

initConceptNav()
