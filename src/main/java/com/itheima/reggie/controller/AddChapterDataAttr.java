package com.itheima.reggie.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.annotation.PostConstruct;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AddChapterDataAttr {

//    @PostConstruct
    public static void main(String[] args) throws IOException {
        File jsonFile = new File("src/main/resources/component/course.json"); // JSON路径
        String basePath = "src/main/resources/main/course/";        // HTML文件根路径
        processConceptJson(jsonFile, basePath);
    }

    @SuppressWarnings("unchecked")
    public static void processConceptJson(File jsonFile, String basePath) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> conceptList = mapper.readValue(jsonFile,
                new TypeReference<List<Map<String, Object>>>() {});

        for (Map<String, Object> folder : conceptList) {
            if (!"folder".equals(folder.get("type"))) continue;

            String folderName = (String) folder.get("name");
            if ("Introduction".equalsIgnoreCase(folderName)) continue;

            String folderPrefix = folderName.split("\\.")[0].trim();

            List<Map<String, Object>> children = (List<Map<String, Object>>) folder.get("children");
            if (children == null) continue;

            for (Map<String, Object> fileNode : children) {
                if (!"file".equals(fileNode.get("type"))) continue;

                String fileName = (String) fileNode.get("name");
                String filePath = (String) fileNode.get("path");
                String filePrefix = fileName.split("\\.")[0].trim();
                String chapter = folderPrefix + "." + filePrefix;

                File htmlFile = new File(basePath + filePath);
                if (!htmlFile.exists()) {
                    System.err.println("❌ File not found: " + htmlFile.getPath());
                    continue;
                }

                System.out.println("Processing " + htmlFile.getPath() + " → " + chapter);
                updateHtmlFile(htmlFile, chapter);
            }
        }
    }

    private static void updateHtmlFile(File htmlFile, String chapter) throws IOException {
        String content = readFile(htmlFile);

        // 匹配 <aside class="...statement...">（保留 aside 后的整段属性为 group(1)）
        Pattern pattern = Pattern.compile("<aside([^>]*class=\"[^\"]*statement[^\"]*\"[^>]*)>");
        Matcher matcher = pattern.matcher(content);

        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String tag = matcher.group(1);

            // 更新/添加 data-ch
            if (tag.contains("data-ch=")) {
                tag = tag.replaceAll("data-ch=\"[^\"]*\"", "data-ch=\"" + chapter + "\"");
            } else {
                tag = tag + " data-ch=\"" + chapter + "\""; // 不 trim，保留内部空白
            }

            // 规范化：把属性串的前导空白变成“恰好一个空格”
            String attrs = tag.replaceFirst("^\\s*", " ");

            // 使用 quoteReplacement，避免 $ 或 \ 导致 appendReplacement 误解释
            String replacement = "<aside" + attrs + ">";
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);

        try (Writer writer = new OutputStreamWriter(new FileOutputStream(htmlFile), StandardCharsets.UTF_8)) {
            writer.write(sb.toString());
        }

        System.out.println("✅ Updated data-ch=" + chapter + " in " + htmlFile.getName());
    }

    private static String readFile(File file) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line).append("\n");
        }
        return sb.toString();
    }
}

