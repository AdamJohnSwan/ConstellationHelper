from skyfield.api import Star, load, Topos
from skyfield.data import hipparcos

def constellation(df, t, name):
	locations = []
	filepath = 'constellations/' + name + '.txt'
	with open(filepath) as f:
		star_numbers = f.read().splitlines() 
	
	for star_number in star_numbers:
		star = Star.from_dataframe(df.loc[int(star_number)])
		astrometric = watcher.at(t).observe(star)
		apparent = astrometric.apparent()
		star_alt, star_az, distance = apparent.altaz()
		locations.append([star_alt.degrees, star_az.degrees])
	
	return locations
		
def all_stars(df, t):
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
			locations.append([star_alt.degrees, star_az.degrees, df.iloc[i]['magnitude']])
			
	return locations

with load.open(hipparcos.URL) as f:
	df = hipparcos.load_dataframe(f)

planets = load('de421.bsp')
earth = planets['earth']
watcher = earth + Topos('37.538261 N', '77.435060 W')

ts = load.timescale()
# t = ts.now()
t = ts.utc(2019, 10, 4, 4, 00, 00)

#andro = constellation(df, t, 'Andromeda')
andro = all_stars(df, t)
print(andro)
