import * as THREE from '/js/three.js/build/three.module.js';

import { OrbitControls } from '/js/three.js/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from '/js/three.js/examples/jsm/controls/PointerLockControls.js';
import { OBJLoader } from '/js/three.js/examples/jsm/loaders/OBJLoader.js';

var camera, scene, renderer, controls, camControls, clock;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var prevTime;

var videoTexture;

var sound,audioLoader;
var running;

function remap(a, b, c, d, t) {
   return (t - a) / (b - a) * (d - c) + c;
}


function init()
{   
   scene = new THREE.Scene();
   camera = new THREE.PerspectiveCamera(45,
      window.innerWidth / window.innerHeight,
      0.1, 1000
   );

   camera.position.x = 0;
   camera.position.y = 3;
   camera.position.z = -250;
   camera.lookAt(0, 0, 0);

   renderer = new THREE.WebGLRenderer({antialias: true});
   renderer.setClearColor(0x000000, 1.0);
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.shadowMap.enabled = true;
   
   ///////////////////////////////
   console.log(camera.rotation.z);  
   createLight();
   createFloor();
   createWalls();
   configureFirstPersonCam();
   insertCar();

   const blocker = document.getElementById('blocker');
   const instructions = document.getElementById('instructions');

   instructions.addEventListener('click', function () {
      camControls.lock();
   } );

   camControls.addEventListener('lock', function () {
      instructions.style.display = 'none';
      blocker.style.display = 'none';
   } );

   camControls.addEventListener('unlock', function() {
      blocker.style.display = 'block';
      instructions.style.display = '';
   } );

   
   //controls = new OrbitControls(camera, renderer.domElement);

   clock = new THREE.Clock();
   //////////////////////////////
   /////// SOUND ///////////////
   
   const listener = new THREE.AudioListener();
   camera.add( listener );

   // create a global audio source
   sound = new THREE.Audio( listener );

   // load a sound and set it as the Audio object's buffer
   audioLoader = new THREE.AudioLoader();
   audioLoader.load( 'sound/manBreathing.wav', function( buffer ) {
	   sound.setBuffer( buffer );
	   sound.setLoop( true );
	   sound.setVolume( 0.2);
	   sound.play();
   });
   


   /////////////////////////////
   running = false;
   /////////////////////////////
   
   
   document.body.appendChild(renderer.domElement);
   requestAnimationFrame(animate);
}

function render()
{
   renderer.render(scene, camera);
   //videoTexture.needsUpdate = true;

}

function animate()
{
   var delta = clock.getDelta();
   const time = performance.now();
   
   
   /// Controls/////
   
   if (camControls.isLocked === true) {
      
      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 18.0 * delta;
      velocity.z -= velocity.z * 18.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.normalize();

      if (moveForward || moveBackward)
         velocity.z -= direction.z * 400.0 * delta
      if (moveLeft || moveRight)
         velocity.x -= direction.x * 400.0 * delta;
      
      camControls.moveRight(- velocity.x * delta);
      camControls.moveForward(- velocity.z * delta);
      camControls.getObject().position.y += (velocity.y * delta);

      if (camControls.getObject().position.y < 3) {
         velocity.y = 0;
         camControls.getObject().position.y = 3;

         canJump = true;
      }
   }

   prevTime = time;

   if (running == true) {
      var newRotCamera = remap(-1,1, -3.22886, -3.05433,Math.sin(time * 0.007));
      camera.rotation.z = newRotCamera;
   } else {
      camera.rotation.z = -3.14159;
   }

   /////////////////

   //scene.getObjectByName('cube').rotation.x += 0.02;
   //var xPosDLight = scene.getObjectByName('dlight').position.x;
   //var xNewPos = remap(-1, 1, 0, 50, Math.sin(time * 0.0005));
   //scene.getObjectByName('dlight').position.x = xNewPos;
   //scene.getObjectByName('dlight').target.position.set(0,0,0);
  

   render();

   // Here it causes that the animation function
   // is called at a regular interval.
   requestAnimationFrame(animate);
}

window.onload = init();

function createBoxVideo()
{  
   var video = document.getElementById('video');
   videoTexture = new THREE.VideoTexture(video);
   videoTexture.minFiler = THREE.LinearFilter;
   videoTexture.magFilter = THREE.LinearFileter;
   videoTexture.format = THREE.RGBFormat;
   videoTexture.generateMipmaps = false;

   var startButton = document.getElementById('startButton');
   startButton.addEventListener('click', function() {    
      video.load();
      video.play();
   }, false);

   var cubeGeometry = new THREE.BoxGeometry(9, 5, 2);
   var cubeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});

   var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
   cube.name = 'cube';
   scene.add(cube);
}

function createLight()
{
   
   var light = new THREE.AmbientLight(0xffffff, 0.5);
   scene.add(light);


   var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
   directionalLight.name = "dlight";
   
   directionalLight.position.y = 100;
   directionalLight.position.x = 50;
   directionalLight.position.z = 500;
   
   directionalLight.castShadow = true;
   
   //const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
   //scene.add( helper );

   scene.add(directionalLight);
   /*
   
   var spotLight = new THREE.SpotLight(0xffffff);
   spotLight.position.set(5, 10, 0);
   spotLight.castShadow = true;
   const helper = new THREE.SpotLightHelper(spotLight, 5);
   scene.add(helper);
   scene.add(spotLight);

   */
   
}

function createFloor()
{
   const textureLoader = new THREE.TextureLoader();
   const floorColorMap = textureLoader.load("texture/floorColorMap.png");
   const floorDisplacementMap = textureLoader.load("texture/floorDisplacementMap.png");
   const floorNormalMap = textureLoader.load("texture/floorNormalMap.png");
   //const floorRoughnessMap = textureLoader.load("texture/floorRoughnessMap.png");
   const floorAmbientMap = textureLoader.load("texture/floorAmbientMap.png");

   floorColorMap.wrapS = floorColorMap.wrapT = THREE.RepeatWrapping;
   floorColorMap.offset.set(0, 0);
   floorColorMap.repeat.set(12, 12);

   floorDisplacementMap.wrapS = floorDisplacementMap.wrapT = THREE.RepeatWrapping;
   floorDisplacementMap.offset.set(0, 0);
   floorDisplacementMap.repeat.set(1, 1);

   floorNormalMap.wrapS = floorNormalMap.wrapT = THREE.RepeatWrapping;
   floorNormalMap.offset.set(0, 0);
   floorNormalMap.repeat.set(1, 1);

   floorAmbientMap.wrapS = floorAmbientMap.wrapT = THREE.RepeatWrapping;
   floorAmbientMap.offset.set(0, 0);
   floorAmbientMap.repeat.set(1, 1);

   var floorGeometry = new THREE.PlaneGeometry(500, 500, 10, 10);
   var floorMaterial = new THREE.MeshPhongMaterial(
      {
         map: floorColorMap,
         displacementMap: floorDisplacementMap,
         displacementScale: 0.5,
         normalMap: floorNormalMap,
         aoMap: floorAmbientMap
      }
   );

   var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

   floorMesh.receiveShadow = true;
   floorMesh.castShadow = true;

   floorMesh.rotation.x -= Math.PI / 2;
   scene.add(floorMesh);

   /*var ballGeometry = new THREE.SphereGeometry(0.8);
   var ballMaterial = new THREE.MeshPhongMaterial({color:0xffffff});
   var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);

   ballMesh.receiveShadow = true;
   ballMesh.castShadow = true;

   //ballMesh.position.y = 1.5;
   ballMesh.position.y = 0.9;
   scene.add(ballMesh);

   var cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
   var cubeMaterial = new THREE.MeshPhongMaterial({color:0xffffff});

   var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
   cube.receiveShadow = true;
   cube.castShadow = true;

   cube.position.x = 3;
   cube.position.z = 2;
   cube.position.y = 1.6;

   cube.name = 'cube';

   scene.add(cube);*/
}

function createWalls()
{
   for (let i = 0; i < 4; i++) {
      let wallGeometry = new THREE.PlaneGeometry(500, 50, 10, 10);
      let wallMaterial = new THREE.MeshStandardMaterial(
         {
            side: THREE.DoubleSide,
            //color:0xffffff,
            opacity: 0,
            transparent: true
         }
      );

      let wall = new THREE.Mesh(wallGeometry, wallMaterial);

      if (i == 0)
         wall.position.set(0, 25, 250);
      if (i == 1)
         wall.position.set(0, 25, -250);
      if (i == 2) {
         wall.rotation.y -= Math.PI / 2; 
         wall.position.set(250, 25, 0);
      }
      if (i == 3) {
         wall.rotation.y -= Math.PI / 2;
         wall.position.set(-250, 25, 0);
      }
      
      scene.add(wall);
   }
}

function configureFirstPersonCam()
{
   prevTime = performance.now();

   camControls = new PointerLockControls(camera, renderer.domElement);

   const onKeyDown = function ( event ) {
      running = true;
		switch ( event.code ) {
         case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				break;

			case 'Space':
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;

		}
	};

	const onKeyUp = function ( event ) {
      running = false;

		switch ( event.code ) {

			case 'ArrowUp':
			case 'KeyW':
				moveForward = false;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );
   scene.add(camControls.getObject() );
}

function insertCar()
{
   const loader = new OBJLoader();

   // load a resource
   loader.load(
      // resource URL
	   'model/car/OBJ.obj',
	   // called when resource is loaded
	   function ( object ) {
         object.scale.set(0.07, 0.07, 0.07);
         //const textureLoader = new THREE.TGALoader();
         //const texture = textureLoader.load("model/car/Textures/falloff_Falloff.tga");

         //texture.wrapS = THREE.RepeatWrapping;
         //texture.wrapT = THREE.RepeatWrapping;
         //object.material = new THREE.MeshStandardtMaterial(
         //   {
         //      map: texture,
         //   }
         //);
		   scene.add( object );
	   },
	   // called when loading is in progresses
	   function ( xhr ) {
		   console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	   },
	   // called when loading has errors
	   function ( error ) {

		   console.log( 'An error happened' );
	   }
   );
}