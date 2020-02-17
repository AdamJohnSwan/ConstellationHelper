var constellationPositions = [];
var averageX = 0;
var averageY = 0;
var averageZ = 0;
var constellationName = '';
var starGroup = null;
var newConstellation = false;
var lineTimeout = null;

function placeStars() {
	makeRequest('/sky' + window.location.search)
		.then(result => {
			if (result[0] === 1) {
				return Promise.reject(result[1])
			} else if (result[0] === 0) {
				var stars = result[1].stars;
				const material = new THREE.MeshBasicMaterial({
					color: 0xffffff
				});
				var spriteMaterial = new THREE.SpriteMaterial( { color: 0xffffff } );
				stars.forEach(function(star) {
					size = Math.abs(star.mag - 6) / 4
					if(size < 0.2) {
						size = 0.2
					}
					var geometry = new THREE.CircleBufferGeometry( size, 6 );
					var sphere = new THREE.Mesh( geometry, material );
					
					sphere.rotateY(star.azm * (Math.PI / 180))
					sphere.rotateX(star.alt * (Math.PI / 180))
					sphere.translateZ(-100);
					var sprite = new THREE.Sprite( spriteMaterial );
					sprite.position.set(sphere.position.x, sphere.position.y, sphere.position.z)
					sprite.scale.set(size, size, 1.0)
					scene.add( sprite );
					//Remove the temp sphere from memory
					sphere.geometry.dispose();
					sphere.material.dispose();
					sphere = undefined;
				});
				starsLoaded = true;
				checkForLoading();
			} else if (result[0] === 2) {
				return Promise.reject('No content')
			}
		}).catch(err => console.log(err))
}


function placeConstellation() {
	starGroup = new THREE.Group();
	makeRequest('/constellation' + window.location.search)
		.then(result => {
			newConstellation = false;
			if (result[0] === 1) {
				return Promise.reject(result[1])
			} else if (result[0] === 0) {
				constellationName = result[1].constellation;
				var stars = result[1].stars;
				var sphereMaterial = new THREE.MeshBasicMaterial({
					color: 0xffffff
				});
				var spriteMaterial = new THREE.SpriteMaterial( { color: 0xffffff } );
				var circleGeometry = new THREE.CircleBufferGeometry( 2, 6 );
				oldSphere = null;
				stars.forEach(function(star) {
					var sphere = new THREE.Mesh( circleGeometry, sphereMaterial );
					
					sphere.rotateY(star.azm * (Math.PI / 180))
					sphere.rotateX(star.alt * (Math.PI / 180))
					sphere.translateZ(-100);
					var sprite = new THREE.Sprite( spriteMaterial );
					sprite.position.set(sphere.position.x, sphere.position.y, sphere.position.z)
					sprite.scale.set(2, 2, 1.0)
					starGroup.add( sprite );
					//Add to an array so lines can be drawn later
					constellationPositions.push(sphere.position);
					//Get the average vector to know where to point the observer
					averageX = averageX + sphere.position.x;
					averageY = averageY + sphere.position.y;
					averageZ = averageZ + sphere.position.z;
					//Remove the temp sphere from memory
					sphere.geometry.dispose();
					sphere.material.dispose();
					sphere = undefined;
				});
				scene.add(starGroup);
				averageX = averageX / stars.length;
				averageY = averageY / stars.length;
				averageZ = averageZ / stars.length;
				constLoaded = true;
				checkForLoading();
			} else if (result[0] === 2) {
				return Promise.reject('No content')
			}
		}).catch(err => console.log(err))
	
	
}

function lookAtConstellation() {
	position = new THREE.Vector3(averageX, averageY, averageZ);
	// backup original rotation
	var startRotation = new THREE.Euler().copy( camera.rotation );

	// final rotation (with lookAt)
	camera.lookAt( position );
	var endRotation = new THREE.Euler().copy( camera.rotation );

	// revert to original rotation
	camera.rotation.copy( startRotation );

	// Tween
	new TWEEN.Tween(camera.rotation).to({x: endRotation.x, y: endRotation.y, z: endRotation.z}, 2000).start()
}

function drawConstellation() {
	oldPos = null;
	for(var idx = 0; idx < constellationPositions.length; idx++) {
		var pos = constellationPositions[idx];
		if(idx !== 0) {
			var x1 = oldPos.x 
			var y1 = oldPos.y
			var z1 = oldPos.z
			var x2 = pos.x
			var y2 = pos.y
			var z2 = pos.z
		
			var originalDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
			var segment = originalDistance / 200
			
			var lineGeometry = new THREE.Geometry();
			var line = new THREE.Line( THREE.Vector3(x1, y1, z1), new THREE.LineBasicMaterial( {color: 0xffffff, linewidth: 1.5}) );
			starGroup.add(line);
			
			drawLine(segment, x1, x2, y1, y2, z1, z2, lineGeometry)
		}
		oldPos = pos
	}
}

function drawLine(segment, x1, x2, y1, y2, z1, z2) {
	lineTimeout = setTimeout(
	function() {
		if(newConstellation) {
			return;
		}
		var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
		var s = segment / distance;
		var x3 = x1 + s * (x2 - x1);
		var y3 = y1 + s * (y2 - y1);
		var z3 = z1 + s * (z2 - z1);
		//var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push(new THREE.Vector3(x1, y1, z1));
		lineGeometry.vertices.push(new THREE.Vector3(x3, y3, z3));
		//var line = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( {color: 0xffffff, linewidth: 1.5}) );
		if(distance > 0.01) {
			drawLine(segment, x3, x2, y3, y2, z3, z2)
		}
	}, 100);
}

function makeRequest(url) {
	let config = {
        method: "GET",
		headers: {"content-type": "application/json; charset=utf-8"}
    };
    return fetch(url, config)
        .then(response => {
            if (response.status === 204) {
                throw [2, 'No Content'];
            } else if (response.status > 399) {
                //There was a request failure. Return the response. Do not try to convert it to a JSON object as there is no guarantee that it is formatted as a json
                return (response.text()
                    .then(text => { return Promise.reject([1, text]) })
                )
            }
            return response
        })
        .then(response =>
            //Our request is successful. Convert it to JSON
            response.json().then(data => ({ data, response }))
        )
        .then(({ data, response }) => {
            return [0, data]
        })
        .catch(err => err);
}
