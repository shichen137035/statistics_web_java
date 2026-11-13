import { siteUrl } from "./site_url.js";

async function loadCourseJson() {
    try {
        const res = await fetch(siteUrl("component/course.json"), { cache: "no-store" });
        return await res.json();
    } catch (e) {
        console.error("Failed to load course.json:", e);
        return [];
    }
}

// 扁平化目录，记录文件夹、路径、编号和标题
function flattenFiles(nodes, list = [], prefix = []) {
    for (const node of nodes) {
        if (node.type === "file") {
            list.push({
                folder: prefix.join("/"),
                path: node.path,                        // 相对路径，比如 "lec1.html" 或 "ch1/lec1.html"
                number: node.number || "",              // e.g. "1.2"
                title: node.c_name || cleanName(node.name) // 纯标题，用于 i18n
            });
        } else if (node.type === "folder" && node.children) {
            const folderLabel = node.c_name || node.name;
            flattenFiles(node.children, list, [...prefix, folderLabel]);
        }
    }
    return list;
}

// 兜底：如果没 c_name，就至少去掉扩展名
function cleanName(name = "") {
    return name.replace(/\.html?$/i, "");
}

// 不再用固定前缀剪路径，而是直接在 pathname 里找哪个文件匹配
function findPrevNext(files) {
    let urlPath = location.pathname || "/";
    urlPath = urlPath.replace(/\/{2,}/g, "/");
    urlPath = decodeURIComponent(urlPath);

    // 确定：当前页面对应 files 中的哪个条目，以及 URL 前缀
    let idx = -1;
    let prefix = "";

    for (let i = 0; i < files.length; i++) {
        const rel = files[i].path.replace(/^\/+/, ""); // 确保没有前导斜杠
        const cand = "/" + rel;

        if (urlPath === cand || urlPath.endsWith(cand)) {
            idx = i;
            // urlPath = prefix + rel
            const diff = urlPath.length - rel.length;
            prefix = urlPath.slice(0, diff);
            // 比如 "/course_site/main/course/lec1.html"
            // rel = "lec1.html"
            // prefix = "/course_site/main/course/"
            if (!prefix.endsWith("/")) {
                prefix += "/";
            }
            break;
        }
    }

    if (idx === -1) {
        console.warn("Current path not found in course.json:", urlPath);
        return { prev: null, next: null, prefix: "" };
    }

    const current = files[idx];
    const folder = current.folder;

    const sameFolder = files.filter(f => f.folder === folder);
    const localIdx = sameFolder.findIndex(f => f.path === current.path);

    let prev = null, next = null;

    // 上一页
    if (localIdx > 0) {
        prev = sameFolder[localIdx - 1];
    } else {
        for (let i = idx - 1; i >= 0; i--) {
            if (files[i].folder !== folder) {
                const group = files.filter(f => f.folder === files[i].folder);
                prev = group[group.length - 1];
                break;
            }
        }
    }

    // 下一页
    if (localIdx < sameFolder.length - 1) {
        next = sameFolder[localIdx + 1];
    } else {
        for (let i = idx + 1; i < files.length; i++) {
            if (files[i].folder !== folder) {
                const group = files.filter(f => f.folder === files[i].folder);
                next = group[0];
                break;
            }
        }
    }

    console.log("urlPath:", urlPath);
    console.log("prefix:", prefix);
    console.log("prev:", prev);
    console.log("next:", next);

    return { prev, next, prefix };
}

function setPagerButtons(prev, next, prefix) {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    // 兜底：如果实在没拿到 prefix，就退回最原始的绝对前缀（可按你部署情况改）
    const base = prefix || siteUrl("main/course/");

    // 上一页按钮
    if (prev) {
        prevBtn.hidden = false;
        const seq = prev.number || "";
        const title = prev.title || "";

        prevBtn.disabled = false;
        prevBtn.onclick = () => {
            const target = base.replace(/\/+$/, "/") + prev.path.replace(/^\/+/, "");
            location.href = target;
        };

        prevBtn.innerHTML =
            `&laquo; ` +   // 左箭头始终在最前面
            (seq ? `<span class="page-btn-seq">${escapeHtml(seq)}</span> ` : "") +
            `<span class="page-btn-title" data-i18n="catalogtitle.${escapeHtml(title)}">`
             +
            `</span>`;
    } else {
        prevBtn.disabled = true;
        prevBtn.hidden = true;
        prevBtn.onclick = null;
        prevBtn.innerHTML = "";    // 空内容
    }

    // 下一页按钮
    if (next) {
        nextBtn.hidden = false;
        const seq = next.number || "";
        const title = next.title || "";

        nextBtn.disabled = false;
        nextBtn.onclick = () => {
            const target = base.replace(/\/+$/, "/") + next.path.replace(/^\/+/, "");
            location.href = target;
        };

        nextBtn.innerHTML =
            (seq ? `<span class="page-btn-seq">${escapeHtml(seq)}</span> ` : "") +
            `<span class="page-btn-title" data-i18n="catalogtitle.${escapeHtml(title)}">`
             +
            `</span>` +
            ` &raquo;`;   // 右箭头永远在最后面
    } else {
        nextBtn.disabled = true;
        nextBtn.hidden = true;
        nextBtn.onclick = null;
        nextBtn.innerHTML = "";    // 空内容
    }

    // Keep a lone next button on the right when the first page has no previous page.
    nextBtn.style.marginLeft = !prev && next ? "auto" : "";

    // These are the two bottom navigation buttons shown on every course page.
    // Apply the same flat surface as the dark course list cards directly to
    // the elements so older cached stylesheets cannot restore gradients/glows.
    [prevBtn, nextBtn].forEach((button) => {
        const paint = (hovered = false) => {
            const dark = document.documentElement.dataset.theme !== "light";
            button.style.setProperty("background", dark ? (hovered ? "#263547" : "#202c3b") : (hovered ? "#f2f6fb" : "#fff"), "important");
            button.style.setProperty("background-image", "none", "important");
            button.style.setProperty("border", dark ? "1px solid #465569" : "1px solid #d7e1ed", "important");
            button.style.setProperty("box-shadow", "none", "important");
            button.style.setProperty("transform", "none", "important");
            button.style.setProperty("color", dark ? (hovered ? "#fff" : "#e2ebf7") : (hovered ? "#203f69" : "#304765"), "important");
        };
        paint();
        button.addEventListener("mouseenter", () => paint(true));
        button.addEventListener("mouseleave", () => paint(false));
    });
}


function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

async function initPager() {
    const courseData = await loadCourseJson();
    const files = flattenFiles(courseData);
    const { prev, next, prefix } = findPrevNext(files);
    setPagerButtons(prev, next, prefix);
}

// 直接执行
await initPager();
