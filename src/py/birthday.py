import numpy as np
import matplotlib.pyplot as plt

# Function to compute the probability that at least two people
# share a birthday in a group of size n
def birthday_prob(n):
    # Complement event: 1 - P(all birthdays distinct)
    days = 365
    prob_distinct = 1.0
    for k in range(n):
        prob_distinct *= (1 - k / days)
    return 1 - prob_distinct

# Compute probabilities for group sizes from 1 to 50
n_values = np.arange(1, 51)
prob_values = [birthday_prob(n) for n in n_values]

# Find the first n where probability exceeds 0.5
threshold_n = next(n for n, p in zip(n_values, prob_values) if p > 0.5)
print(f"The probability exceeds 50% when class size is {threshold_n} students.")

# Plot the probability curve
plt.figure(figsize=(8, 5))
plt.plot(n_values, prob_values, marker='o', linestyle='-', color='blue')
plt.axhline(0.5, color='gray', linestyle='--', label='50% threshold')
plt.axvline(threshold_n, color='red', linestyle=':', label=f'n = {threshold_n}')
plt.title("Birthday Problem")
plt.xlabel("Class size (n)")
plt.ylabel("P(at least two share a birthday)")
plt.legend()
plt.grid(True, linestyle='--', alpha=0.6)
plt.tight_layout()
plt.show()
