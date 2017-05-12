
class Scene{

	constructor(data){
		this.objects = [];

		this.container;
	    this.stats;
	    this.camera;
	    this.controls;
	    this.scene;
	    this.renderer;
	    
	    this.frame = 0;
	    this.bats = data;
	    this.cave = this.createCave(this.bats);

	    this.batScale = 10;
	}

	init() {
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1000;
		this.controls = new THREE.TrackballControls( this.camera );
		this.controls.rotateSpeed = 5.0;
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
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setClearColor( 0xf0f0f0 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.sortObjects = false;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.container.appendChild( this.renderer.domElement );
		var dragControls = new THREE.DragControls( this.objects, this.camera, this.renderer.domElement );
		dragControls.addEventListener( 'dragstart', function ( event ) { this.controls.enabled = false; }.bind(this) );
		dragControls.addEventListener( 'dragend', function ( event ) { this.controls.enabled = true; }.bind(this) );
		var info = document.createElement( 'div' );
		info.style.position = 'absolute';
		info.style.top = '10px';
		info.style.width = '100%';
		info.style.textAlign = 'center';
		info.innerHTML = 'BatVis - 3D Flight Simulator';
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

  	createCave(bats){
  		var aMin = 999999;
  		var aMax = -999999;
  		

  		for(var i=0; i<bats.bats.length; i++){
  			var area = bats.bats[i].track[0].a;	
  			aMin = aMin < area ? aMin : area;
  			aMax = aMax > area ? aMax : area;
  		}

  		var cave = {xMin:0, xMax:bats.width, yMin:0, yMax:bats.height, zMin:aMin, zMax:aMax};
  		console.log(cave);
  		return cave;
  	}

  	fillBatScene(bats, frame){
  		this.objects = [];
  		this.scene = null;
	    this.scene = new THREE.Scene();
  		this.drawCave();
	    this.drawGrid();
	    this.drawBats(bats, frame);

	    var dragControls = new THREE.DragControls( this.objects, this.camera, this.renderer.domElement );
		dragControls.addEventListener( 'dragstart', function ( event ) { this.controls.enabled = false; }.bind(this) );
		dragControls.addEventListener( 'dragend', function ( event ) { this.controls.enabled = true; }.bind(this) );
	}

	drawCave(){
	    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
		var leftWall = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
		var rightWall = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
		//debugger;
		var scaleX = 5;
		var scaleY = this.cave.yMax-this.cave.yMin;
		var scaleZ = this.cave.zMax-this.cave.zMin;
		var maxScale = scaleX > scaleY ? scaleX : scaleY;
		maxScale = 10;//maxScale > scaleZ ? maxScale : scaleZ;

		leftWall.position.x = this.cave.xMin-scaleX/2-this.batScale/2;
		leftWall.position.y = this.cave.yMin + scaleY/2;
		leftWall.position.z = this.cave.zMin + scaleZ/2;
		leftWall.scale.x = scaleX;
		leftWall.scale.y = scaleY + this.batScale;
		leftWall.scale.z = scaleZ + this.batScale;

		rightWall.position.x = this.cave.xMax+scaleX/2+this.batScale/2;
		rightWall.position.y = this.cave.yMin + scaleY/2;
		rightWall.position.z = this.cave.zMin + scaleZ/2;
		rightWall.scale.x = scaleX;
		rightWall.scale.y = scaleY + this.batScale;
		rightWall.scale.z = scaleZ + this.batScale;

		this.scene.add( leftWall );
		this.scene.add( rightWall );

		this.objects.push( leftWall );
		this.objects.push( rightWall );
	}

	drawGrid(){
		//size of the grid cube
		var gridCubeSize = 200;
		//how many grid cubes we will plot in each axis
		var nCubes = 20;
		var y = this.cave.yMin;
		for(var i=-nCubes/2; i<(nCubes/2)+1; i++){
			//Horizontal
			var geometryH = new THREE.Geometry();
			geometryH.vertices.push(new THREE.Vector3( -gridCubeSize*nCubes/2,  y, i*gridCubeSize));
			geometryH.vertices.push(new THREE.Vector3( gridCubeSize*nCubes/2,  y, i*gridCubeSize));
			var lineH = new THREE.Line(geometryH, new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } ));
			this.scene.add( lineH );

			//Vertical
			var geometryV = new THREE.Geometry();
			geometryV.vertices.push(new THREE.Vector3( i*gridCubeSize,  y, -gridCubeSize*nCubes/2));
			geometryV.vertices.push(new THREE.Vector3( i*gridCubeSize, y, gridCubeSize*nCubes/2));
			var lineV = new THREE.Line(geometryV, new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } ));
			this.scene.add( lineV );
		}
	}

	drawBats(bats, frame){
	    var light = new THREE.DirectionalLight( 0xffffff, 1 );
	    light.position.set( 1, 1, 1 ).normalize();
	    this.scene.add( light );
	    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
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
				if(frame < tracks[j].f)
					break;
				else if((frame == tracks[j].f) || (j+1 < tracks.length && frame >= tracks[j].f && frame <= tracks[j+1].f)){

					object.position.x = tracks[j].x;
					object.position.y = tracks[j].y;
					object.position.z = z;//tracks[j].z;
					object.rotation.x = 0;
					object.rotation.y = 0;
					object.rotation.z = 0;
					object.scale.x = this.batScale;
					object.scale.y = this.batScale;
					object.scale.z = this.batScale;
					this.objects.push( object );
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
