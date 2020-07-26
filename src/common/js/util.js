function getRandomInt (min, max) { // 生成在min和max之间的随机数
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) { // 将当前列表中元素打乱
  let _arr = arr.slice()
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = _arr[i]
    _arr[i] = _arr[j]
    _arr[j] = t
  }
  return _arr
}

// 对func做节流：调用func时,会将timer归零,使得func不会被在delay内多次调用 10-10/12.33
export function debounce (func, delay) { 
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
