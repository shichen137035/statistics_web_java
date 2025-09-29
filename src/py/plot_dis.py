import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import beta

def beautify_axes(ax, spine_width=2, spine_color="black"):
    """统一加粗并设置坐标轴边框颜色"""
    for spine in ax.spines.values():
        spine.set_linewidth(spine_width)
        spine.set_edgecolor(spine_color)

def plot_pdf(x,pdf):
    plt.figure(figsize=(6,4))
    ax = plt.gca()
    plt.plot(x, pdf, color="blue", lw=3, label="PDF")
    plt.fill_between(x, 0, pdf, color="skyblue", alpha=0.4)
    plt.xlabel("x", fontsize=14)
    plt.ylabel("Density", fontsize=14)
    plt.tick_params(axis="both", labelsize=12)
    plt.ylim(bottom=0)
    plt.legend(fontsize=12)
    beautify_axes(ax, spine_width=2)   # 加粗边框
    plt.tight_layout()
    # plt.savefig("/mnt/data/beta_pdf.png", dpi=150)
    # plt.show()
    

def plot_cdf(x,cdf):
    plt.figure(figsize=(6,4))
    ax = plt.gca()
    plt.plot(x, cdf, color="red", lw=3, label="CDF")
    plt.fill_between(x, 0, cdf, color="lightcoral", alpha=0.3)
    plt.xlabel("x", fontsize=14)
    plt.ylabel("Cumulative Probability", fontsize=14)
    plt.tick_params(axis="both", labelsize=12)
    plt.ylim(bottom=0)
    plt.legend(fontsize=12)
    beautify_axes(ax, spine_width=2)   # 加粗边框
    plt.tight_layout()
    # plt.savefig("/mnt/data/beta_cdf.png", dpi=150)
    # plt.show()
# 参数
alpha, beta_param = 2, 5
x = np.linspace(0, 1, 400)

# PDF 和 CDF
pdf = beta.pdf(x, alpha, beta_param)
cdf = beta.cdf(x, alpha, beta_param)

# 美化风格
plt.style.use("seaborn-v0_8-whitegrid")
plot_cdf(x,cdf)
plot_pdf(x,pdf)
plt.show()




