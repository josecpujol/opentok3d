
// Camera class
function Camera() {
  this.lookAtInit = {};
  this.lookAtInit.eye = vec3.create();
  this.lookAtInit.center = vec3.create();
  this.lookAtInit.up = vec3.create();

  this.lookAtEnd = {};
  this.lookAtEnd.eye = vec3.create();
  this.lookAtEnd.center = vec3.create();
  this.lookAtEnd.up = vec3.create();

  this.rot = mat4.create();
  this.timeInit = Date.now();
  this.timeEnd = Date.now();
}

Camera.prototype.setPosition = function(x, y, z) {
  vec3.set([x, y, z], this.lookAtEnd.eye);
  this.timeEnd = Date.now();
}


Camera.prototype.setLookAt = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz) {
  vec3.set([eyex, eyey, eyez], this.lookAtEnd.eye);
  vec3.set([centerx, centery, centerz], this.lookAtEnd.center);
  vec3.set([upx, upy, upz], this.lookAtEnd.up);
  this.timeEnd = Date.now();
}

Camera.prototype.setLookAtV = function(eye, center, up ) {
 this.setLookAt(eye[0], eye[1], eye[2], center[0], center[1], center[2], up[0], up[1], up[2])
}

function lookAtClone(inLookAt) {
  var out = {};
  out.eye = vec3.create(inLookAt.eye);
  out.center = vec3.create(inLookAt.center);
  out.up = vec3.create(inLookAt.up);
  return out;
}

Camera.prototype.setLookAtSmoothV = function(eye, center, up, timeMs ) {
  console.log("setLookAtSmoothV\n");
  // Get current pos and rotation
  lookAt = this.getLookAtV();

  // set origin and destination
  this.lookAtInit = lookAt;
  this.lookAtEnd.eye = eye;
  this.lookAtEnd.center = center;
  this.lookAtEnd.up = up;
  console.log("------ eye init: " + this.lookAtInit.eye[0] + " eye end: " + this.lookAtEnd.eye[0]);
  this.timeInit = Date.now();
  this.timeEnd = this.timeInit + timeMs;
}


function interpolateTwoPoints(a, b, param) {
  var out = vec3.create();
  var a_temp = vec3.create();
  var b_temp = vec3.create();
  vec3.scale(a, 1 - param, a_temp);
  vec3.scale(b, param, b_temp);
  vec3.add(a_temp, b_temp, out);
  return out;

}



Camera.prototype.getLookAtV = function() {
  var currentTime = Date.now();
  if (currentTime >= this.timeEnd) {
    var out = lookAtClone(this.lookAtEnd);
    return out;
  }

  // Need to interpolate
  // Convert current time into 0: init, 1: end
  var param = (currentTime - this.timeInit) / (this.timeEnd - this.timeInit);

  // interpolation: linear interpolation
  // We can interpolate center and up too, because we are calling setLookUp afterwards, that recomputes the correct up vector by cross product
  var out = {};
  out.eye = interpolateTwoPoints(this.lookAtInit.eye, this.lookAtEnd.eye, param);
  out.up = interpolateTwoPoints(this.lookAtInit.up, this.lookAtEnd.up, param);
  out.center = interpolateTwoPoints(this.lookAtInit.center, this.lookAtEnd.center, param);
  return out;
}



Camera.prototype.getExtrinsicMatrix = function() {
  var out = mat4.create();
  var lookAt = this.getLookAtV();
  mat4.lookAt(lookAt.eye, lookAt.center, lookAt.up, out);
  return out;
}
