import {playMode} from 'common/js/config'
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache'

const state = {
  singer: {},
  playing: false, // 是否在播放
  fullScreen: false, // 是否全屏
  playlist: [], // {当前列表}因为可以前后切换,所以在播放的时候是一个列表
  sequenceList: [], // {顺序列表}顺序播放时是一致的,当随机播放的时候是不一样的
  mode: playMode.sequence,
  currentIndex: -1, // 播放索引
  disc: {}, // 歌单对象
  topList: {}, // 排行
  searchHistory: loadSearch(), // 搜索历史
  playHistory: loadPlay(), // 播放历史
  favoriteList: loadFavorite() // 收藏历史
}

export default state
