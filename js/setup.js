
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var controls = new THREE.PointerLockControls( camera );
var renderer = new THREE.WebGLRenderer();
var directionUI = document.getElementById('direction')
init();
animate();

function animate() {
	requestAnimationFrame( animate );
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


function placeSpace() {
	
}

function placeLandscape() {
	var geometry = new THREE.PlaneGeometry(200, 200);
	var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.y = -5;
	plane.rotateX(-90 * (Math.PI / 180));
	scene.add(plane);
}

function init() {
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );

	placeLandscape();
	placeConstellation();
	placeStars();

}