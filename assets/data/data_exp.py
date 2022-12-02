import csv
import numpy as np
import os
import matplotlib.pyplot as plt

print('Hello World')
ranks = None
avg_ranks = {}
with open('./assets/data/ultra_rankings_clean.csv', 'r') as f:
    rank_reader = csv.DictReader(f, delimiter=',')
    fieldnames = rank_reader.fieldnames + ['country']
    ranks = {}
    for row in rank_reader:
        if row['rank'] != 'NA':
            if row['country'] not in ranks:
                ranks[row['country']] = []
            ranks[row['country']].append(int(row['rank']))

    for country in ranks:
        if len(ranks[country]) > 50:
            avg_ranks[country] = np.mean(ranks[country])
    

avg_ranks = sorted(ranks.items(), key=lambda x: x[1])
print(avg_ranks)


fig, ax = plt.subplots(figsize=(5, 2.7), layout='constrained')
categories = [x[0] for x in avg_ranks]
values = [x[1] for x in avg_ranks]

ax.bar(categories, values)
fig.show()
input()