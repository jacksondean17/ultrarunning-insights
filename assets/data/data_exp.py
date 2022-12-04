import csv
import numpy as np
import os
import matplotlib.pyplot as plt

def get_health_care_data():
    with open('./assets/data/demographics/Health care index by countries 2020.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        health_care_data = {}
        for row in reader:
            c = row['Country']
            row.pop('Country')
            health_care_data[c] = row
    return health_care_data


def get_quality_of_life_data():
    with open('./assets/data/demographics/Quality of life index by countries 2020.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        quality_of_life_data = {}
        for row in reader:
            c = row['Country']
            row.pop('Country')
            quality_of_life_data[c] = row
    return quality_of_life_data

def get_population_data():
    with open('./assets/data/demographics/Population density by countries.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',', quotechar='"')
        population_data = {}
        for row in reader:
            c = row['Country']
            row.pop('Country')
            population_data[c] = row
    return population_data

def get_cost_of_living_data():
    with open('./assets/data/demographics/Cost of living index by country 2020.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',', quotechar='"')
        cost_of_living_data = {}
        for row in reader:
            c = row['Country']
            row.pop('Country')
            cost_of_living_data[c] = row
    return cost_of_living_data

def get_elevation_data():
    with open('./assets/data/demographics/Elevation.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',', quotechar='"')
        elevation_data = {}
        for row in reader:
            c = row['Country']
            row.pop('Country')
            elevation_data[c] = row
    return elevation_data

def get_ultra_rankings_data():
    with open('./assets/data/ultra_rankings_clean.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        ultra_rankings_data = {}
        for row in reader:
            c = row['country']
            row.pop('country')
            ultra_rankings_data[c] = row
    return ultra_rankings_data

def get_country_scores():
    with open('./assets/data/ultra_rankings_clean.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        top_ranks = {}
        country_scores = {}
        for row in reader:
            if row['rank'] != 'NA':
                c = row['country']
                if row['country'] not in top_ranks:
                    top_ranks[c] = []
                if int(row['rank']) < 50:
                    top_ranks[c].append(int(row['rank']))
        
        for c in top_ranks:
            if len(top_ranks[c]) > 50:
                country_scores[c] = np.sum(top_ranks[c])
        return country_scores

def normalize_scores_by_participation(scores):
    with open('./assets/data/ultra_rankings_clean.csv', 'r') as f:
        reader = csv.DictReader(f, delimiter=',')
        country_participation = {}
        norm_scores = {}
        for row in reader:
            if row['rank'] != 'NA':
                c = row['country']
                if row['country'] not in country_participation:
                    country_participation[c] = 0
                country_participation[c] += 1
        
        for c in scores:
            if c in country_participation:
                norm_scores[c] = scores[c] / country_participation[c]
            
    return norm_scores


def plot_scores_vs_population_density():
    pop_data = get_population_data()
    scores = get_country_scores()
    norm_scores = normalize_scores_by_participation(scores)

    x = []
    y = []
    names = []
    for c in norm_scores:
        if c in pop_data:
            x.append(int(pop_data[c]['Density pop./km2'].replace(',', '')))
            y.append(norm_scores[c])
            names.append(c)

    fig, ax = plt.subplots()
    ax.scatter(x, y)
    for i, txt in enumerate(names):
        ax.annotate(txt, (x[i], y[i]))

    #calculate equation for trendline
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    print(p)
    plt.plot(x, p(x))

    plt.xlabel('Population Density')
    plt.ylabel('Score')
    plt.show()

def plot_scores_vs_health_care():
    health_data = get_health_care_data()
    scores = get_country_scores()
    norm_scores = normalize_scores_by_participation(scores)

    x = []
    y = []
    names = []
    for c in norm_scores:
        if c in health_data:
            x.append(float(health_data[c]['Health Care Index']))
            y.append(norm_scores[c])
            names.append(c)

    fig, ax = plt.subplots()
    ax.scatter(x, y)
    for i, txt in enumerate(names):
        ax.annotate(txt, (x[i], y[i]))

    
    plt.xlabel('Health care index')
    plt.ylabel('Score')

    #calculate equation for trendline
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    plt.plot(x, p(x))

    plt.show()

def plot_scores_vs_land_area():
    pop_data = get_population_data()
    scores = get_country_scores()
    norm_scores = normalize_scores_by_participation(scores)

    x = []
    y = []
    names = []
    for c in norm_scores:
        if c in pop_data:
            x.append(int(pop_data[c]['Area mi2'].replace(',', '')))
            y.append(norm_scores[c])
            names.append(c)

    fig, ax = plt.subplots()
    ax.scatter(x, y)
    for i, txt in enumerate(names):
        ax.annotate(txt, (x[i], y[i]))

    #calculate equation for trendline
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    plt.plot(x, p(x))

    plt.xlabel('Land area')
    plt.ylabel('Score')
    plt.show()

def plot_scores_vs_cost_of_living():
    cost_data = get_cost_of_living_data()
    scores = get_country_scores()
    norm_scores = normalize_scores_by_participation(scores)

    x = []
    y = []
    names = []
    for c in norm_scores:
        if c in cost_data:
            x.append(float(cost_data[c]['Cost of Living Index']))
            y.append(norm_scores[c])
            names.append(c)

    fig, ax = plt.subplots()
    ax.scatter(x, y)
    for i, txt in enumerate(names):
        ax.annotate(txt, (x[i], y[i]))

    
    plt.xlabel('Cost of living index')
    plt.ylabel('Score')

    #calculate equation for trendline
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    plt.plot(x, p(x))

    plt.show()

def plot_scores_vs_elevation():
    elevation_data = get_elevation_data()
    scores = get_country_scores()
    norm_scores = normalize_scores_by_participation(scores)

    x = []
    y = []
    names = []
    for c in norm_scores:
        if c in elevation_data:
            x.append(int(elevation_data[c]['Elevation'].replace(',', '')))
            y.append(norm_scores[c])
            names.append(c)

    fig, ax = plt.subplots()
    ax.scatter(x, y)
    for i, txt in enumerate(names):
        ax.annotate(txt, (x[i], y[i]))

    
    plt.xlabel('Elevation')
    plt.ylabel('Score')

    #calculate equation for trendline
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    print(p)
    plt.plot(x, p(x))

    plt.show()

def save_data():
    scores = get_country_scores()
    norm_scores = normalize_scores_by_participation(scores)
    pop_data = get_population_data()
    health_data = get_health_care_data()
    cost_data = get_cost_of_living_data()
    elevation_data = get_elevation_data()
    
    with open('./assets/data/demographics/processed_data.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['country', 'score', 'population_density', 'health_care', 'cost_of_living', 'elevation'])
        for c in norm_scores:
            if c in pop_data and c in health_data and c in cost_data and c in elevation_data:
                writer.writerow([c, f'{norm_scores[c]:.2f}', pop_data[c]['Density pop./km2'], health_data[c]['Health Care Index'], cost_data[c]['Cost of Living Index'], elevation_data[c]['Elevation'].replace(',', '')])

plot_scores_vs_population_density() # yes
#plot_scores_vs_health_care() # yes
#plot_scores_vs_land_area()
#plot_scores_vs_cost_of_living() # yes
#plot_scores_vs_elevation() # yes
#save_data()