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

    /**
     * 递归遍历目录，生成 JSON 结构
     */
    private List<Map<String, Object>> walkDir(Path dir, int level) throws IOException {
        List<Map<String, Object>> list = new ArrayList<>();

        try (Stream<Path> paths = Files.list(dir)) {
            List<Path> sorted = paths.sorted((p1, p2) -> {
                String n1 = p1.getFileName().toString();
                String n2 = p2.getFileName().toString();
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
                Map<String, Object> node = new LinkedHashMap<>();
                String name = path.getFileName().toString();

                if (Files.isDirectory(path)) {
                    node.put("name", name);
                    node.put("type", "folder");
                    if (level < 2) {
                        node.put("children", walkDir(path, level + 1));
                    }
                } else if (name.endsWith(".html")) {
                    node.put("name", name);
                    node.put("type", "file");
                    // 额外加一个完整路径，前端可以直接访问
                    node.put("path", courseRoot.relativize(path).toString().replace("\\", "/"));
                }
                list.add(node);
            }
        }
        return list;
    }
}
