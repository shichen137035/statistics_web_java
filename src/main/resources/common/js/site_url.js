const siteRoot = new URL("../../", import.meta.url);

// Site paths start at the static site's root, which may be under a URL prefix.
export function siteUrl(path) {
    return new URL(path, siteRoot).href;
}

export function sitePathname() {
    return "/" + location.pathname.slice(siteRoot.pathname.length);
}
