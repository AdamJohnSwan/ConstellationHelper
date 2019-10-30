function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			console.log(position.coords.latitude);
			console.log(position.coords.longitude);
		});
	} else {
		console.log("Geolocation is not supported by this browser.");
	}
}