<template>
  <div class="singer" ref="singer">
    <list-view @select="selectSinger" :data="singers" ref="list"></list-view>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
import { mapMutations } from 'vuex'
import {playlistMixin} from 'common/js/mixin'

const HOT_NAME = '热门歌手'
const HOT_SINGER_LEN = 10

export default {
  mixins: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingerList()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    selectSinger (singer) { // 接收到点击后的singer实例
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      this.setSinger(singer) // vuex中的语法糖,使得singers与vuex中的SET_SINGER做映射
    },
    _getSingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = this._normalizeSinger(res.data.list)
          // console.log(this.singers)
        }
      })
    },
    _normalizeSinger (list) { // 将获取到的歌手数据进行格式化
      let map = { // 新的格式标准
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => { // 热门歌手数据
        if (index < HOT_SINGER_LEN) { // 将前10条数据作为热门数据并获得其数据
          map.hot.items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        }
        const key = item.Findex // 普通歌手及歌手首字母编号
        if (!map[key]) {
          map[key] = { // 变为如 "X [薛之谦, 图片链接]"
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          name: item.Fsinger_name,
          id: item.Fsinger_mid
        }))
      })
      // console.log(map)
      // 处理map从而得到有序列表
      let hot = []
      let ret = []
      for (let key in map) { // 按照a-z的顺序排序
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
