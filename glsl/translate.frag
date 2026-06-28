#ifdef GL_ES
precision mediump float;
#endif

// 005 平移

// 屏幕分辨率，由外部传入
uniform vec2 u_resolution;

/*
  圆形形状函数
   position: 归一化坐标 (0.0 ~ 1.0)
   radius: 圆的半径
   返回 0.0（圆外）或 1.0（圆内）
*/
float circleshape(vec2 position, float radius){
  return step(radius, length(position - vec2(0.5)));
}

void main(){
  // 将像素坐标归一化到 0.0 ~ 1.0
  vec2 coord = gl_FragCoord.xy / u_resolution;

  // 初始颜色（黑色）
  vec3 color = vec3(0.0);

  // 平移向量：向右移动 0.3
  vec2 translate = vec2(0.3, 0.0);

  // 应用平移（乘以 0.5 控制移动距离）
  coord += translate * 0.5;

  // 计算圆形并应用到颜色
  color += vec3(circleshape(coord, 0.3));

  // 输出最终颜色
  gl_FragColor = vec4(color, 1.0);
}

/*
  circleshape 函数说明

   签名：float circleshape(vec2 position, float radius)

   参数：
     position - 归一化坐标 (0.0 ~ 1.0)
     radius - 圆的半径

   返回值：
     0.0 - 圆外
     1.0 - 圆内

   算法：
     1. position - vec2(0.5) → 计算到中心的距离向量
     2. length(...) → 计算欧几里得距离
     3. step(radius, distance) → 判断是否在圆内

   本例调用：circleshape(coord, 0.3)
     - coord 经过平移后，圆心向右偏移 0.15
     - 半径 0.3 的白色圆形

   平移原理：
     translate = vec2(0.3, 0.0) → 定义平移方向和距离
     coord += translate * 0.5 → 将平移应用到坐标
     - 乘以 0.5 是为了控制移动幅度
     - 最终圆心从 (0.5, 0.5) 移动到 (0.65, 0.5)
*/
