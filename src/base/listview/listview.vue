<template>
  <scroll class="listview"
          :data="data" ref="listview"
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType">
    <ul>
      <li v-for="group in data" :key="group.value" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" :key="item.value" class="list-group-item">
            <img v-lazy="item.avatar" alt="无法加载" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
            :key="item.value" class="item"
            :data-index="index"
            :class="{'current' : currentIndex===index}"
        >
            {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHight = []
    this.probeType = 3
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1 // 5.9下
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY >= 0) {
        return null
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    selectItem (item) { // 派发出点击事件
      this.$emit('select', item)
    },
    onShortcutTouchStart (e) { // 寻找点击位置并找到其中index并跳转
      let anchorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove (e) { // 寻找滚动开始位置并计算鼠标拖动距离 进而跳转到某个位置
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta // index是一个字符串形式需要转义
      this._scrollTo(anchorIndex)
    },
    refresh () {
      this.$refs.listview.refresh()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    _scrollTo (index) { // 使用betterScroll的scrollToElement方法滚到到指定位置
      if (!index && index !== 0) { // 在热门上已经z下方的处理
        return
      }
      if (index < 0) { // 在热门上方就显示热门
        index = 0
      } else if (index > this.listHight - 2) { // 在z下方就显示z
        index = this.listHight - 2
      }
      this.scrollY = -this.listHight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 0代表是否需要一个滚动时间
    },
    _calculateHeight () { // 5.4-5.6/45min
      this.listHight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHight.push(height)
      }
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY (newY) {
      const listHight = this.listHight
      if (newY > 0) { // 在顶部滚动
        this.currentIndex = 0
        return
      }
      for (let i = 0; i < listHight.length - 1; i++) { // 在中间部分滚动
        let height1 = listHight[i]
        let height2 = listHight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // console.log(this.currentIndex)
          this.diff = height2 + newY
          return
        }
      }
      this.currentIndex = listHight.length - 2 // 在底部滚动
    },
    diff (newVal) { // 处理顶部区块细节部分
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  components: {
    Scroll
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
