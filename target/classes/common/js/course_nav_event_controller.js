(function () {

    // console.log("start.");
    // document.addEventListener("DOMContentLoaded", () => {
    //     console.log("start listening.");
    // });
    let nav_aside = document.getElementById("courseNav");
    let tree = document.getElementById("courseTree");
    let mask = document.getElementById("courseNavMask");
    let toggleBtn = document.getElementById("courseNavToggle");
    let closeBtn = nav_aside.querySelector(".course-nav__close");


    // ------------------------------
    // 1. 给目录绑定展开/收起事件
    // ------------------------------
    function bindFolderEvents() {
        tree.querySelectorAll(".course-nav__node.is-folder > .course-nav__row").forEach((row) => {
            row.addEventListener("click", () => {
                const li = row.parentElement;
                li.classList.toggle("is-open");
                saveState();
            });
        });
    }

    // ------------------------------
    // 2. 状态记忆：展开/折叠
    // ------------------------------
    function saveState() {
        const openFolders = [];
        tree.querySelectorAll(".course-nav__node.is-folder.is-open").forEach((el) => {
            openFolders.push(getNodePath(el));
        });
        localStorage.setItem("courseNavOpen", JSON.stringify(openFolders));
    }

    function restoreState() {
        const saved = localStorage.getItem("courseNavOpen");
        if (!saved) return;
        const openFolders = JSON.parse(saved);
        tree.querySelectorAll(".course-nav__node.is-folder").forEach((el) => {
            const path = getNodePath(el);
            if (openFolders.includes(path)) el.classList.add("is-open");
        });
    }

    function getNodePath(el) {
        const names = [];
        let cur = el;
        while (cur && cur !== tree) {
            const nameEl = cur.querySelector(".course-nav__name");
            if (nameEl) names.unshift(nameEl.textContent.trim());
            cur = cur.parentElement.closest(".course-nav__node");
        }
        return names.join("/");
    }

    // ------------------------------
    // 3. 显示/隐藏整个侧栏
    // ------------------------------
    function showNav() {
        nav_aside.classList.add("is-visible");
        if (mask) mask.classList.add("is-visible");
    }

    function hideNav() {
        nav_aside.classList.remove("is-visible");
        if (mask) mask.classList.remove("is-visible");
    }

    if (toggleBtn) toggleBtn.addEventListener("click", showNav);
    if (closeBtn) closeBtn.addEventListener("click", hideNav);
    if (mask) mask.addEventListener("click", hideNav);

    console.log("start building...");
    bindFolderEvents();
    restoreState();




    // ------------------------------
    // 4. 初始化
    // ------------------------------

})();
