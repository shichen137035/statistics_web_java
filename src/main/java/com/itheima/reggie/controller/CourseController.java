package com.itheima.reggie.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/course")
public class CourseController {

    // 课程目录（读取的源目录）
    private final Path courseRoot = Paths.get("src/main/resources/main/course");

    // 输出目录（目标 JSON 文件）
    private final Path outputFile = Paths.get("src/main/resources/component/course.json");

    /**
     * Spring Boot 启动时自动生成 JSON 文件
     */
    @PostConstruct
    public void init() throws IOException {
        System.out.println(">>> 应用启动，自动生成课程目录 JSON...");
        generateCourseJsonFile();
        generateCourseHtmlFile();
    }

    /**
     * API: 返回目录结构（供前端使用）
     */
    @GetMapping("/structure")
    public List<Map<String, Object>> getCourseStructure() throws IOException {
        return walkDir(courseRoot, 0);
    }

    /**
     * API: 生成并写入 JSON 文件到 /component 下
     */
    @GetMapping("/generate")
    public String generateCourseJsonFile() throws IOException {
        List<Map<String, Object>> structure = walkDir(courseRoot, 0);

        // 确保 component 目录存在
        Files.createDirectories(outputFile.getParent());

        // 使用 Jackson 写入 JSON 文件
        ObjectMapper mapper = new ObjectMapper();
        mapper.writerWithDefaultPrettyPrinter().writeValue(outputFile.toFile(), structure);

        return "课程目录 JSON 已生成: " + outputFile.toAbsolutePath();
    }

    @GetMapping("/generateHtml")
    public String generateCourseHtmlFile() throws IOException {
        // 1. 遍历目录生成 HTML 节点
        List<Map<String, Object>> structure = walkDir(courseRoot, 0);
        String treeHtml = renderNodesAsHtml(structure);

        // 2. 读取模板
        Path templatePath = Paths.get("src/main/resources/component/course_nav.html");
        String template = new String(Files.readAllBytes(templatePath), StandardCharsets.UTF_8);

        // 3. 替换占位符
        String finalHtml = template.replace("{{courseTree}}", treeHtml);

        // 4. 输出到同一个文件夹（例如 course_nav_rendered.html）
        Path out = Paths.get("src/main/resources/component/course_nav_rendered.html");
        Files.write(out, finalHtml.getBytes(StandardCharsets.UTF_8));

        return "生成成功: " + out.toAbsolutePath();
    }



    /**
     * 递归遍历目录，生成 JSON 结构
     */
    private List<Map<String, Object>> walkDir(Path dir, int level) throws IOException {
        List<Map<String, Object>> list = new ArrayList<>();

        try (Stream<Path> paths = Files.list(dir)) {
            List<Path> sorted = paths.sorted((p1, p2) -> {
                String n1 = p1.getFileName().toString();
                String n2 = p2.getFileName().toString();

                // --- 変更 1: Introduction を最優先 ---
                if (n1.equalsIgnoreCase("Introduction")) return -1;
                if (n2.equalsIgnoreCase("Introduction")) return 1;

                try {
                    return Integer.compare(
                            Integer.parseInt(n1.replaceAll("\\D", "")),
                            Integer.parseInt(n2.replaceAll("\\D", ""))
                    );
                } catch (NumberFormatException e) {
                    return n1.compareTo(n2);
                }
            }).collect(Collectors.toList());

            for (Path path : sorted) {
                if (Files.isDirectory(path) && level == 0) {
                    Map<String, Object> node = new LinkedHashMap<>();
                    String folderName = path.getFileName().toString();
                    node.put("name", folderName);
                    node.put("type", "folder");

                    Path pageDir = path.resolve("page");
                    if (Files.exists(pageDir) && Files.isDirectory(pageDir)) {
                        List<Map<String, Object>> children = new ArrayList<>();
                        try (Stream<Path> pageFiles = Files.list(pageDir)) {
                            pageFiles
                                    .filter(Files::isRegularFile)
                                    .filter(f -> f.toString().endsWith(".html"))
                                    .sorted()
                                    .forEach(f -> {
                                        Map<String, Object> fileNode = new LinkedHashMap<>();
                                        String fileName = f.getFileName().toString();
                                        fileNode.put("name", fileName);
                                        fileNode.put("type", "file");
                                        fileNode.put("path",
                                                courseRoot.relativize(f).toString().replace("\\", "/"));
                                        children.add(fileNode);
                                    });
                        }
                        node.put("children", children);
                    }

                    list.add(node);
                }
            }
        }
        return list;
    }
    private String renderNodesAsHtml(List<Map<String, Object>> nodes) {
        return renderNodesAsHtml(nodes, 0);
    }

    /**
     * Java 8 没有 String.repeat()，自己实现
     */
    private String repeat(String str, int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(str);
        }
        return sb.toString();
    }

    private String renderNodesAsHtml(List<Map<String, Object>> nodes, int level) {
        StringBuilder sb = new StringBuilder();
        String indent = repeat("    ", level);

        for (Map<String, Object> node : nodes) {
            String type = (String) node.get("type");
            String name = (String) node.get("name");

            if ("folder".equals(type)) {
                sb.append(indent).append("<li class=\"course-nav__node is-folder\">\n");
                sb.append(indent).append("    <div class=\"course-nav__row\">\n");
                sb.append(indent).append("        <span class=\"course-nav__icon\"><span class=\"course-nav__caret\">▶</span></span>\n");
                sb.append(indent).append("        <span class=\"course-nav__name\">").append(name).append("</span>\n");
                sb.append(indent).append("    </div>\n");

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> children = (List<Map<String, Object>>) node.get("children");
                sb.append(indent).append("    <ul class=\"course-nav__children\">\n");
                if (children != null) sb.append(renderNodesAsHtml(children, level + 2));
                sb.append(indent).append("    </ul>\n");
                sb.append(indent).append("</li>\n");

            } else if ("file".equals(type)) {
                String path = (String) node.get("path");

                // --- 変更 2: 表示名から拡張子を削除 ---
                String displayName = name.replaceFirst("\\.html?$", "");

                sb.append(indent).append("<li class=\"course-nav__node is-file\">\n");
                sb.append(indent).append("    <div class=\"course-nav__row\">\n");
                sb.append(indent).append("        <span class=\"course-nav__icon\"></span>\n");
                sb.append(indent).append("        <a class=\"course-nav__link\" href=\"/main/course/")
                        .append(path).append("\">")
                        .append(displayName).append("</a>\n");
                sb.append(indent).append("    </div>\n");
                sb.append(indent).append("</li>\n");
            }
        }
        return sb.toString();
    }
}
