#ifdef GL_ES
precision mediump float;
#endif

// 006 缩放

// 屏幕分辨率，由外部传入
uniform vec2 u_resolution;

// 时间（秒），由外部传入，持续递增
uniform float u_time;

/*
  2D 缩放矩阵函数
   scale: 缩放向量 (x, y 方向的缩放因子)
   返回 2x2 缩放矩阵
*/
mat2 scale(vec2 scale){
  return mat2(scale.x, 0.0, 0.0, scale.y);
}

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

  // 应用缩放变换：圆形随时间脉动
  // sin(u_time) + 2.0 → 值在 1.0 ~ 3.0 之间振荡
  coord = scale(vec2(sin(u_time) + 2.0)) * coord;

  // 计算圆形并应用到颜色
  color += vec3(circleshape(coord, 0.3));

  // 输出最终颜色
  gl_FragColor = vec4(color, 1.0);
}

/*
  缩放动画 - 使用 2D 矩阵实现脉动效果

   scale 函数：
     签名：mat2 scale(vec2 scale)
     - 创建 2x2 缩放矩阵
     - 对角线元素为缩放因子，非对角线为 0
     - mat2(sx, 0, 0, sy) → x 方向缩放 sx 倍，y 方向缩放 sy 倍

   缩放矩阵结构：
     | sx  0 |
     | 0   sy |
     - 乘以坐标向量 → (x*sx, y*sy)

   动画参数：
     sin(u_time) + 2.0
     - sin(u_time) 范围 [-1, 1]
     - 加 2.0 后范围 [1, 3]
     - 圆形在 1 倍到 3 倍之间脉动

   本例效果：
     - 圆形大小随时间周期性变化
     - 最小时 1 倍（正常大小）
     - 最大时 3 倍（放大 3 倍）
     - 脉动周期 = 2*PI 秒 ≈ 6.28 秒
*/
