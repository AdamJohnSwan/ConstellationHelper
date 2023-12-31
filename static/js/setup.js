
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
var controls = new THREE.PointerLockControls( camera );
var renderer = new THREE.WebGLRenderer();
var directionUI = document.getElementById('direction')
var userLat = 0;
var userLng = 0;
var timer = 0;
var starsLoaded = false;
var constLoaded = false;
var timerInterval = null;
init();
animate();

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update()
	renderer.render( scene, camera );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function updateDirection() {
	var vector = new THREE.Vector3( 0, 0, 0);     
	camera.getWorldDirection(vector);
	x = Math.ceil(vector.x * (180 / Math.PI));
	y = Math.ceil(vector.y * (180 / Math.PI));
	z = Math.ceil(vector.z * (180 / Math.PI));
	directionUI.innerHTML = 'X: ' + x + ' Y: ' + y + ' Z: ' + z;
}

function placeLandscape() {
	const geometry = new THREE.PlaneGeometry(200, 200);
	const material = new THREE.MeshBasicMaterial( {
		color: 0x0000ff,
	    opacity: 0.2,
	    transparent: true,
	});
	let plane = new THREE.Mesh( geometry, material );
	plane.position.y = -5;
	plane.rotateX(-90 * (Math.PI / 180));
	scene.add(plane);
}

function checkForLoading() {
	if(starsLoaded && constLoaded) {
		lookAtConstellation();
		setTimeout(function(){
			 drawConstellation();
		}, 3000);
		var loader = document.getElementsByClassName("loader-container")[0];
		loader.style.display = 'none';
		// Set focus to the input used to guess the name of the contellation
		document.getElementById("constellation-input").focus();
		//Start the timer
		var timerSpan = document.getElementById("timer").getElementsByTagName("span")[0];
		timerInterval = setInterval(function(){
			timer++;
			timerSpan.innerHTML = timer.toString();
		}, 1000);
	}
}

function init() {
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
	
	placeLandscape();
	placeStars();
	placeConstellation();

}

function checkAnswer() {
	var answer = document.getElementById("constellation-input").value;
	var constellationForm = document.getElementById("constellation-form-container");
	if(answer === constellationName) {
		//The answer is correct, flash green and load a new constellation
		constellationForm.className = "right-answer";
		scene.remove(starGroup);
		//Cleanup old star group
		var objects = starGroup.children;
		for(var i = 0; i < starGroup.children.length; i++) {
			starGroup.children[i].geometry.dispose();
			starGroup.children[i].material.dispose();
			starGroup.children[i] = undefined;
		}
		newConstellation = true;
		timer = 0;
		clearInterval(timerInterval);
		clearTimeout(lineTimeout);
		placeConstellation();

	} else {
		//Wrong answer, make the box flash red
		constellationForm.className = "wrong-answer";
	}
	
	setTimeout(function() {
		constellationForm.className = "";
	}, 1000);
}