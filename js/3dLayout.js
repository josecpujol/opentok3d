geometryArray = [];
var numParticipants = 0;
var width = 2.0;  // The one in makePlane
var videoAspectRatio = 4.0/3.0;
var radius = 1.0;
var totalArc = Math.PI ;

function addPublisher() {}

function removePublisher() {}

function addSubscriber() {
  numParticipants++;
  rebuildParticipants();
 }

function removeSubscriber() {
  numParticipants--;
  if (numParticipants < 0) numParticipants = 0;
  rebuildParticipants();
}

function rebuildParticipants() {

  // remove all pub and subs and leave the rest of geometry
  var pubsubs = "PUBSUBS";

  for (var i = geometryArray.length - 1; i >= 0; i--) {
    if (geometryArray[i].type === pubsubs)
      geometryArray.splice(i, 1);
  }

  var length = radius * Math.sqrt(2 - 2 * Math.cos(totalArc / numParticipants));
  for (var i = 0; i < numParticipants; i++) {
    var myObject = {};
    myObject.type = pubsubs;
    myObject.program = "TEXTURE";
    myObject.mode = gl.TRIANGLES;
    myObject.matrix = mat4.create();
    mat4.identity(myObject.matrix);
    mat4.rotate(myObject.matrix, (totalArc / numParticipants) / 2 - totalArc / 2, [0, 0, 1]);
    mat4.rotate(myObject.matrix, i * totalArc / numParticipants, [0, 0, 1]);
    mat4.translate(myObject.matrix, [radius, 0.0, 0.0]); // Same for all
  //  mat4.translate(myObject.matrix, [0, 0, (length / width) / 2]);  // Make it be at xy = 0
    mat4.rotate(myObject.matrix, -Math.PI / 2, [0, 1, 0]); // Original geometry is xy plane. Make it yz plane
    mat4.scale(myObject.matrix, [(length / width) / videoAspectRatio, length / width, 1.0]); // Adapt width to fit arc
    mat4.translate(myObject.matrix, [width / 2, 0, 0]);  // make it 
    myObject.geometry = g.geometryPlane;
    geometryArray.push(myObject);
  }
 // console.log("Length %d", geometryArray.length);
}
// webgl helpers
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
    throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}

function makePlane(ctx) {
  // vertex coords array
  var vertices = new Float32Array([1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0]);

  // normal array
  var normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

  // texCoord array
  var texCoords = new Float32Array([1, 1, 0, 1, 0, 0, 1, 0]);

  // index array
  var indices = new Uint8Array([0, 1, 2, 0, 2, 3]);

  var retval = {};

  retval.normalObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, normals, ctx.STATIC_DRAW);

  retval.texCoordObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.texCoordObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, texCoords, ctx.STATIC_DRAW);

  retval.vertexObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);

  retval.indexObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexObject);
  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);

  retval.numIndices = indices.length;

  return retval;
}

function makeFloor(ctx) {
  var object = makePlane(ctx);
  var colors = new Float32Array(
      [0.05, 0.30, 0.43, 0.05, 0.30, 0.43,
        0.35, 0.69, 0.83,0.35, 0.69, 0.83]);
        
  object.colorObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, object.colorObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, colors, ctx.STATIC_DRAW);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  return object;
}

function makeAxis(ctx) {
  // vertex coords array
  var vertices = new Float32Array(
      [0, 0, 0, 1, 0, 0,
        0, 0, 0, 0, 1, 0,
        0, 0, 0, 0, 0, 1]);

  // colors array
  var colors = new Float32Array(
      [1, 0, 0, 1, 0, 0,
        0, 1, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 1]);

  // index array
  var indices = new Uint8Array([0, 1, 2, 0, 2, 3]);

  var retval = {};


  retval.vertexObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
  
  retval.colorObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.colorObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, colors, ctx.STATIC_DRAW);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  return retval;
}
