// no-cache.js
(function () {
    // 生成一个简单的时间戳参数名
    const PARAM_NAME = "_nc";

    function addNoCacheParam(url) {
        try {
            const u = new URL(url, window.location.href);
            u.searchParams.set(PARAM_NAME, Date.now().toString());
            return u.toString();
        } catch (e) {
            // 对于奇怪的相对路径，失败就原样返回
            return url;
        }
    }

    /* ---------- 1. 劫持 fetch ---------- */
    if (window.fetch) {
        const origFetch = window.fetch;
        window.fetch = function (input, init) {
            init = init || {};
            let url = input;

            if (input instanceof Request) {
                url = input.url;
                // 如果是 Request 对象，重新包一层，避免破坏其他属性
                const noCacheUrl = addNoCacheParam(url);
                const newInit = Object.assign({}, init, {
                    cache: "no-store"
                });
                const newReq = new Request(noCacheUrl, newInit);
                return origFetch.call(this, newReq);
            } else {
                const noCacheUrl = addNoCacheParam(String(url));
                const newInit = Object.assign({}, init, {
                    cache: "no-store"
                });
                return origFetch.call(this, noCacheUrl, newInit);
            }
        };
    }

    /* ---------- 2. 劫持 XMLHttpRequest ---------- */
    if (window.XMLHttpRequest) {
        const origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            const noCacheUrl = addNoCacheParam(String(url));
            return origOpen.call(this, method, noCacheUrl, async, user, password);
        };
    }

    /* ---------- 3. 劫持 Image.src ---------- */
    const OrigImage = window.Image;
    if (OrigImage) {
        window.Image = function (width, height) {
            const img = new OrigImage(width, height);
            const origSetAttribute = img.setAttribute;

            img.setAttribute = function (name, value) {
                if (name === "src") {
                    value = addNoCacheParam(String(value));
                }
                return origSetAttribute.call(this, name, value);
            };

            Object.defineProperty(img, "src", {
                get() {
                    return img.getAttribute("src");
                },
                set(value) {
                    img.setAttribute("src", value);
                }
            });

            return img;
        };
    }

    // 你还可以继续劫持 <link>、<script> 动态创建，这里先忍。
})();
