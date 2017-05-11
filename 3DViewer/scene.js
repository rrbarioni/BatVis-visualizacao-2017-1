class Scene{

  constructor (data){    
    this.container;
    this.stats;
    this.camera;
    this.scene;
    this.raycaster;
    this.renderer;
    this.mouse = new THREE.Vector2();
    this.INTERSECTED;
    this.radius = 500;
    this.theta = 0;
    this.frustumSize = 1000;
    this.bats = data;
  }

  init() {

    this.container = document.createElement( 'div' );
    document.body.appendChild( this.container );
    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - interactive cubes';
    this.container.appendChild( info );
    var aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera( this.frustumSize * aspect / - 2, this.frustumSize * aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, 1, 1000 );
    this.fillScene();
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xf0f0f0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.sortObjects = false;
    this.container.appendChild(this.renderer.domElement);
    this.stats = new Stats();
    this.container.appendChild( this.stats.dom );
    document.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
    //
    window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
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

  fillScene2(bats, frame){

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
    var aspect = window.innerWidth / window.innerHeight;
    this.camera.left   = - this.frustumSize * aspect / 2;
    this.camera.right  =   this.frustumSize * aspect / 2;
    this.camera.top    =   this.frustumSize / 2;
    this.camera.bottom = - this.frustumSize / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onDocumentMouseMove( event ) {
    event.preventDefault();
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }
  //
  animate() {
    requestAnimationFrame( this.animate.bind(this) );
    this.render();
    this.stats.update();
  }
  render() {
    this.theta += 1;
    this.camera.position.x = 0;//this.radius * Math.sin( THREE.Math.degToRad( this.theta ) );
    this.camera.position.y = 0;//this.radius * Math.sin( THREE.Math.degToRad( this.theta ) );
    this.camera.position.z = this.radius;//this.radius * Math.cos( THREE.Math.degToRad( this.theta ) );
    this.camera.lookAt( this.scene.position );
    this.camera.updateMatrixWorld();
    // find intersections
    this.raycaster.setFromCamera( this.mouse, this.camera );
    var intersects = this.raycaster.intersectObjects( this.scene.children );
    if ( intersects.length > 0 ) {
      if ( this.INTERSECTED != intersects[ 0 ].object ) {
        if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
        this.INTERSECTED = intersects[ 0 ].object;
        this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
        this.INTERSECTED.material.emissive.setHex( 0xff0000 );
      }
    } else {
      if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
      this.INTERSECTED = null;
    }

    if(this.theta > this.bats.total)
      this.theta = 0;

    this.fillScene2(this.bats, this.theta);

    this.renderer.render( this.scene, this.camera );
  }

}
