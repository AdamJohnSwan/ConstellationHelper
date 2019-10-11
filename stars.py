from skyfield.api import Star, Topos, Loader
from skyfield.data import hipparcos
import json
import os
import pdb

folder = os.path.dirname(os.path.realpath(__file__))

def prepare():
	load = Loader(folder + '/skyfield-data', verbose=True)
	with load.open(hipparcos.URL) as f:
			df = hipparcos.load_dataframe(f)
		
	planets = load('de421.bsp')
	earth = planets['earth']
	watcher = earth + Topos('37.538261 N', '77.435060 W')

	ts = load.timescale()
	# t = ts.now()
	t = ts.utc(2019, 10, 4, 4, 00, 00)
	return df, t, watcher

def constellation(name):
	df, t, watcher = prepare()
	locations = []
	filepath = folder + '/constellations/' + name + '.txt'
	with open(filepath) as f:
		star_numbers = f.read().splitlines() 
	
	for i, star_number in enumerate(star_numbers):
		star = Star.from_dataframe(df.loc[int(star_number)])
		astrometric = watcher.at(t).observe(star)
		apparent = astrometric.apparent()
		star_alt, star_az, distance = apparent.altaz()
		locations.append({
			"alt": star_alt.degrees,
			"azm": star_az.degrees,
			"mag": df.iloc[i]['magnitude']
		})
	
	return json.dumps({"stars": locations})

def sky():
	df, t, watcher = prepare()
	locations = []
	# filter out stars that don't have location
	df = df[df['ra_degrees'].notnull()]
	# filter out stars that cannot be seen with the naked eye
	df = df[df['magnitude'] < 6]
	stars = Star.from_dataframe(df)
	for i in range(len(df)):
		star = Star(
			ra_hours = stars.ra.hours[i],
			dec_degrees = stars.dec.degrees[i],
			ra_mas_per_year = stars.ra_mas_per_year[i],
			dec_mas_per_year = stars.dec_mas_per_year[i],
			parallax_mas = stars.parallax_mas[i])
		astrometric = watcher.at(t).observe(star)
		apparent = astrometric.apparent()
		star_alt, star_az, distance = apparent.altaz()
		if(star_alt.degrees > 0):
			locations.append({
				"alt": star_alt.degrees,
				"azm": star_az.degrees,
				"mag": df.iloc[i]['magnitude']
			})
			
	return json.dumps({"stars": locations})
