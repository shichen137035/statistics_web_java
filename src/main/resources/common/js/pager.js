async function loadCourseJson() {
    try {
        const res = await fetch("/component/course.json", { cache: "no-store" });
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
                path: node.path,
                number: node.number || "",                 // e.g. "1.2"
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

function getCurrentPath() {
    // 去掉前缀，并把转义字符解码回来
    const rawPath = location.pathname.replace(/^\/main\/course\//, "");
    return decodeURIComponent(rawPath);
}

// 返回的是“文件对象”而不是纯 path
function findPrevNext(files, currentPath) {
    const idx = files.findIndex(f => f.path === currentPath);
    if (idx === -1) return { prev: null, next: null };

    const current = files[idx];
    const folder = current.folder;

    const sameFolder = files.filter(f => f.folder === folder);
    const localIdx = sameFolder.findIndex(f => f.path === currentPath);

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

    console.log("prev:", prev);
    console.log("next:", next);

    return { prev, next };
}

function setPagerButtons(prev, next) {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    // 上一页按钮
    if (prev) {
        const seq = prev.number || "";
        const title = prev.title || "";

        prevBtn.disabled = false;
        prevBtn.onclick = () => {
            location.href = "/main/course/" + prev.path;
        };

        prevBtn.innerHTML =
            `&laquo; ` +   // 左箭头始终在最前面
            (seq ? `<span class="page-btn-seq">${escapeHtml(seq)}</span> ` : "") +
            `<span class="page-btn-title" data-i18n="catalogtitle.${escapeHtml(title)}">`
            + escapeHtml(title) +
            `</span>`;
    } else {
        prevBtn.disabled = true;
        prevBtn.onclick = null;
        prevBtn.innerHTML = "";    // 空内容
    }

    // 下一页按钮
    if (next) {
        const seq = next.number || "";
        const title = next.title || "";

        nextBtn.disabled = false;
        nextBtn.onclick = () => {
            location.href = "/main/course/" + next.path;
        };

        nextBtn.innerHTML =
            (seq ? `<span class="page-btn-seq">${escapeHtml(seq)}</span> ` : "") +
            `<span class="page-btn-title" data-i18n="catalogtitle.${escapeHtml(title)}">`
            + escapeHtml(title) +
            `</span>` +
            ` &raquo;`;   // 右箭头永远在最后面
    } else {
        nextBtn.disabled = true;
        nextBtn.onclick = null;
        nextBtn.innerHTML = "";    // 空内容
    }
}


// 简单 HTML 转义，免得哪天你标题里塞了 <>& 之类的
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
    const current = getCurrentPath();
    const { prev, next } = findPrevNext(files, current);
    setPagerButtons(prev, next);
}

// 直接执行
void initPager();
