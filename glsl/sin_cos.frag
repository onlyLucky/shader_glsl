#ifdef GL_ES
precision mediump float;
#endif

// 006 正弦余弦

// 屏幕分辨率，由外部传入
uniform vec2 u_resolution;

// 时间（秒），由外部传入，持续递增
uniform float u_time;

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

  // 使用 sin 和 cos 生成随时间变化的平移向量
  // sin(u_time / 10.0) → x 方向缓慢振荡
  // cos(u_time) → y 方向正常速度振荡
  vec2 translate = vec2(sin(u_time / 10.0), cos(u_time));

  // 应用平移（乘以 0.5 控制移动幅度）
  coord += translate * 0.5;

  // 计算圆形并应用到颜色
  color = vec3(circleshape(coord, 0.3));

  // 输出最终颜色
  gl_FragColor = vec4(color, 1.0);
}

/*
  动画圆形 - 使用时间变量实现运动效果

   新增 uniform：
     u_time - 时间变量（秒），由渲染引擎持续传入

   平移向量：
     translate = vec2(sin(u_time / 10.0), cos(u_time))
     - sin(u_time / 10.0) → x 方向，周期 20*PI 秒（缓慢）
     - cos(u_time) → y 方向，周期 2*PI 秒（正常）
     - 两个方向组合形成椭圆运动轨迹

   运动效果：
     - 圆形沿椭圆轨迹持续运动
     - x 方向移动较慢（除以 10）
     - y 方向移动较快
     - 乘以 0.5 控制运动幅度

   时间除数的作用：
     - u_time / 10.0 → 降低 x 方向频率，运动更慢
     - u_time → 正常频率
     - 除数越大，该方向运动越慢
*/
