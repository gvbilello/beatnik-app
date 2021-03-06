// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require three.min.js
//= require OrbitControls.js
//= require Detector.js
//= require jquery
//= require jquery_ujs
//= require mediaelement-and-player.min.js
//= require three.min.js
//= require_tree .
$( document ).ready(function() {

      var bg = document.body.style;

      var ctx = new AudioContext();
      var audio = document.getElementById('audio-player');
      var audioSrc = ctx.createMediaElementSource(audio);
      var analyser = ctx.createAnalyser();
      audioSrc.connect(analyser);
      audioSrc.connect(ctx.destination);
      var frequencyData = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(frequencyData)

      // three.js globals
      var objectsArray = []
      var particlesArray = []
      var camera, scene, renderer;
      var geometry, controls, material, mesh;

      function visualSetup() {
        //getting correct sizing based on the browser window (more adaptable)
        var W = window.innerWidth, H = window.innerHeight;

        renderer = new THREE.WebGLRenderer();

        renderer.setSize( W, H );

        $("div#pseudo-body").append( renderer.domElement ); //the renderer's dom friendly copy
        //gets added to the DOM so we can actually see things happen.
        // camera setup ========================================
        camera = new THREE.PerspectiveCamera( 50, W/H, 1, 10000 );
        camera.position.z = 100;
        // =====================================================
        scene = new THREE.Scene();

        geometry = new THREE.CubeGeometry( 25, 25, 25 );

        // this is all we need to be able to click and move camera
        controls = new THREE.OrbitControls( camera );
        // =======================================================

        for ( var i = 0; i < 255; i ++ ) {
          var radius   = i,
              segments = 64,
              geometry = new THREE.CircleGeometry( radius, segments );
              material = new THREE.LineBasicMaterial({color: "rgb(255, " + i + ", 0)"}),
              circle = new THREE.Line(geometry, material);
        scene.add(circle);
        geometry.vertices.shift();
        scene.add(circle);
        objectsArray.push( circle )
        }

                ///////////    lighting     /////////////

        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL( 0.6, 0.75, 0.5 );
        hemiLight.groundColor.setHSL( 0.095, 0.5, 0.5 );
        hemiLight.position.set( 0, 500, 0 );
        scene.add( hemiLight );

        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.position.set( -1, 0.75, 1 );
        dirLight.position.multiplyScalar( 50);
        dirLight.name = "dirlight";
        // dirLight.shadowCameraVisible = true;

        scene.add( dirLight );

        dirLight.castShadow = true;
        dirLight.shadowMapWidth = dirLight.shadowMapHeight = 1024*2;

        var d = 300;

        dirLight.shadowCameraLeft = -d;
        dirLight.shadowCameraRight = d;
        dirLight.shadowCameraTop = d;
        dirLight.shadowCameraBottom = -d;

        dirLight.shadowCameraFar = 3500;
        dirLight.shadowBias = -0.0001;
        dirLight.shadowDarkness = 0.35;

                ///////////background particles/////////////

        backGroundies = new THREE.Geometry();
        for ( i = 0; i < 5000; i ++ ) {
          var vertex = new THREE.Vector3();
          vertex.x = 1000 * Math.random() - 500;
          vertex.y = 1000 * Math.random() - 500;
          vertex.z = 1000 * Math.random() - 500;
          backGroundies.vertices.push( vertex );
        }
        material = new THREE.ParticleBasicMaterial( { size: 1, sizeAttenuation: false, transparent: true } );
        material.color.setHex( 0x99FFFF );
        particles = new THREE.ParticleSystem( backGroundies, material );
        particles.sortParticles = true;
        scene.add( particles );
        particlesArray.push( particles );

        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          renderer.setSize(window.innerWidth, window.innerHeight);
        }
       }


      function draw() {
        requestAnimationFrame( draw );

        controls.update();

        try {
          analyser.getByteFrequencyData(frequencyData)
        }
        catch(err) {
          frequencyData = [0]
        }


        freqSum = frequencyData.reduce(function(a, b) {
          return a + b;
        }, 0);

        // console.log(frequencyData);

        for ( var i = 0; i < 255; i ++ ) {
          bg.background = ('#000000')
           camera.position.z = 150;
           objectsArray[i].position.x = (frequencyData[i * 2] / 64)
           objectsArray[i].position.y = (frequencyData[i * 2] / 64)
           objectsArray[i].position.z = (frequencyData[i * 2] / 64)
        }

        camera.position.x = Math.cos( Date.now() * 0.0001 ) * 100;
        camera.position.y = Math.sin( Date.now() * 0.0001 ) * 100;

        renderer.render( scene, camera );

      }

      visualSetup();
      draw();

});
