
// Camera class
function Camera() {
  this.eye = vec3.create();
  this.center = vec3.create();
  this.up = vec3.create();
  this.rot = mat4.create();
  this.invalidateMatrix = true;
  mat4.identity(this.rot);
}

Camera.prototype.setPosition = function(x, y, z) {
  vec3.set([x, y, z], this.eye);
  this.invalidateMatrix = true;
}


Camera.prototype.setLookAt = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz) {
  vec3.set([eyex, eyey, eyez], this.eye);
  vec3.set([centerx, centery, centerz], this.center);
  vec3.set([upx, upy, upz], this.up);
  this.invalidateMatrix = true;
}

Camera.prototype.moveTo = function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz) {
}



Camera.prototype.getExtrinsicMatrix = function() {
  if (this.invalidateMatrix) {
    mat4.lookAt(this.eye, this.center, this.up, this.rot);
    this.invalidateMatrix = false;
  }
  var out = mat4.create();
  mat4.set(this.rot,out);
  return out;
}
