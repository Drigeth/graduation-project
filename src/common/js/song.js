import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'

export default class Song {
  constructor ({id, mid, singer, name, album, duration, image, url}) {
    this.id = id // 歌曲id
    this.mid = mid // 图片链接相关
    this.singer = singer // 歌手名字(有些歌曲可能多个歌手)
    this.name = name // 歌曲名
    this.album = album // 所在歌单
    this.duration = duration // 歌曲长度
    this.image = image // 歌曲图片
    this.url = url // 歌曲真实请求路径
  }

  getLyric () {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

export function createSong (musicData) { // 将歌曲类进行实例化(工厂类)
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    // url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
    // url: `http://124.193.228.149/amobile.music.tc.qq.com/C400${musicData.songmid}.m4a?vkey=32322655031085E991AAB2B164028209DC8ED068E2BDE9242D73D46CFC5FA4CCA88C5E6E67CC4DDD4F4CD27D334F6C7364305D485FA2A037&guid=7981028948&uin=0&fromtag=66`
    url: `http://dl.stream.qqmusic.qq.com/C100${musicData.songmid}.mp3&fromtag=38`
  })
}

function filterSinger (singer) { // 原始数据中singer(歌手)是一个'类json数组',将其格式化
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
