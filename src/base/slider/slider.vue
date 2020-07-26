<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :key="item" :class="{active:
      currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import { addClass } from 'common/js/dom'
export default {
  data () {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted () {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      if (this.autoPlay) {
        this._play()
      }
    }, 20)

    window.addEventListener('resize', () => { // 在刷新宽度(切换横竖屏幕)时 刷新slider
      if (!this.slider) { // slider 还未初始化
        return
      }
      this._setSliderWidth(true)
      this.slider.refresh()
    })
  },
  methods: {
    _setSliderWidth (isResize) {
      this.children = this.$refs.sliderGroup.children
      // console.log(this.children.length) // 5

      let width = 0
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        child.style.width = sliderWidth + 'px'
        width += sliderWidth
      }
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots () {
      this.dots = new Array(this.children.length)
      // console.log(this.dots.length - 2)
    },
    _initSlider () {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true, // 横向滚动
        scrollY: false, // 纵向滚动
        momentum: false, // 惯性
        snap: {
          loop: this.loop, // 循环播放
          threshold: 0.3,
          speed: 400
        },
        // snap: true,
        // snapLoop: this.loop, // 无缝
        // snapThreshold: 0.3,
        // snapSpeed: 400, // 以上皆为旧版本写法
        click: true // better-srcoll 与 fastclick 库中有冲突 不需要写
      })

      this.slider.on('scrollEnd', () => { // better-scroll 在滚动时触发的事件
        let pageIndex = this.slider.getCurrentPage().pageX
        // 此处在1.x版本中不需要
        // if (this.loop) {
        //   pageIndex -= 1
        // }
        this.currentPageIndex = pageIndex

        if (this.autoPlay) { // 重置定时器
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play () { // 图片轮播
      let pageIndex = this.currentPageIndex + 1
      if (pageIndex >= 5) {
        pageIndex = 0
      }
      this.timer = setTimeout(() => { // 设置定时器
        this.slider.goToPage(pageIndex, 0, 400)
      }, this.interval)
    },
    destroyed () { // 销毁定时器
      clearTimeout(this.timer)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.slider {
  min-height: 1px;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>
