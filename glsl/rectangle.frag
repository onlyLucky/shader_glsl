#ifdef GL_ES
precision mediump float;
#endif

// 003矩形着色器

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

void main(){
  // 将像素坐标归一化到 0.0 ~ 1.0
  vec2 position = gl_FragCoord.xy / u_resolution;

  // 初始颜色（黑色）
  vec3 color = vec3(0.0);

  // 计算矩形，宽高各 0.3
  float rectangle = rectshape(position, vec2(0.3, 0.3));

  // 将矩形结果应用到颜色
  color = vec3(rectangle);

  // 输出最终颜色
  gl_FragColor = vec4(color, 1.0);
}

/*
  rectshape 函数逻辑总结

   核心思路：用 step 函数判断像素是否在矩形的四条边内侧

   步骤：
     1. scale = vec2(0.5) - scale * 0.5
        - 将 scale 转换为左下角起点坐标
        - 例：scale(0.3, 0.3) → 起点(0.35, 0.35)，终点(0.65, 0.65)

     2. step(scale, position) → 判断是否在左边/下边的右侧
        step(scale, 1.0 - position) → 判断是否在右边/上边的左侧

     3. 两个结果相乘 → 同时满足四个边界条件才返回 1.0

   本例效果：屏幕中央显示一个 0.3×0.3 的白色矩形

   vec2 * vec2 的两种用法：

     1. shaper *= vec2(...)
        - 逐分量相乘：x*x, y*y
        - 作用：合并左右边界判断 和 上下边界判断
        - shaper.x = 左边界 * 右边界（x 轴方向同时满足）
        - shaper.y = 下边界 * 上边界（y 轴方向同时满足）

     2. shaper.x * shaper.y
        - 两个分量相乘，得到标量 float
        - 作用：x 轴和 y 轴同时满足才返回 1.0
        - 等价于逻辑 AND：在矩形内 → 1.0，否则 → 0.0
*/
