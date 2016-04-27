import csv

countries = []
with open("world-country-names.tsv","rb") as countriesFile:
    reader = csv.reader(countriesFile, delimiter="\t")
    for row in reader:
        countries.append(row)

emissions = []
with open("emissions.csv","rb") as emissionsFile:
	reader = csv.reader(emissionsFile)
	for row in reader:
		emissions.append(row)

emissions_to_remove = []
countries_to_remove = []
combined = []
left_over_ids = []
for row in countries:
	match = False
	for row2 in emissions:
		if row[1] == row2[0]:
			combined.append(row + row2[2:10])
			countries_to_remove.append(row)
			emissions_to_remove.append(row2)
			match = True
	if not match:
		left_over_ids.append(row)

for row in countries_to_remove:
	countries.remove(row)
for row in emissions_to_remove:
	emissions.remove(row)
		
for row in left_over_ids:
	if row[0] != "id":
		print "---------------------------------"
		print row
		for i in range(len(emissions)):
			print str(i + 1) + ". " + emissions[i][0]
		match = int(raw_input("Choose match number or 0 for no match:"))
		if match != 0:
			combined.append(row + emissions[match - 1][2:10])
			emissions.remove(emissions[match - 1])
		else:
			combined.append(row)
	
with open("filteredData.csv","wb") as output:
		writer = csv.writer(output, delimiter=",")
		for row in combined:
			writer.writerow(row)
#			print row