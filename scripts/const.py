from skyfield.api import Star, load, Topos
from skyfield.data import hipparcos
import os
import sys
import json

def constellation(df, t, name):
	locations = []
	filepath = os.path.dirname(os.path.realpath(__file__)) + '/constellations/' + name + '.txt'
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
	
	return locations

with load.open(hipparcos.URL) as f:
	df = hipparcos.load_dataframe(f)

planets = load('de421.bsp')
earth = planets['earth']
watcher = earth + Topos('37.538261 N', '77.435060 W')

ts = load.timescale(builtin=True)
# t = ts.now()
t = ts.utc(2019, 10, 4, 4, 00, 00)
if(len(sys.argv) == 2):
	print(json.dumps({"stars": constellation(df, t, str(sys.argv[1]) )}))
else:	
	print(json.dumps({"stars": constellation(df, t, 'Andromeda')}))
