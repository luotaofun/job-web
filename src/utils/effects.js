import confetti from 'canvas-confetti';

/**
 * @description 触发一次从视口中心发射的烟花效果。
 * 使用 canvas-confetti 库实现。
 */
export const launchFireworks = () => {
  console.log('launchFireworks: 函数被调用，准备从视口中心发射烟花');

  // 定义中心发射源
  const origin = { x: 0.5, y: 0.55 }; // x:0.5 水平中心, y:0.55 垂直稍微偏下

  console.log('launchFireworks: 使用发射源:', origin);

  // --- 发射第一束烟花 ---
  console.log('launchFireworks: 准备发射第一束烟花...');
  confetti({
    particleCount: 500, // 粒子数量
    spread: 1000,         // 散开角度
    origin: origin,     // 使用中心坐标
    angle: 270,         // 向上发射
    startVelocity: 40,  // 初始速度
    gravity: 0.9,       // 重力影响
    drift: 0,           // 无漂移
    ticks: 200,         // 持续时间
    colors: ['#FFD700', '#FF6347', '#FFFFFF', '#ADD8E6', '#f77fbe', '#aaffaa'], // 烟花颜色
    shapes: ['star', 'circle'], // 混合形状
    scalar: 0.9         // 粒子大小
  });

  // --- 延迟发射第二束烟花 ---
  console.log('launchFireworks: 准备延迟发射第二束烟花...');
  setTimeout(() => {
    confetti({
      particleCount: 500,
      spread: 1000,
      origin: origin,
      angle: 270,
      startVelocity: 30,
      gravity: 0.8,
      drift: 0,
      ticks: 150,
      colors: ['#FF4500', '#FFFF00', '#FFFAFA', '#90ee90'], // 调整颜色
      shapes: ['circle'],
      scalar: 0.7
    });
    console.log('launchFireworks: 第二束烟花发射完毕');
  }, 150); // 延迟 150 毫秒

  console.log('launchFireworks: 第一束烟花发射指令已发送');
};

// 未来可以添加更多效果函数到这里，比如下雪效果、点击特效等
// export const showSnowEffect = () => { ... };