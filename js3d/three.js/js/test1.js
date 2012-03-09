// set the scene size
var WIDTH = 400,
HEIGHT = 300;

// set some camera attributes
var VIEW_ANGLE = 45,
ASPECT = WIDTH / HEIGHT,
NEAR = 0.1,
FAR = 10000;

function init(width, height, view_angle, near, far) {
    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    
    var camera = new THREE.PerspectiveCamera(view_angle, width / height , near , far); 
    
    var scene = new THREE.Scene();
    
    scene.add(camera); 
    
    camera.position.z = 300;
    
    renderer.setSize (width, height); 
    
    $('#container').append(renderer.domElement); 
    
    // setting up the sphere material... 
    var sphereMaterial = new THREE.MeshLambertMaterial(
	{
	    color: 0xCC0000
	});
    
    var radius = 50, segments = 16, rings = 16;
    
    // set up the sphere vars
    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(radius
							 , segments
							 , rings)
				, sphereMaterial);
    scene.add(sphere); 
    
    // create a point light
    var pointLight =
	new THREE.PointLight(0xFFFFFF);
    
    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    
    // add to the scene
    scene.add(pointLight);
    renderer.render(scene, camera); 
}

function run ( ) {
    init(400, 300, 45, 0.1, 10000); 
}