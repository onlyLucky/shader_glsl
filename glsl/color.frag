#ifdef GL_ES
precision mediump float;
#endif

// 001 颜色

void main(){
  vec3 color = vec3(0.3,0.5 ,0.7);
  gl_FragColor = vec4(color,1.0);
}
