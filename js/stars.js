function placeStars(scene) {
	var spriteMaterial = new THREE.SpriteMaterial( { color: 0xffffff } );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(100, 100, 1);
	//sprite.position.set(0, 0, 90);
	scene.add( sprite );
}