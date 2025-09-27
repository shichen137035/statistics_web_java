async function loadCourseJson() {
    try {
        const res = await fetch("/component/course.json", { cache: "no-store" });
        return await res.json();
    } catch (e) {
        console.error("Failed to load course.json:", e);
        return [];
    }
}

// 扁平化目录，记录文件夹和路径
function flattenFiles(nodes, list = [], prefix = []) {
    for (const node of nodes) {
        if (node.type === "file") {
            list.push({ folder: prefix.join("/"), path: node.path });
        } else if (node.type === "folder" && node.children) {
            flattenFiles(node.children, list, [...prefix, node.name]);
        }
    }
    return list;
}

function getCurrentPath() {
    // 去掉前缀，并把转义字符解码回来
    const rawPath = location.pathname.replace(/^\/main\/course\//, "");
    return decodeURIComponent(rawPath);
}

function findPrevNext(files, currentPath) {
    const idx = files.findIndex(f => f.path === currentPath);
    if (idx === -1) return { prev: null, next: null };

    const folder = files[idx].folder;
    const sameFolder = files.filter(f => f.folder === folder);
    const localIdx = sameFolder.findIndex(f => f.path === currentPath);

    let prev = null, next = null;

    // 上一页
    if (localIdx > 0) {
        prev = sameFolder[localIdx - 1].path;
    } else {
        for (let i = idx - 1; i >= 0; i--) {
            if (files[i].folder !== folder) {
                const group = files.filter(f => f.folder === files[i].folder);
                prev = group[group.length - 1].path;
                break;
            }
        }
    }

    // 下一页
    if (localIdx < sameFolder.length - 1) {
        next = sameFolder[localIdx + 1].path;
    } else {
        for (let i = idx + 1; i < files.length; i++) {
            if (files[i].folder !== folder) {
                const group = files.filter(f => f.folder === files[i].folder);
                next = group[0].path;
                break;
            }
        }
    }
    console.log("prev:",prev);
    console.log("next:",next);

    return { prev, next };
}

function setPagerButtons(prev, next) {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (prev) {
        prevBtn.disabled = false;
        prevBtn.onclick = () => { location.href = "/main/course/" + prev; };
    } else {
        prevBtn.disabled = true;
    }

    if (next) {
        nextBtn.disabled = false;
        nextBtn.onclick = () => { location.href = "/main/course/" + next; };
    } else {
        nextBtn.disabled = true;
    }
}

async function initPager() {
    const courseData = await loadCourseJson();
    const files = flattenFiles(courseData);
    console.log("files:",files);
    const current = getCurrentPath();
    console.log("current:",current);
    const { prev, next } = findPrevNext(files, current);
    setPagerButtons(prev, next);
}

// 直接执行
void initPager();

