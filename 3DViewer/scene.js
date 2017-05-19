
class Scene{

	constructor(data, width, height){
		this.width = width;
		this.height = height;

		this.objects = [];

		this.container;
	    this.camera;
	    this.controls;
	    this.scene;
	    this.renderer;
	    
	    this.initialFrame = 30000;
	    this.frame = this.initialFrame;
	    this.finalFrame = data.total;
	    this.bats = data;
	    this.cave = this.createCave(this.bats);

	    this.batScale = 10;
	    this.lastMilisec = new Date().getMilliseconds();
	    this.diff = 0;
	    this.frameRenderInterval = 1000/data.fps;
	}

	init() {
		this.container = document.createElement( 'div' );
		console.log(this.container)
		document.body.appendChild( this.container );
		this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 1, 10000 );//new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
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
		this.renderer.setSize(this.width, this.height);//( window.innerWidth, window.innerHeight );
		this.renderer.sortObjects = false;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.container.appendChild( this.renderer.domElement );
		var dragControls = new THREE.DragControls( this.objects, this.camera, this.renderer.domElement );
		dragControls.addEventListener( 'dragstart', function ( event ) { this.controls.enabled = false; }.bind(this) );
		dragControls.addEventListener( 'dragend', function ( event ) { this.controls.enabled = true; }.bind(this) );
		
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

  	createCave(data){
  		var aMin = 999999;
  		var aMax = -999999;

  		var averageZ = 0;

  		for(var i=0; i<data.bats.length; i++){
  			var z = 0;
			for(var k=0; k < data.bats[i].track.length; k++){
				z += data.bats[i].track[k].a;
			}
			z /= data.bats[i].track.length;

			averageZ += z;
  		}

  		averageZ /= data.bats.length;

  		for(var i=0; i<data.bats.length; i++){
  			var z = 0;
			for(var k=0; k < data.bats[i].track.length; k++){
				z += data.bats[i].track[k].a;
			}
			z /= data.bats[i].track.length;

			if(z > 4*averageZ)
				continue;

  			aMin = aMin < z ? aMin : z;
  			aMax = aMax > z ? aMax : z;
  		}

  		var cave = {xMin:0, xMax:data.width, yMin:0, yMax:data.height, zMin:aMin, zMax:aMax};
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

	drawBats(data, frame){
	    var light = new THREE.DirectionalLight( 0xffffff, 1 );
	    light.position.set( 1, 1, 1 ).normalize();
	    this.scene.add( light );
	    var geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
	    var labels = [];
	    for ( var i = 0; i < data.bats.length; i ++ ) {
			
			var tracks = data.bats[i].track;
			if(frame < tracks[0].f)
				break;

			//if this bat should not be renderer in
			//this frame continue to the next bat
			if(frame < tracks[0].f || frame > tracks[tracks.length-1].f)
				continue;

			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: i*0xffffff } ) );

			var z = 0;
			for(var k=0; k < tracks.length; k++){
				z += tracks[k].a;
			}
			z /= tracks.length;
			labels.push(data.bats[i].label);

			//find the track interval of the current frame
			for(var j = 0; j < tracks.length; j ++ ){
				
				object.position.x = tracks[j].x;
				object.position.y = tracks[j].y;
				object.position.z = z;//tracks[j].z;
				object.rotation.x = 0;
				object.rotation.y = 0;
				object.rotation.z = 0;
				object.scale.x = this.batScale;
				object.scale.y = this.batScale;
				object.scale.z = this.batScale;

				if((frame == tracks[j].f) || (j+1 < tracks.length && frame < tracks[j+1].f))
					break;
				else
				{
					var pathLine = new THREE.Geometry();
					pathLine.vertices.push(new THREE.Vector3( tracks[j].x, tracks[j].y, z));
					pathLine.vertices.push(new THREE.Vector3( tracks[j+1].x, tracks[j+1].y, z));
					var line = new THREE.Line(pathLine, new THREE.LineBasicMaterial( {color: 0x000000, linewidth: 1 } ));
					this.scene.add( line );
					this.objects.push(line);
				}
			}
			
			this.objects.push( object );
			this.scene.add( object );
	    }
	}

	
	onWindowResize() {
		//this.camera.aspect = window.innerWidth / window.innerHeight;
		//this.camera.updateProjectionMatrix();
		//this.renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	animate() {
		requestAnimationFrame( this.animate.bind(this) );
		this.render();
	}
	
	render() {
		var d = new Date();
    	var n = d.getMilliseconds();
		if(n < this.lastMilisec || (this.lastMilisec + this.frameRenderInterval)%1000 <= n){
			this.lastMilisec = n;
			this.frame = this.frame < this.finalFrame ? (this.frame + 1) : this.initialFrame;
			this.fillBatScene(this.bats, this.frame);
		}
		
		this.controls.update();
		this.renderer.render( this.scene, this.camera );
	}
}
