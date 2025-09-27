/**
 * 批量注入 CSS 文件
 * 注入的 link 永远排在现有 link 标签之前（优先级更低）
 */
export function injectCss(cssFiles) {
    const head = document.head;
    // 找到第一个已有的 link 标签
    const firstLink = head.querySelector("link[rel='stylesheet']");

    cssFiles.forEach(href => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;

        if (firstLink) {
            // 插入到第一个 link 之前
            head.insertBefore(link, firstLink);
        } else {
            // 如果没有 link，就直接加到 head 开头
            head.insertBefore(link, head.firstChild);
        }
    });
}

/**
 * 批量注入 JS 文件
 * 注入的 script 永远排在现有 script 标签之前（优先级更低）
 */

export async function injectJsSequential(jsFiles) {
    const head = document.head;

    for (const src of jsFiles) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.type = "module";
            script.src = src;
            script.async = false; // 禁止异步执行
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            head.appendChild(script);
        });
    }
}


export async function loadComponent(url, targetId) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`无法加载组件: ${url} (status ${res.status})`);
    }
    const data = await res.text();

    const target = document.getElementById(targetId);
    if (!target) {
        throw new Error(`未找到目标容器: #${targetId}`);
    }

    target.innerHTML = data; // 同步注入
    console.log(`组件 ${url} 已成功加载到 #${targetId}`);
}

export function injectJs(jsFiles) {
    const head = document.head;
    // 找到第一个已有的 script 标签
    const firstScript = head.querySelector("script");

    jsFiles.forEach(src => {
        const script = document.createElement("script");
        script.src = src;
        script.defer = true;

        if (firstScript) {
            // 插入到第一个 script 之前
            head.insertBefore(script, firstScript);
        } else {
            // 如果没有 script，就直接加到 head 开头
            head.insertBefore(script, head.firstChild);
        }
    });
}
