import csv
import os

print('Hello World')

country_codes = {}
with open('./assets/data/ioc_country_codes.csv', 'r') as f2:
    country_reader = csv.DictReader(f2, delimiter=',')
    for row in country_reader:
        country_codes[row['NOC']] = row['Country']


print(os.getcwd())
with open('./assets/data/ultra_rankings.csv', 'r') as f:
    rank_reader = csv.DictReader(f, delimiter=',')
    fieldnames = rank_reader.fieldnames + ['country']

    with open('./assets/data/ultra_rankings_clean.csv', 'w', newline='') as f3:
        writer = csv.DictWriter(f3, fieldnames=fieldnames)
        writer.writeheader()
        for row in rank_reader:
            row['country'] = country_codes[row['nationality']]
            writer.writerow(row)
 #   for row in reader:
  #      print(row['nationality'])


