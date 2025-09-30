import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import *
from itertools import combinations
import os



class SignRank:
    def __init__(self):
        self._cache = {}  # 缓存分布对象，避免重复计算

    def _get_dist(self, n):
        if n not in self._cache:
            ranks = np.arange(1, n+1)
            all_sums = []
            for mask in range(1 << n):
                s = 0
                for i in range(n):
                    if (mask >> i) & 1:
                        s += ranks[i]
                all_sums.append(s)
            values, counts = np.unique(all_sums, return_counts=True)
            probs = counts / counts.sum()
            self._cache[n] = rv_discrete(name=f"signrank_{n}", values=(values, probs))
        return self._cache[n]

    def pdf(self, x, n):
        return self._get_dist(n).pmf(x)

    def cdf(self, x, n):
        return self._get_dist(n).cdf(x)


class Wilcox:
    def __init__(self):
        self._cache = {}

    def _get_dist(self, n1, n2):
        key = (n1, n2)
        if key not in self._cache:
            N = n1 + n2
            all_indices = np.arange(1, N+1)
            sums = [sum(comb) for comb in combinations(all_indices, n1)]
            values, counts = np.unique(sums, return_counts=True)
            probs = counts / counts.sum()
            self._cache[key] = rv_discrete(name=f"wilcox_{n1}_{n2}", values=(values, probs))
        return self._cache[key]

    def pdf(self, x, n1, n2):
        return self._get_dist(n1, n2).pmf(x)

    def cdf(self, x, n1, n2):
        return self._get_dist(n1, n2).cdf(x)

# 美化风格
plt.style.use("seaborn-v0_8-whitegrid")

def beautify_axes(ax, spine_width=2, spine_color="black"):
    """统一加粗并设置坐标轴边框颜色"""
    for spine in ax.spines.values():
        spine.set_linewidth(spine_width)
        spine.set_edgecolor(spine_color)

# 保存路径
SAVE_DIR = r"F:\java_web\Statistics_web\statistics_web_java\src\main\resources\main\concept\distribution_type\img"

def plot_distribution(dist, x, dist_name="dist", **params):
    """
    通用分布绘图函数
    - dist: scipy.stats 分布对象 (如 binom, poisson, logistic)
    - x: 横坐标 (numpy array 或整数范围)
    - dist_name: 分布名称 (保存文件名用)
    - params: 分布参数 (如 n, p; loc, scale 等)
    """

    # PDF (连续) / PMF (离散)，统一称为 pdf
    if hasattr(dist, "pdf"):
        pdf = dist.pdf(x, **params)
    else:
        pdf = dist.pmf(x, **params)

    cdf = dist.cdf(x, **params)

    # 参数字符串（显示在 legend 上）
    param_str = ", ".join(f"{k}={v}" for k, v in params.items())

    # === PDF 图 ===
    plt.figure(figsize=(6, 4))
    ax = plt.gca()
    plt.plot(x, pdf, color="blue", lw=3, label=f"PDF ({param_str})")
    plt.fill_between(x, 0, pdf, color="skyblue", alpha=0.4)
    plt.xlabel("x", fontsize=14)
    plt.ylabel("Density", fontsize=14)
    plt.tick_params(axis="both", labelsize=12)
    plt.ylim(bottom=0)
    
    legend = plt.legend(
        fontsize=12,
        frameon=True,        # 开启边框
        facecolor="white",   # 背景白色
        framealpha=0.9,      # 半透明
        edgecolor="black",   # 边框颜色
        loc="best"           # 自动选择合适位置
    )
    for text in legend.get_texts():
        text.set_fontweight("bold")   # 字体加粗
    beautify_axes(ax, spine_width=2)
    plt.tight_layout()

    filename_pdf = f"{dist_name.lower()}_pdf.png"
    filepath_pdf = os.path.join(SAVE_DIR, filename_pdf)
    plt.savefig(filepath_pdf, dpi=150)

    # === CDF 图 ===
    plt.figure(figsize=(6, 4))
    ax = plt.gca()
    plt.plot(x, cdf, color="red", lw=3, label=f"CDF ({param_str})")
    plt.fill_between(x, 0, cdf, color="lightcoral", alpha=0.3)
    plt.xlabel("x", fontsize=14)
    plt.ylabel("Cumulative Probability", fontsize=14)
    plt.tick_params(axis="both", labelsize=12)
    plt.ylim(bottom=0)
    legend = plt.legend(
        fontsize=12,
        frameon=True,        # 开启边框
        facecolor="white",   # 背景白色
        framealpha=0.9,      # 半透明
        edgecolor="black",   # 边框颜色
        loc="best"           # 自动选择合适位置
    )
    for text in legend.get_texts():
        text.set_fontweight("bold")   # 字体加粗
    beautify_axes(ax, spine_width=2)
    plt.tight_layout()

    filename_cdf = f"{dist_name.lower()}_cdf.png"
    filepath_cdf = os.path.join(SAVE_DIR, filename_cdf)
    plt.savefig(filepath_cdf, dpi=150)

    
    
# # 1. Beta 分布
# x = np.linspace(0, 1, 500)
# plot_distribution(beta, x, dist_name="beta", a=2, b=5)

# # 2. Binomial 分布
# n, p = 10, 0.5
# x = np.arange(0, n + 1)
# plot_distribution(binom, x, dist_name="binom", n=n, p=p)

# # 3. Cauchy 分布
# x = np.linspace(-10, 10, 500)
# plot_distribution(cauchy, x, dist_name="cauchy", loc=0, scale=1)

# # 4. Chi-squared 分布
# x = np.linspace(0, 20, 500)
# plot_distribution(chi2, x, dist_name="chisq", df=5)

# # 5. Exponential 分布
# x = np.linspace(0, 10, 500)
# plot_distribution(expon, x, dist_name="exp", scale=1)

# # 6. F 分布
# x = np.linspace(0, 5, 500)
# plot_distribution(f, x, dist_name="f", dfn=5, dfd=10)

# # 7. Gamma 分布
# x = np.linspace(0, 20, 500)
# plot_distribution(gamma, x, dist_name="gamma", a=2, scale=2)

# # 8. Geometric 分布
# x = np.arange(1, 15)
# plot_distribution(geom, x, dist_name="geom", p=0.2)

# # 9. Hypergeometric 分布
# M, n, N = 50, 10, 20   # 总体50，红球10，抽样20
# x = np.arange(0, N + 1)
# plot_distribution(hypergeom, x, dist_name="hyper", M=M, n=n, N=N)

# # 10. Log-normal 分布
# x = np.linspace(0, 5, 500)
# plot_distribution(lognorm, x, dist_name="lnorm", s=0.5, scale=1)

# # 11. Logistic 分布
# x = np.linspace(-10, 10, 500)
# plot_distribution(logistic, x, dist_name="logis", loc=0, scale=1)

# # 12. Negative Binomial 分布
# x = np.arange(0, 30)
# plot_distribution(nbinom, x, dist_name="nbinom", n=5, p=0.4)

# # 13. Normal 分布
# x = np.linspace(-5, 5, 500)
# plot_distribution(norm, x, dist_name="norm", loc=0, scale=1)

# # 14. Poisson 分布
# mu = 5
# x = np.arange(0, 20)
# plot_distribution(poisson, x, dist_name="pois", mu=mu)

# # 15. Student's t 分布
# x = np.linspace(-10, 10, 500)
# plot_distribution(t, x, dist_name="t", df=5)

# # 16. Uniform 分布
# x = np.linspace(0, 1, 500)
# plot_distribution(uniform, x, dist_name="unif", loc=0, scale=1)

# # 17. Weibull 分布
# x = np.linspace(0, 5, 500)
# plot_distribution(weibull_min, x, dist_name="weibull", c=1.5)

# 18. Weibull (Wilcox 不在 scipy，先跳过)
# signrank / wilcox 暂缺

# Wilcoxon Signed-Rank (signrank)
# SignRank (n=8)
signrank = SignRank()
n = 8
x = np.arange(0, n*(n+1)//2 + 1)
plot_distribution(signrank, x, dist_name="signrank", n=n)

# Wilcox (n1=5, n2=7)
wilcox = Wilcox()
n1, n2 = 5, 7
x = np.arange(min(wilcox._get_dist(n1, n2).xk), max(wilcox._get_dist(n1, n2).xk) + 1)
plot_distribution(wilcox, x, dist_name="wilcox", n1=n1, n2=n2)

plt.show()




