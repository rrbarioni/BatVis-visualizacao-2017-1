
var objects = [];

class Scene{

	constructor(data){
		this.container;
	    this.stats;
	    this.camera;
	    this.controls;
	    this.scene;
	    this.renderer;
	    
	    this.frame = 0;
	    this.bats = data;
	}

	init() {
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1000;
		this.controls = new THREE.TrackballControls( this.camera );
		this.controls.rotateSpeed = 1.0;
		this.controls.zoomSpeed = 1.2;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = true;
		this.controls.dynamicDampingFactor = 0.3;
		this.scene = new THREE.Scene();
		this.scene.add( new THREE.AmbientLight( 0x505050 ) );
		var light = new THREE.SpotLight( 0xffffff, 1.5 );
		light.position.set( 0, 500, 2000 );
		light.castShadow = true;
		light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
		light.shadow.bias = - 0.00022;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
		this.scene.add( light );
		var geometry = new THREE.BoxGeometry( 40, 40, 40 );
		for ( var i = 0; i < 200; i ++ ) {
			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
			object.position.x = Math.random() * 1000 - 500;
			object.position.y = Math.random() * 600 - 300;
			object.position.z = Math.random() * 800 - 400;
			object.rotation.x = Math.random() * 2 * Math.PI;
			object.rotation.y = Math.random() * 2 * Math.PI;
			object.rotation.z = Math.random() * 2 * Math.PI;
			object.scale.x = Math.random() * 2 + 1;
			object.scale.y = Math.random() * 2 + 1;
			object.scale.z = Math.random() * 2 + 1;
			object.castShadow = true;
			object.receiveShadow = true;
			this.scene.add( object );
			objects.push( object );
		}
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setClearColor( 0xf0f0f0 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.sortObjects = false;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.container.appendChild( this.renderer.domElement );
		var dragControls = new THREE.DragControls( objects, this.camera, this.renderer.domElement );
		dragControls.addEventListener( 'dragstart', function ( event ) { this.controls.enabled = false; }.bind(this) );
		dragControls.addEventListener( 'dragend', function ( event ) { this.controls.enabled = true; }.bind(this) );
		var info = document.createElement( 'div' );
		info.style.position = 'absolute';
		info.style.top = '10px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - draggable cubes';
		this.container.appendChild( info );
		this.stats = new Stats();
		this.container.appendChild( this.stats.dom );
		//
		window.addEventListener( 'resize', this.onWindowResize, false );
	}

	fillScene(bats, frame){
		this.scene = null;
		this.scene = new THREE.Scene();
		var light = new THREE.DirectionalLight( 0xffffff, 1 );
		light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
		var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
		for ( var i = 0; i < 2000; i ++ ) {
			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
			object.position.x = Math.random() * 800 - 400;
			object.position.y = Math.random() * 800 - 400;
			object.position.z = Math.random() * 800 - 400;
			object.rotation.x = Math.random() * 2 * Math.PI;
			object.rotation.y = Math.random() * 2 * Math.PI;
			object.rotation.z = Math.random() * 2 * Math.PI;
			object.scale.x = Math.random() + 0.5;
			object.scale.y = Math.random() + 0.5;
			object.scale.z = Math.random() + 0.5;
			this.scene.add( object );
		}
  	}

  	fillBatScene(bats, frame){
	    drawBats(bats, frame);
	    
	}

	drawBats(bats, frame){
	    this.scene = null;
	    this.scene = new THREE.Scene();
	    var light = new THREE.DirectionalLight( 0xffffff, 1 );
	    light.position.set( 1, 1, 1 ).normalize();
	    this.scene.add( light );
	    var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
	    for ( var i = 0; i < bats.bats.length; i ++ ) {
			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: i*0xffffff } ) );

			var tracks = bats.bats[i].track;

			//if this bat should not be renderer in
			//this frame continue to the next bat
			if(frame < tracks[0].f || frame > tracks[tracks.length-1].f)
			continue;


			var z = 0;
			for(var k=0; k < tracks.length; k++){
				z += tracks[k].a;
			}

			z /= tracks.length;
			  
			//find the track interval of the current frame
			for(var j = 0; j < tracks.length; j ++ ){

				if(frame >= tracks[j].f && frame <= tracks[j+1].f){

					object.position.x = tracks[j].x;
					object.position.y = tracks[j].y;
					object.position.z = z;//tracks[j].z;
					object.rotation.x = 0;
					object.rotation.y = 0;
					object.rotation.z = 0;
					object.scale.x = 1;
					object.scale.y = 1;
					object.scale.z = 1;
					break;
				}
			}

			this.scene.add( object );
	    }
	}

	
	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
	//
	animate() {
		requestAnimationFrame( this.animate.bind(this) );
		this.render();
		this.stats.update();
	}
	
	render() {
		this.frame = this.frame < this.bats.total ? this.frame + 1 : 0;

		this.fillBatScene(this.bats, this.frame);
		this.controls.update();
		this.renderer.render( this.scene, this.camera );
	}
}
