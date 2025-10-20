import os
import json
import time
import threading
import customtkinter as ctk
from tkinter import filedialog, messagebox
import google.generativeai as genai
import platform

# ========== 配置部分 ==========
# 默认 API Key，可修改
# DEFAULT_API_KEY = "AIzaSyBJtjNHg809pnB1p3WAvbojSd48SGmLRPc"
MODEL_NAME = "gemini-2.5-flash"
# LANGUAGE = "zh"  # 可自定义目标语言
# ==============================

CONFIG_FILE = "config.json"

LANG_ABBR = {
    "Chinese": "zh",
    "English": "en",
    "Japanese": "ja",
    "Korean": "ko",
    "French": "fr",
    "German": "de",
    "Spanish": "es"
}


def load_config():
    """从 config.json 读取上次保存的设置"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_config(api_key, language, prompt):
    """将当前设置写入 config.json"""
    data = {
        "api_key": api_key,
        "language": language,
        "prompt": prompt
    }
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# 翻译逻辑

def translate_json(obj, api_key, prompt, target_language):
    """
    将整个 JSON 一次性送入 Gemini，让模型输出翻译后的完整 JSON。
    """
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(MODEL_NAME)
    json_text = json.dumps(obj, ensure_ascii=False, indent=2)

    # 构造完整 prompt —— 加入 object language
    full_prompt = (
        f"Object language: {target_language}\n\n"
        f"{prompt}\n\n"
        "Below is a JSON object. Please translate all text content into the object language, "
        "keeping the JSON structure, keys, and syntax unchanged. Output valid JSON only.\n\n"
        f"{json_text}"
    )

    try:
        response = model.generate_content(full_prompt)
        translated_text = response.text.strip()
        try:
            return json.loads(translated_text)
        except json.JSONDecodeError:
            start = translated_text.find("{")
            end = translated_text.rfind("}") + 1
            if start >= 0 and end > start:
                try:
                    return json.loads(translated_text[start:end])
                except Exception:
                    pass
            print("⚠️ model fails to analyze the json file, returning the original file.")
            return obj
    except Exception as e:
        print("Error during translation:", e)
        return obj

def process_path(input_path, output_dir, api_key, prompt, target_language, log_box, progress_label):
    # 判断是文件还是文件夹
    if os.path.isfile(input_path):
        json_files = [input_path]
        base_dir = os.path.dirname(input_path)
    else:
        json_files = []
        for root, _, files in os.walk(input_path):
            for f in files:
                if f.lower().endswith(".json"):
                    json_files.append(os.path.join(root, f))
        base_dir = input_path

    total = len(json_files)
    if total == 0:
        messagebox.showwarning("notice", "Do not find any json file.")
        return

    for idx, file_path in enumerate(json_files, 1):
        rel_path = os.path.relpath(file_path, base_dir)
        output_path = os.path.join(output_dir, rel_path)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            translated = translate_json(data, api_key, prompt,target_language)
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(translated, f, ensure_ascii=False, indent=2)
            log_box.insert("end", f"✅ Translation complete: {rel_path}\n")
        except Exception as e:
            log_box.insert("end", f"❌ Error: {rel_path} -> {e}\n")

        progress_label.configure(text=f"Progress: {idx}/{total}")
        log_box.see("end")
        time.sleep(0.2)

    messagebox.showinfo("Complete", f"Translation completed,dealing {total} number of files.")

# ========== GUI部分 ==========
class JsonTranslatorApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("AI JSON translator")
        # self.geometry("1920x860")
        ctk.set_appearance_mode("System")
        ctk.set_default_color_theme("blue")
        
        cfg = load_config()
        default_key = cfg.get("api_key", "AIzaSyBJtjNHg809pnB1p3WAvbojSd48SGmLRPc")
        default_lang = cfg.get("language", "Chinese")
        default_prompt = cfg.get("prompt", 
            "Translate the following JSON into the target language, keeping structure unchanged.")

        # ======== 标题 ========
        title = ctk.CTkLabel(self, text="🌍 AI JSON Translator", font=ctk.CTkFont(size=22, weight="bold"))
        title.pack(pady=(10, 0))

        # ======== 顶部主区域（左右结构） ========
        main_frame = ctk.CTkFrame(self, corner_radius=10)
        main_frame.pack(fill="both", expand=True, padx=20, pady=(10, 5))
        main_frame.grid_columnconfigure(0, weight=1)
        main_frame.grid_columnconfigure(1, weight=2)
        main_frame.grid_rowconfigure(0, weight=1)

        # ---------------- 左侧控制区 ----------------
        left = ctk.CTkFrame(main_frame)
        left.grid(row=0, column=0, sticky="nsew", padx=(10,5), pady=10)
        left.grid_columnconfigure(0, weight=1)

        # API Key
        ctk.CTkLabel(left, text="Gemini API Key").pack(anchor="w", pady=(5,0))
        self.api_entry = ctk.CTkEntry(left, width=280)
        self.api_entry.insert(0, default_key)
        self.api_entry.pack(fill="x", pady=(0,10))

        # Language
        ctk.CTkLabel(left, text="Target Language").pack(anchor="w", pady=(5,0))
        self.lang_option = ctk.CTkOptionMenu(left,
        values=["Chinese","English","Japanese","Korean","French","German","Spanish"],
        width=200)
        self.lang_option.set(default_lang)
        self.lang_option.pack(fill="x", pady=(0,10))

        # Input / Output path
        ctk.CTkLabel(left, text="Input Path:").pack(anchor="w")
        path_frame_in = ctk.CTkFrame(left)
        path_frame_in.pack(fill="x", pady=(0,8))
        self.input_entry = ctk.CTkEntry(path_frame_in)
        self.input_entry.pack(side="left", fill="x", expand=True, padx=(0,5))
        ctk.CTkButton(path_frame_in, text="Browse", width=60, command=self.select_input).pack(side="right")

        ctk.CTkLabel(left, text="Output Path:").pack(anchor="w")
        path_frame_out = ctk.CTkFrame(left)
        path_frame_out.pack(fill="x", pady=(0,10))
        self.output_entry = ctk.CTkEntry(path_frame_out)
        self.output_entry.pack(side="left", fill="x", expand=True, padx=(0,5))
        ctk.CTkButton(path_frame_out, text="Browse", width=60, command=self.select_output).pack(side="right")

        # Start button
        self.start_btn = ctk.CTkButton(left, text="🚀 Start translation", fg_color="#3b82f6", command=self.start_translation)
        self.start_btn.pack(pady=(10,0))
        
        # ---- 保存设置按钮 ----
        self.save_btn = ctk.CTkButton(
            left,
            text="💾 Save config",
            width=160,
            height=26,
            fg_color="#6366f1",
            hover_color="#4f46e5",
            command=self.save_current_settings
        )
        self.save_btn.pack(anchor="w", pady=(5,10))

        # ---------------- 右侧 Prompt 编辑区 ----------------
        right = ctk.CTkFrame(main_frame)
        right.grid(row=0, column=1, sticky="nsew", padx=(5,10), pady=10)
        right.grid_rowconfigure(1, weight=1)
        right.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(right, text="Prompt", font=ctk.CTkFont(size=16, weight="bold")).grid(row=0, column=0, sticky="w")
        self.prompt_box = ctk.CTkTextbox(right, width=400, height=300, wrap="word")
        self.prompt_box.insert("1.0", default_prompt)
        self.prompt_box.grid(row=1, column=0, sticky="nsew", pady=(5, 10))

        # ======== 底部日志区 ========
        bottom = ctk.CTkFrame(self)
        bottom.pack(fill="both", expand=False, padx=20, pady=(0, 10))
        bottom.grid_columnconfigure(0, weight=1)
        bottom.grid_rowconfigure(0, weight=1)

        ctk.CTkLabel(bottom, text="Run log", font=ctk.CTkFont(size=15, weight="bold")).grid(row=0, column=0, sticky="w")
        self.log_box = ctk.CTkTextbox(bottom, height=150)
        self.log_box.grid(row=1, column=0, sticky="nsew", pady=(5, 5))
        self.progress_label = ctk.CTkLabel(bottom, text="Progress: 0/0")
        self.progress_label.grid(row=2, column=0, sticky="w", pady=(0,5))
        
    # def load_saved_key(self):
    #     if os.path.exists(CONFIG_FILE):
    #         with open(CONFIG_FILE, "r", encoding="utf-8") as f:
    #             cfg = json.load(f)
    #             return cfg.get("api_key", DEFAULT_API_KEY)
    #     return DEFAULT_API_KEY

    # def save_key(self, key):
    #     with open(CONFIG_FILE, "w", encoding="utf-8") as f:
    #         json.dump({"api_key": key}, f)
    def save_current_settings(self):
        api_key = self.api_entry.get().strip()
        prompt = self.prompt_box.get("1.0", "end").strip()
        target_lang = self.lang_option.get()

        try:
            save_config(api_key, target_lang, prompt)
            self.log_box.insert("end", "✅ config saved to config.json\n")
            self.log_box.see("end")
        except Exception as e:
            self.log_box.insert("end", f"❌ fail to save config to: {e}\n")
            self.log_box.see("end")

    def select_input(self):
        path = filedialog.askopenfilename(
            title="Select JSON file or folder containing JSON files",
            filetypes=[("JSON file", "*.json"), ("All file", "*.*")]
        )

        # 如果用户选择了文件
        if path and os.path.isfile(path):
            self.input_entry.delete(0, "end")
            self.input_entry.insert(0, path)
            self.log_box.insert("end", f"📄 Select file: {path}\n")
        else:
            # 否则让他选文件夹
            folder = filedialog.askdirectory(title="Please input floder")
            if folder:
                self.input_entry.delete(0, "end")
                self.input_entry.insert(0, folder)
                self.log_box.insert("end", f"📂 Input path: {folder}\n")

    def select_output(self):
        folder = filedialog.askdirectory(title="Output folder")
        if folder:
            self.output_entry.delete(0, "end")
            self.output_entry.insert(0, folder)
            self.log_box.insert("end", f"💾 Output path: {folder}\n")

    def start_translation(self):
        api_key = self.api_entry.get().strip()
        prompt = self.prompt_box.get("1.0", "end").strip()
        target_lang = self.lang_option.get()
        api_key = self.api_entry.get().strip()
        prompt = self.prompt_box.get("1.0", "end").strip()
        input_path = self.input_entry.get().strip()
        output_dir = self.output_entry.get().strip()
        target_lang = self.lang_option.get()

        if not api_key or not input_path:
            messagebox.showerror("Error", "Please input API or input path")
            return

        # 自动生成输出路径
        if not output_dir:
            lang_code = LANG_ABBR.get(target_lang, target_lang[:2].lower())
            if os.path.isfile(input_path):
                base, ext = os.path.splitext(input_path)
                output_dir = f"{base}_{lang_code}{ext}"
            else:
                output_dir = f"{input_path}_{lang_code}"
            self.log_box.insert("end", f"💾 Output path empty, using default setting: {output_dir}\n")

        self.log_box.insert("end", "Start translating...\n")

        thread = threading.Thread(
            target=process_path,
            args=(input_path, output_dir, api_key, prompt, target_lang, self.log_box, self.progress_label)
        )
        thread.start()

if __name__ == "__main__":
    app = JsonTranslatorApp()
    app.mainloop()
