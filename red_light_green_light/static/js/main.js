import * as THREE from 'https://cdn.skypack.dev/three';

import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/PointerLockControls.js';

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
var videoPaused;

var sound,audioLoader;
var running;

window.onload = init();

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
   createLight();
   createFloor();
   configureFirstPersonCam();
   createGUI();
   createBoxVideo();

   var container = createContainer();
   scene.add(container);

   videoPaused = false;

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

   clock = new THREE.Clock();

   /////// SOUND ///////////////
   
   const listener = new THREE.AudioListener();
   camera.add( listener );
   
   camera.useQuaternion = true;

   const axesHelper = new THREE.AxesHelper( 5 );

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
   
   running = false;
   
   document.body.appendChild(renderer.domElement);
   requestAnimationFrame(animate);
}

function render()
{
   renderer.render(scene, camera);
   videoTexture.needsUpdate = true;

}

function animate()
{
   var delta = clock.getDelta();
   const time = performance.now();

   if (videoPaused == true) {
      var vid = document.getElementById("video");
      vid.play();
      videoPaused = false;
   }

   /// Controls/////
   if (camControls.isLocked == true) {
      
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

   if (allKeysUp() == false)
      running = false;

   
   document.getElementById("counter").innerHTML = 250 - parseInt(camera.position.z);

   render();

   // Here it causes that the animation function
   // is called at a regular interval.
   requestAnimationFrame(animate);
}


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

   var cubeGeometry = new THREE.BoxGeometry(300, 180, 1);
   var cubeMaterial = new THREE.MeshBasicMaterial({map:videoTexture});
   cubeGeometry.translate(0,100,300);

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
   
   scene.add(directionalLight);
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

}

function configureFirstPersonCam()
{
   prevTime = performance.now();

   camControls = new PointerLockControls(camera, renderer.domElement);

   const onKeyDown = function ( event ) {
		switch ( event.code ) {
         case 'ArrowUp':
			case 'KeyW':
				moveForward = true;
            running = true;
				break;

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
            running = true;
				break;

			case 'ArrowDown':
			case 'KeyS':
				moveBackward = true;
            running = true;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
            running = true;
				break;

			case 'Space':
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
            running = true;
				break;

		}
	};

	const onKeyUp = function ( event ) {

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

function allKeysUp()
{
   if (!moveForward && !moveLeft && !moveBackward && !moveRight)
      return false;
   return true;

}

function createGUI()
{
   var text2 = document.createElement('div');
   text2.setAttribute("id", "counter");
   text2.style.position = 'absolute';
   text2.style.color = 'white';
   text2.style.fontSize = 45 + 'px';
   text2.style.top = 1 + '%';
   text2.style.right = 5 + '%';
   document.body.appendChild(text2);
}

function getRandomInt(max)
{
   return Math.floor(Math.random() * max);
}

function gameLogic(time, videoStops)
{
   var vid = document.getElementById("video");

   var indxTime = videoStops.indexOf(parseInt(time / 600));
   //console.log("comparando: " + parseInt(time / 600));

   if (indxTime != -1) {
      videoPaused = true;
      vid.pause();
      lastIndex = indxTime;
   }
}

function createContainer()
{
   var geometry = new THREE.BoxGeometry(700, 700, 700, 10, 10, 10);
   var material = new THREE.MeshBasicMaterial({color: 0xfffff, wireframe: true});
   var cube = new THREE.Mesh(geometry, material);

   return cube;
}

function createCube()
{
   var geometry = new THREE.BoxGeometry(5, 5, 5, 5, 5, 5);
   var material = new THREE.MeshBasicMaterial({color: 0xfffff});
   var cube = new THREE.Mesh(geometry, material);
   cube.position.x = 0;
   cube.position.y = 2.5;
   cube.position.z = 0;

   return cube;
}
