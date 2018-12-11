import * as easingFunctions from './easing'

/**
 * アニメーション関数
 *
 * @param {AnimationCallback} fn アニメーションフレーム毎に実行するコールバック
 * @param {Object} [options={}] オプション
 * @param {number} [options.begin=0] 開始位置
 * @param {number} [options.finish=1] 終了位置
 * @param {number} [options.duration=500] 全体時間
 * @param {string} [options.easing='easeInOutCubic'] Easing function
 */
export function animate (fn, options = {}) {
  const {
    begin = 0,
    finish = 1,
    duration = 500,
    easing = 'easeInOutCubic',
    onComplete
  } = options

  const change = finish - begin
  const easingFunction = easingFunctions[easing]
  let startTime

  function tick (timestamp) {
    const time = Math.min(duration, timestamp - startTime)
    const position = easingFunction(time, begin, change, duration)

    fn(position, time)

    if (time === duration) {
      onComplete && onComplete()
    } else {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(timestamp => {
    startTime = timestamp
    tick(timestamp)
  })
}

/**
 * @typedef {function} AnimationCallback
 * @param {number} position 現在位置
 * @param {number} time 現在時刻 (0 ~ duration)
 */
