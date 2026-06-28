#ifdef GL_ES
precision mediump float;
#endif

// 002 圆形

// 屏幕分辨率，由外部传入
uniform vec2 u_resolution;

/* 
  圆形形状函数
   position: 归一化坐标 (0.0 ~ 1.0)
   radius: 圆的半径
   返回 0.0（圆内）或 1.0（圆外） 
*/
float circleShape(vec2 position, float radius){
  return step(radius, length(position - vec2(0.5)));
}

void main(){
  // 将像素坐标归一化到 0.0 ~ 1.0
  vec2 position = gl_FragCoord.xy / u_resolution;

  // 初始颜色（黑色）
  vec3 color = vec3(0.0);

  // 计算圆形，半径为 0.3
  float circle = circleShape(position, 0.3);

  // 将圆形结果应用到颜色
  color = vec3(circle);

  // 输出最终颜色（白色背景，黑色圆形）
  gl_FragColor = vec4(color, 1.0);
}

/* 
  step 函数调用方式

   签名：step(float edge, float x)
          step(float edge, vec2 x)
          step(float edge, vec3 x)
          step(float edge, vec4 x)

   参数：
     edge - 阈值
     x    - 待比较的值（标量或向量）

   返回值：
     x < edge  → 0.0
     x >= edge → 1.0

   本例调用：step(radius, length(position - vec2(0.5)))
     - radius = 0.3（圆的半径）
     - length(...) = 当前像素到中心的距离
     - 距离 < 0.3 → 0.0（圆内），距离 >= 0.3 → 1.0（圆外） 
*/
