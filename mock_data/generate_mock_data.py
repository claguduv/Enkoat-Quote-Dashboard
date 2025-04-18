#pip install Faker
import csv
import random
from faker import Faker
from datetime import datetime

fake = Faker()

roof_types = ["Metal", "TPO", "Foam", "EPDM", "Built-up", "Modified Bitumen", "PVC"]

states_and_cities = {
    "Arizona": ["Phoenix", "Tempe", "Tucson", "Mesa", "Scottsdale"],
    "California": ["Los Angeles", "San Diego", "San Jose", "Sacramento", "Fresno"],
    "Texas": ["Austin", "Dallas", "Houston", "San Antonio", "Fort Worth"],
    "Nevada": ["Las Vegas", "Reno", "Henderson"],
    "Colorado": ["Denver", "Boulder", "Colorado Springs"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany"],
    "Georgia": ["Atlanta", "Savannah", "Augusta", "Macon"],
    "Illinois": ["Chicago", "Springfield", "Naperville"],
    "Washington": ["Seattle", "Tacoma", "Spokane", "Bellevue"]
}

company_suffixes = [
    "Roofing", "Contractors", "Co.", "Enterprises", "Builders", "Systems",
    "Solutions", "Engineering", "Construction", "Industries", "Design Group",
    "Innovations", "Projects", "Holdings", "Works", "Infrastructure",
    "Associates", "Developers", "Renovations", "Roof Tech", "Maintenance",
    "Group", "Corp.", "Partners", "Restoration"
]

with open("mock_quotes.csv", "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow([
        "contractor_name",
        "company",
        "roof_size",
        "roof_type",
        "city",
        "state",
        "project_date"
    ])

    for _ in range(1000):
        state = random.choice(list(states_and_cities.keys()))
        city = random.choice(states_and_cities[state])
        roof_type = random.choice(roof_types)
        project_date = fake.date_between(start_date="-2y", end_date="today")

        first_name = fake.first_name()
        last_name = fake.last_name()
        suffix = random.choice(company_suffixes)

        contractor_name = f"{first_name} {last_name}"
        company_name = f"{last_name} {suffix}"

        writer.writerow([
            contractor_name,
            company_name,
            random.randint(800, 10000),  # Roof size (sq ft)
            roof_type,
            city,
            state,
            project_date.strftime("%Y-%m-%d")
        ])
