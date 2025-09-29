// import {loadComponent} from "/common/js/util_tool.js";
(function () {
    // void loadComponent("/component/course_nav_rendered.html","course-nav");
    const nav = document.getElementById("course-nav");
    // console.log("nav:",nav)
    const nav_aside = document.getElementById("courseNav");
    const tree = nav.querySelector(".course-nav__tree");
    const mask = document.getElementById("courseNavMask");
    const toggleBtn = document.getElementById("courseNavToggle");
    const closeBtn = nav.querySelector(".course-nav__close");

    // console.log(mask)
    // console.log(toggleBtn)
    // console.log(closeBtn)

    // ------------------------------
    // 1. 渲染目录树
    // ------------------------------
    async function loadCourseJson() {
        console.log("Start loading json.")
        try {
            const res = await fetch("/component/course.json", { cache: "no-store" });
            const data = await res.json();
            console.log("data:",data)
            // console.log("tree:",tree)
            tree.innerHTML = "";
            renderNodes(data, tree);
            restoreState();
        } catch (e) {
            console.error("加载课程目录失败:", e);
        }
    }

    function renderNodes(nodes, container) {
        nodes.forEach((node) => {
            // console.log("node:",node)
            const li = document.createElement("li");
            li.className = "course-nav__node";

            const row = document.createElement("div");
            row.className = "course-nav__row";

            const icon = document.createElement("span");
            icon.className = "course-nav__icon";
            const name = document.createElement("span");
            name.className = "course-nav__name";

            if (node.type === "folder") {
                li.classList.add("is-folder");
                icon.innerHTML = '<span class="course-nav__caret">▶</span>';
                name.textContent = node.name;

                row.appendChild(icon);
                row.appendChild(name);
                li.appendChild(row);


                const ul = document.createElement("ul");
                ul.className = "course-nav__children";
                li.appendChild(ul);

                if (node.children) renderNodes(node.children, ul);

                row.addEventListener("click", () => {
                    li.classList.toggle("is-open");
                    saveState();
                });
            } else if (node.type === "file") {
                li.classList.add("is-file");
                icon.textContent = "📄";
                const link = document.createElement("a");
                link.className = "course-nav__link";
                link.textContent = node.name;
                link.href = "/main/course/" + node.path;

                row.appendChild(icon);
                row.appendChild(link);
                li.appendChild(row);
            }
            container.appendChild(li);
            // console.log(li)
        });
        // console.log("container:",container)
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
        // 用父级层次拼路径，确保唯一
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
        console.log("show catalog.");
    }
    function hideNav() {
        nav_aside.classList.remove("is-visible");
        if (mask) mask.classList.remove("is-visible");
        console.log("hide catalog.");
    }
    // console.log("nav:",nav.outerHTML)
    // console.log("tree:",tree.outerHTML)

    document.addEventListener("DOMContentLoaded", () => {
        void loadCourseJson();
    });
    console.log("tree:",tree)


    if (toggleBtn) toggleBtn.addEventListener("click", showNav);
    if (closeBtn) closeBtn.addEventListener("click", hideNav);
    if (mask) mask.addEventListener("click", hideNav);

    // ------------------------------
    // 4. 初始化
    // ------------------------------

    // document.querySelector("#courseNav").classList.add("is-visible");
    // console.log("nav:",nav)
})();
