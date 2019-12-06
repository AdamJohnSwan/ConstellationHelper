#----------------------------------------------------------------------------#
# Imports
#----------------------------------------------------------------------------#

from flask import Flask, render_template, request
import logging
import requests
from logging import Formatter, FileHandler
import os
import sys
import stars

#----------------------------------------------------------------------------#
# App Config.
#----------------------------------------------------------------------------#

app = Flask(__name__)
app.config.from_object('config')

#----------------------------------------------------------------------------#
# Controllers.
#----------------------------------------------------------------------------#


@app.route('/')
def home():
	latitude = request.args.get('lat')
	longitude = request.args.get('lng')
	try:
		if(latitude is None or longitude is None):
			raise ValueError
		float(latitude)
		float(longitude)
		return render_template('pages/world.html')
	except ValueError:
		return render_template('pages/home.html')

@app.route('/get-location')
def get_location():
	ip = request.remote_addr
	response = requests.get("https://extreme-ip-lookup.com/json/") #+ ip)
	return response.text

@app.route('/constellation')
def constellation():
	try:
		constellation = request.args.get('const')
		latitude = float(request.args.get('lat'))
		longitude = float(request.args.get('lng'))
		if(constellation is None):
			return stars.constellation(latitude, longitude)
		else:
			return stars.constellation(latitude, longitude, constellation.lower())
	except ValueError:
		abort(400)

@app.route('/sky')
def sky():
	try:
		latitude = float(request.args.get('lat'))
		longitude = float(request.args.get('lng'))
		return stars.sky(latitude, longitude)
	except ValueError:
		abort(400)

# Error handlers.
@app.errorhandler(500)
def internal_error(error):
    return render_template('errors/500.html'), 500


@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

if not app.debug:
    file_handler = FileHandler('error.log')
    file_handler.setFormatter(
        Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    )
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('errors')

#----------------------------------------------------------------------------#
# Launch.
#----------------------------------------------------------------------------#


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

