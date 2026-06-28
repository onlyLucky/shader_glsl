#ifdef GL_ES
precision mediump float;
#endif

// 004 多边形

// 圆周率常量
const float PI = 3.1415926535;

// 屏幕分辨率，由外部传入
uniform vec2 u_resolution;

/*
  多边形形状函数
   position: 归一化坐标 (0.0 ~ 1.0)
   radius: 多边形的大小（内切圆半径）
   sides: 多边形的边数（3=三角形, 4=正方形, 5=五边形...）
   返回 0.0（多边形外）或 1.0（多边形内）
*/
float polygonshape(vec2 position, float radius, float sides){
  // 将坐标从 [0, 1] 范围转换到 [-1, 1]，中心点变为 (0, 0)
  position = position * 2.0 - 1.0;

  // 计算当前像素相对于中心的角度（-PI 到 PI）
  float angle = atan(position.x, position.y);

  // 计算每个多边形切片的角度（例如六边形：2*PI / 6 = 60度）
  float slice = PI * 2.0 / sides;

  // 判断点是否在多边形内部：
  // 1. floor(0.5 + angle / slice) 找到当前角度所在的切片索引
  // 2. 乘以 slice 再减去 angle 得到距离切片中心的角度偏移
  // 3. cos(...) * length(position) 计算该方向上的投影距离
  // 4. step(radius, distance) 判断是否在半径内
  return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

void main(){
  // 将像素坐标归一化到 0.0 ~ 1.0
  vec2 position = gl_FragCoord.xy / u_resolution;

  // 初始颜色（黑色）
  vec3 color = vec3(0.0);

  // 计算六边形，半径 0.6
  float polygon = polygonshape(position, 0.6, 6.0);

  // 将多边形结果应用到颜色
  color = vec3(polygon);

  // 输出最终颜色
  gl_FragColor = vec4(color, 1.0);
}

/*
  polygonshape 函数逻辑总结

   核心思路：将多边形分解为多个扇形切片，判断点是否在某个切片的半径内

   坐标转换：
     position = position * 2.0 - 1.0
     - 输入 [0, 1] → 输出 [-1, 1]
     - 中心点从 (0.5, 0.5) 变为 (0, 0)

   角度计算：
     atan(x, y) → 返回角度值（-PI 到 PI）
     - 相比 atan(y, x)，参数顺序颠倒是为了让 0 度朝上

   切片角度：
     slice = 2 * PI / sides
     - 六边形：60度（PI/3）
     - 正方形：90度（PI/2）
     - 三角形：120度（2*PI/3）

   核心算法：
     cos(floor(0.5 + angle / slice) * slice - angle) * length(position)
     - floor(0.5 + angle / slice) → 找到最近的切片索引
     - 乘以 slice → 得到切片中心角度
     - 减去 angle → 得到与切片中心的偏移
     - cos(偏移) * 半径 → 计算该方向上的内切圆半径
     - step(radius, distance) → 最终判断

   本例效果：屏幕中央显示一个半径 0.6 的白色六边形
*/
