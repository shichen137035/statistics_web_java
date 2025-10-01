import fs from "fs";
import path from "path";
import { minify } from "terser";

const inputDir = path.resolve("./resources");
const outputDir = path.resolve("./publish_frontend");

// 主逻辑
async function main() {
    if (!fs.existsSync(inputDir)) {
        console.log("❌ 没有找到 resources 文件夹，任务结束。");
        return;
    }

    // 如果已有 publish_frontend，先删除再重建
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });

    console.log("🚀 开始处理 resources ...");

    await processDir(inputDir, outputDir);

    console.log("✅ 完成！所有文件已输出到 publish_frontend/");
}

// 递归处理目录
async function processDir(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            await processDir(srcPath, destPath);
        } else if (entry.isFile()) {
            if (entry.name.endsWith(".js")) {
                // 压缩 JS，删除 console/debugger
                const code = fs.readFileSync(srcPath, "utf-8");
                const result = await minify(code, {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                    mangle: false, // 不混淆变量名
                });

                fs.writeFileSync(destPath, result.code || "", "utf-8");
                console.log(`📝 JS已处理: ${srcPath} -> ${destPath}`);
            } else {
                // 直接复制
                fs.copyFileSync(srcPath, destPath);
                console.log(`📄 文件已复制: ${srcPath} -> ${destPath}`);
            }
        }
    }
}

// 执行
main();