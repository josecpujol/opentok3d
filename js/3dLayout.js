geometryArray = [];

var width = 2.0;  // The one in makePlane
var videoAspectRatio = 4.0/3.0;
var radius = 1.0;
var totalArc = Math.PI ;
var numParticipantsX = 3;  // We will be stacking up
var clientType = "CLIENT";


function addClient(id, myVideoElement) {


  var myObject = {};
  myObject.type = clientType;
  // myObject.matrix = this will be filled in rearrangelayout
  myObject.geometry = g.geometryPlane;
  myObject.id = id;
  myObject.draw = function(gl) {
    var currentProgram;
    var geometry = this.geometry;
    currentProgram = g.programTexture;
    gl.useProgram(currentProgram);
    gl.uniform1f(currentProgram.frameNumUniform, frame_num);

    mat4.multiply(mvMatrix, this.matrix);
    setMatrixUniforms(gl, currentProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vertexObject);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, geometry.texCoordObject);
    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myVideoElement);
    gl.uniform1i(currentProgram.samplerUniform, 0);

    // matrix for plane will be set in rearrangeLayout

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexObject);
    gl.drawElements(gl.TRIANGLES, geometry.numIndices, gl.UNSIGNED_BYTE, 0);
  };
  geometryArray.push(myObject);

  rearrangeLayout();
}

function removeClient(id) {

  // Remove guy with that id
  for (var i = geometryArray.length - 1; i >= 0; i--) {
    if (geometryArray[i].id == id)
      geometryArray.splice(i, 1);
  }

  rearrangeLayout();
}

function rearrangeLayout() {

  var posClient = 0;
  // rearrange layout
  for (var i = 0; i < geometryArray.length; i++) {
    if (geometryArray[i].type === clientType) {
      geometryArray[i].matrix = matrixForLayout(posClient % numParticipantsX, Math.floor(posClient / numParticipantsX));
      posClient++;
    }
  }
}


// Same orientation as regular XY axis: origin in left bottom corner
function matrixForLayout(x, y) {
  var length = radius * Math.sqrt(2 - 2 * Math.cos(totalArc / numParticipantsX));
  var matrix = mat4.create();
  mat4.identity(matrix);
  // Y coordinate
  mat4.translate(matrix, [0, 0, y * 1.05 * length  / videoAspectRatio]);

  // X coordinate
  mat4.rotate(matrix, (totalArc / numParticipantsX) / 2 - totalArc / 2, [0, 0, 1]);
  mat4.rotate(matrix, x * totalArc / numParticipantsX, [0, 0, 1]);
  mat4.translate(matrix, [radius, 0.0, 0.0]); // Same for all
  //  mat4.translate(myObject.matrix, [0, 0, (length / width) / 2]);  // Make it be at xy = 0
  mat4.rotate(matrix, -Math.PI / 2, [0, 1, 0]); // Original geometry is xy plane. Make it yz plane
  mat4.scale(matrix, [(length / width) / videoAspectRatio, length / width, 1.0]); // Adapt width to fit arc
  mat4.translate(matrix, [width / 2, 0, 0]);
  return matrix;
}


// Gets the camera position based on the number of clients
function getCameraExtrinsics() {
  // We need to know how many guys there are
    var numClients = 0;
  // rearrange layout
  for (var i = 0; i < geometryArray.length; i++) {
    if (geometryArray[i].type === clientType) {
      numClients++;
    }
  }

  // It depends on the numParticipantsX and totalArc
  var width = radius * Math.sqrt(2 - 2 * Math.cos(totalArc / numParticipantsX));
  var height = width / videoAspectRatio;

  var obj = {};
  if (numClients == 0) {
    numClients = 1;
  }
  var z = (Math.floor((numClients - 1) / numParticipantsX) + 1) * height;
  var xc, yc;  // center
  var xe, ye;  // eye
  var factor = 2.0;
  if (numClients < numParticipantsX) {
    var angle =  numClients * Math.PI / (numParticipantsX*2) - Math.PI / 2;
    xc = radius * Math.cos(angle);
    yc = radius * Math.sin(angle);
    xe = -xc * factor * numClients / numParticipantsX;
    ye = -yc * factor * numClients / numParticipantsX;
  } else {
    xc = radius;
    yc = 0;
    xe = -factor * radius - Math.floor((numClients - 1)/numParticipantsX)/3;
    ye = 0;
  }
  obj.eye = vec3.create([xe, ye, z]);
  obj.center = vec3.create([xc, yc , z/2]);
  obj.up = vec3.create([0, 0, 1]);

  return obj;
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
  var texCoords = new Float32Array([1,0, 1, 1, 0, 1, 0, 0]);

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

function makeCircle(ctx, radius, segments, colorCenter, colorBorder) {

  // vertex coords array: center(0) + segments
  var vertices = new Float32Array((segments + 1) * 3);
  vertices[0] = vertices[1] = vertices[2] = 0.0;
  for (var i = 0; i < segments; i++) {
    var angle = i * 2 * Math.PI / segments;
    vertices[3 + i*3 + 0] = radius * Math.cos(angle);
    vertices[3 + i*3 + 1] = radius * Math.sin(angle);
    vertices[3 + i*3 + 2] = 0.0;
  }

  var colors = new Float32Array((segments + 1) * 3);
  for (var i = 0; i < 3; i++) {
    colors[i] = colorCenter[i];
  }
  for (var i = 0; i < segments; i++) {
    colors[3 + i * 3 + 0] = colorBorder[0];
    colors[3 + i * 3 + 1] = colorBorder[1];
    colors[3 + i * 3 + 2] = colorBorder[2];
  }


  // index array: 0, 1, 2,   0, 2, 3 ... 0, segment, 1
  var indices = new Uint8Array(segments * 3);
  for (var i = 0; i < segments; i++) {
    indices[i * 3 + 0] = 0;
    indices[i * 3 + 1] = i + 1;
    indices[i * 3 + 2] = i + 2;
  }
  indices[3 * segments - 1] = 1;


  var retval = {};

  retval.vertexObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);

  retval.colorObject = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.colorObject);
  ctx.bufferData(ctx.ARRAY_BUFFER, colors, ctx.STATIC_DRAW);
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

function makeFloor1(ctx) {
  var object = makeCircle(ctx, 10, 20,  [0.05, 0.30, 0.43], [ 0.35, 0.69, 0.83]);
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
