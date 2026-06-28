#ifdef GL_ES
precision mediump float;
#endif

// 007旋转

// 屏幕分辨率，由外部传入
uniform vec2 u_resolution;

/*
  矩形形状函数
   position: 归一化坐标 (0.0 ~ 1.0)
   scale: 矩形的宽高（0.0 ~ 1.0）
   返回 0.0（矩形外）或 1.0（矩形内）
*/
float rectshape(vec2 position, vec2 scale){
  // 计算矩形左下角起点（从中心向外扩展）
  scale = vec2(0.5) - scale * 0.5;

  // 分别判断 x 和 y 轴：是否在矩形范围内
  vec2 shaper = vec2(step(scale.x, position.x), step(scale.y, position.y));
  shaper *= vec2(step(scale.x, 1.0 - position.x), step(scale.y, 1.0 - position.y));

  // x 和 y 都在范围内时返回 1.0，否则返回 0.0
  return shaper.x * shaper.y;
}

/*
  2D 旋转矩阵函数
   angle: 旋转角度（弧度）
   返回 2x2 旋转矩阵
*/
mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main(){
  // 将像素坐标归一化到 0.0 ~ 1.0
  vec2 coord = gl_FragCoord.xy / u_resolution;

  // 初始颜色（黑色）
  vec3 color = vec3(0.0);

  // 旋转变换（绕中心旋转）
  // 1. 将原点移到中心 (0.5, 0.5)
  coord -= vec2(0.5);

  // 2. 应用旋转矩阵（0.3 弧度 ≈ 17.2 度）
  coord = rotate(0.3) * coord;

  // 3. 将原点移回 (0, 0)
  coord += vec2(0.5);

  // 计算矩形并应用到颜色
  color += vec3(rectshape(coord, vec2(0.3, 0.3)));

  // 输出最终颜色
  gl_FragColor = vec4(color, 1.0);
}

/*
  旋转动画 - 使用 2D 旋转矩阵实现旋转变换

   rotate 函数：
     签名：mat2 rotate(float angle)
     - 创建 2x2 旋转矩阵
     - angle 为旋转角度（弧度制）

   旋转矩阵结构：
     | cos(θ)  -sin(θ) |
     | sin(θ)   cos(θ) |
     - 逆时针旋转 θ 角度
     - 本例 θ = 0.3 弧度 ≈ 17.2 度

   旋转中心：
     矩形默认绕原点 (0, 0) 旋转
     要绕中心 (0.5, 0.5) 旋转需要三步：
     1. coord -= vec2(0.5) → 移到原点
     2. rotate(0.3) * coord → 旋转
     3. coord += vec2(0.5) → 移回原位

   本例效果：
     - 0.3×0.3 的白色矩形
     - 绕屏幕中心逆时针旋转约 17.2 度
*/
