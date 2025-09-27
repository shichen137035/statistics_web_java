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

    private final Path courseRoot = Paths.get("src/main/resources/main/course");
    private final Path jsonFile = Paths.get("src/main/resources/component/course.json");
    private final Path navFile = Paths.get("src/main/resources/component/course_nav_rendered.html");
    private final Path buttonsFile = Paths.get("src/main/resources/component/course_buttons.html");

    // 缓存目录结构
    private List<Map<String, Object>> cachedStructure;

    @PostConstruct
    public void init() throws IOException {
        System.out.println(">>> 应用启动，初始化课程目录结构...");
        cachedStructure = walkDir(courseRoot, 0);

        generateCourseJsonFile();
        generateCourseHtmlFile();
        generateCourseButtonsFile();
    }

    /** API: 获取目录结构 */
    @GetMapping("/structure")
    public List<Map<String, Object>> getCourseStructure() {
        return cachedStructure;
    }

    /** API: 刷新目录结构 */
    @GetMapping("/refresh")
    public String refreshStructure() throws IOException {
        cachedStructure = walkDir(courseRoot, 0);
        return "目录结构已刷新";
    }

    /** 生成 JSON 文件 */
    @GetMapping("/generateJson")
    public String generateCourseJsonFile() throws IOException {
        Files.createDirectories(jsonFile.getParent());
        ObjectMapper mapper = new ObjectMapper();
        mapper.writerWithDefaultPrettyPrinter().writeValue(jsonFile.toFile(), cachedStructure);
        return "课程目录 JSON 已生成: " + jsonFile.toAbsolutePath();
    }

    /** 生成目录 HTML */
    @GetMapping("/generateNav")
    public String generateCourseHtmlFile() throws IOException {
        String treeHtml = renderNodesAsHtml(cachedStructure);
        Path templatePath = Paths.get("src/main/resources/component/course_nav.html");
        String template = new String(Files.readAllBytes(templatePath), StandardCharsets.UTF_8);
        String finalHtml = template.replace("{{courseTree}}", treeHtml);

        Files.write(navFile, finalHtml.getBytes(StandardCharsets.UTF_8));
        return "目录 HTML 已生成: " + navFile.toAbsolutePath();
    }

    /** 生成按钮 HTML */
    @GetMapping("/generateButtons")
    public String generateCourseButtonsFile() throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"course-grid\">\n");

        for (Map<String, Object> node : cachedStructure) {
            String type = (String) node.get("type");
            String name = (String) node.get("name");
            if (!"folder".equals(type)) continue;
            if ("Introduction".equalsIgnoreCase(name)) continue;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) node.get("children");
            if (children != null && !children.isEmpty()) {
                Map<String, Object> firstFile = children.get(0);
                String path = (String) firstFile.get("path");

                sb.append("  <a href=\"/main/course/")
                        .append(path).append("\" class=\"btn-link\">")
                        .append("<button class=\"chapter-btn\">")
                        .append(name).append("</button></a>\n");
            }
        }

        sb.append("</div>\n");
        Files.createDirectories(buttonsFile.getParent());
        Files.write(buttonsFile, sb.toString().getBytes(StandardCharsets.UTF_8));
        return "按钮 HTML 已生成: " + buttonsFile.toAbsolutePath();
    }

    /** 遍历文件目录结构（仅调用一次） */
    private List<Map<String, Object>> walkDir(Path dir, int level) throws IOException {
        List<Map<String, Object>> list = new ArrayList<>();
        try (Stream<Path> paths = Files.list(dir)) {
            List<Path> sorted = paths.sorted((p1, p2) -> {
                String n1 = p1.getFileName().toString();
                String n2 = p2.getFileName().toString();
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
                            pageFiles.filter(Files::isRegularFile)
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

    /** 渲染目录树 HTML */
    private String renderNodesAsHtml(List<Map<String, Object>> nodes) {
        return renderNodesAsHtml(nodes, 0);
    }

    private String repeat(String str, int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) sb.append(str);
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
                sb.append(indent).append("        <span class=\"course-nav__icon\"><span class=\"course-nav__caret\"></span></span>\n");
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

