//index.js
//获取应用实例
const util = require('../../utils/util.js');
const AlbumData = require('album.js')
const AlbumDetailData = require('albumDetail.js')
let backgroundAudioManager = wx.getBackgroundAudioManager();
const app = getApp();
let {
  globalData
} = app;

const weekCof = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
}
const albumData = AlbumData.albumData;
const albumDetailData = AlbumDetailData.albumDetail;
Page({
  data: {
    dateNum: '01_12_Sunday',
    albumImg: '../image/cover.jpg',
    songName: 'The Moon Song The Moon Song The Moon Song',
    singerName: 'Scarlett Johansson',
    desc: '人生里几乎没有奇迹，你得到和遇见的，无非是些你可以得到和遇见的东西',
    editAction: 0,
    clockAction: 0,
    editvalue:'',
    currentAblum: {},
    playState: false,
    isLoaded: 0,
    msgConfig:{},
    minutes: [{
      value: 0,
      desc: '专辑播放完成后关闭'
    }, {
      value: 10,
      desc: '10分钟'
    }, {
      value: 20,
      desc: '20分钟'
    }, {
      value: 30,
      desc: '30分钟'
    }, {
      value: 40,
      desc: '40分钟'
    }, {
      value: 50,
      desc: '50分钟'
    }, {
      value: 60,
      desc: '60分钟'
    }],
    isLoading:0,
    minute: 0,
    currentTime: '',
    songList: [],
    countTime: '00:00',
    // minutes: [{1:5,2:10,3:30,4:'歌曲播放结束时'}5, 10, 30,]
  },
  // changeIndex(currentDate) {
  //   var week = currentDate.getDay();
  //   var month = (currentDate.getMonth() + 1);
  //   var day = currentDate.getDate();
  //   var dataNum = (month > 9 ? month : '0' + month) + "." + (day > 9 ? day : '0' + day) + " " + weekCof[currentDate.getDay()];
  //   var albumInfo = albumData[currentDate.getDate() % 15] || albumData[1];
  //   var urlConfig = albumDetailData[albumInfo.albumId];
  //   for (var key in urlConfig) {
  //     if (!albumInfo['url']) {
  //       albumInfo['url'] = [urlConfig[key]];
  //     } else {
  //       albumInfo['url'].push(urlConfig[key]);
  //     }
  //   }
  //   // console.log(albumInfo);
  //   this.setData({
  //     dateNum: dataNum,
  //     currentAblum: albumInfo,
  //     albumImg: util.getPic('album', albumInfo.albumId, 300),
  //     songName: albumInfo.albumName,
  //     singerName: albumInfo.singerName,
  //     desc: albumInfo.desc,
  //     currentTime:currentDate.getTime()
  //   })
  //   this.updatePlayState();
  // },
  changeIndex(e) {
    // console.log(e.detail.current);
    // console.log(this.data.songList[e.detail.current]);
    let currentData = this.data.songList[e.detail.current]
    this.setData({
      currentAblum: currentData.albumInfo
    })

    globalData['songInfo'] = currentData;

    this.updateMsg(currentData.dateKey);

    this.updatePlayState();
  },
  updateMsg(key){
    // console.log(key,this.data.msgConfig)
    if (key) {
      // console.log(key,this.data.msgConfig[key])
      this.setData({
        editvalue: this.data.msgConfig[key] || ''
      })
    }
  },
  getData(currentDate) {
    var week = currentDate.getDay();
    var month = (currentDate.getMonth() + 1);
    var day = currentDate.getDate();
    var dataNum = "";
    // 对 今天 today 和 昨天 yesterday 特殊展示 数据重复
    if (new Date().getTime() - new Date(currentDate).getTime() < 86400000){
      dataNum = (month > 9 ? month : '0' + month) + "." + (day > 9 ? day : '0' + day) + " Today";
    } else if (new Date().getTime() - new Date(currentDate).getTime() < 86400000 *2){
      dataNum = (month > 9 ? month : '0' + month) + "." + (day > 9 ? day : '0' + day) + " Yesterday";
    }else{
      dataNum = (month > 9 ? month : '0' + month) + "." + (day > 9 ? day : '0' + day) + " " + weekCof[currentDate.getDay()];
    }
    var dateKey = currentDate.getFullYear() +'-'+ (month > 9 ? month : '0' + month) + "-" + (day > 9 ? day : '0' + day);
    var albumInfo = albumData[currentDate.getDate() % 15] || albumData[1];
    var urlConfig = albumDetailData[albumInfo.albumId];
    for (var key in urlConfig) {
      if (!albumInfo['url']) {
        albumInfo['url'] = [urlConfig[key]];
      } else {
        albumInfo['url'].push(urlConfig[key]);
      }
    }

    return {
      dateNum: dataNum,
      dateKey: dateKey,
      albumInfo: albumInfo,
      albumImg: util.getPic('album', albumInfo.albumId, 300),
      songName: albumInfo.albumName,
      singerName: albumInfo.singerName,
      desc: albumInfo.desc,
      currentTime: currentDate.getTime()
    }
  },
  getUserInfo(e) {
    app.globalData.userData = e.detail || {};
    // console.log(e.detail);
    // wx.navigateTo({
    //   url: '../share/index'
    // });
    util.musicLogin(this.getMessage);
    this.setData({
      isLoaded: 1
    })
  },
  getMessage: function() {
    // debugger;

    util.ajaxU({
      url: 'https://ut.y.qq.com/cgi-bin/musicu.fcg',
      method: "GET",
      data: {
        getMessage: {
          "module": "wxSleepRadio",
          "method": "GetUserRemark",
          "param": {
            "music_uin": globalData.music_uin,
            "music_key": globalData.music_key,
          }
        }
      },
      success: (res) => {
        res = res.data;
        // console.log(res);
        // 格式化日志 
        let msgTmp = {};
        res.getMessage.data && res.getMessage.data.list && res.getMessage.data.list.forEach(function(item){
          msgTmp[item.date] = item.remarkmsg;
        }) 

        this.setData({
          msgConfig:msgTmp
        });
        // console.log(23455, globalData["songInfo"]);
        if (globalData["songInfo"]){
          this.updateMsg(globalData["songInfo"].dateKey);
        }
        
      },
      fail: function(err) {

      }
    });
  },
  setMessage: function(val) {
    
    if (!this.data.editvalue){
      return;
    }
      util.ajaxU({
        url: 'https://ut.y.qq.com/cgi-bin/musicu.fcg',
        method: "POST",
        data: {
          setMessage: {
            "module": "wxSleepRadio",
            "method": "UpdateUserRemark",
            "param": {
              "music_uin": globalData.music_uin,
              "music_key": globalData.music_key,
              date: globalData['songInfo'].dateKey,
              remarkmsg: this.data.editvalue
            }
          }
        },
        success: (res) => {
          res = res.data
          if (res && res.setMessage && res.setMessage.code == 0){
            let msgTmp = this.data.msgConfig;
            msgTmp[globalData['songInfo'].dateKey] = this.data.editvalue
            this.setData({
              msgConfig: msgTmp
            })
          }
        },
        fail: function(err) {
          cb && cb();
        }
      });
  },
  initData() {

    let result = [];
    let currentTime = new Date().getTime()
    for (let i = 20; i >= 0; i--) {
      let currentdate = new Date(currentTime + 1000 * 60 * 60 * 24 * i*(-1))
      let data = this.getData(currentdate);
      if (i == 0) {
        globalData['songInfo'] = data;
        this.setData({
          currentAblum: data.albumInfo
        })
        this.updateMsg(data.dateKey);
        // this.changeIndex({detail:{current:10}});
      }
      result.push(data);
    }

    result.reverse();
    this.setData({
      songList: result
    });

   
  },
  goShare(e) {
    // console.log(345);
    wx.navigateTo({
      url: '../share/index'
    });
  },
  onLoad() {
    // this.changeIndex(new Date());
    // let self = this;
    // setTimeout(function(){

    //   self.setData({
    //     isLoaded: 1
    //   })
    // },1000)
    
    this.initData();
    util.initPlayer(backgroundAudioManager, this.updatePlayState);
    // util.musicLogin(this.getMessage);
    // this.getMessage();
  },
  //事件处理函数
  bindPickerChange(e) {
    const val = e.detail.value
    // console.log(this.data.minutes[val].value * 60);
    this.setData({
      minute: this.data.minutes[val].value * 60
    })
  },

  touchstart: function(e) {
    let self = this;
    self.touchY = e.touches[0].clientY || 0;
    self.moveY = self.touchY;
  },
  touchmove: function(e) {
    let self = this;
    self.moveY = e.touches[0].clientY || 0;
  },
  defaultTouch: function(e) {
    // if (e.currentTarget.dataset.type == 1){
    //   this.setData({
    //     clockAction: this.data.clockAction ? 0 : 1
    //   })
    // }

  },
  formatTime(time) {
    let fMinute = parseInt(time / 60, 0);
    let fSecond = time % 60;
    return (fMinute < 10 ? '0' + fMinute : fMinute) + ':' + (fSecond < 10 ? '0' + fSecond : fSecond)
  },

  count_down: function() {
    let self = this;
    self.timeOuter = setTimeout(function() {
      self.data.minute--;
      self.setData({
        minute: self.data.minute,
        countTime: self.formatTime(self.data.minute)
      })
      if (self.data.minute > 0) {
        self.count_down();
      } else {
        util.pause();
      }
    }, 1000);
  },

  touchend: function(e) {
    let self = this;

    let touchDuration = self.moveY - self.touchY
    if (Math.abs(touchDuration) > 30) {
      // 往后切是负数
      if (touchDuration < 0) {
        this.changeIndex(new Date(this.data.currentTime + 1000 * 60 * 60 * 24));
      } else {
        this.changeIndex(new Date(this.data.currentTime - 1000 * 60 * 60 * 24));
      }
    }
  },

  go_edit(e) {
    // app.globalData.userData = e.detail || {};
    this.setData({
      editAction: this.data.editAction ? 0 : 1
    })
  },
  set_clock_confirm() {
    // console.log(this.data.minute);
    // 获取播放状态 如果是播放状态的才有效
    let paused = backgroundAudioManager.paused;
    this.timeOuter && clearTimeout(this.timeOuter);
    if (paused === false) {
      if (this.data.minute) {
        util.tip('设置成功，电台将在' + (this.data.minute/60) + '分钟后停止播放', '', 3000);

        this.count_down()
      }

    } else {
      this.setData({
        minute: 0
      })
    }

    this.setData({
      clockAction: this.data.clockAction ? 0 : 1
    })


  },
  bindTextAreaInput(e){
    // console.log(e.detail.value)
    this.setData({
      editvalue: e.detail.value,
    })
  },

  set_edit_confirm(){
    // console.log(this.data.editvalue);
    // if(this){

    // }
    this.setMessage();
    this.go_edit();
  },
  set_clock() {
    if (backgroundAudioManager.paused != false){
      util.tip("当有歌曲在播放时才能设置哦");
      return;
    }
    this.setData({
      clockAction: this.data.clockAction ? 0 : 1
    })
  },
  updatePlayState: function() {
    let paused = backgroundAudioManager.paused;
    this.setData({
      isLoading:0
    })
    
    if (paused === false) {
      let src = backgroundAudioManager.src;
      let mid = wx.getStorageSync('curplayingmid');
      if (this.data.currentAblum.albumId == mid) {
        this.setData({
          playState: 1
        })
      } else {
        this.setData({
          playState: 0
        })
      }
    } else {
      this.setData({
        playState: 0
      });
    }
  },
  playsong: function() {
    let mid = wx.getStorageSync('curplayingmid');
    if (this.data.playState == 1 && this.data.currentAblum.albumId == mid) {
      // 暂停
      util.pause();
      return;
    }

    this.setData({
      isLoading:1,
    });

    if (this.data.currentAblum.albumId == mid) {
      // 续播
      util.play(this.data.currentAblum);
      return;
    }



    util.play(this.data.currentAblum);

  },
  focus_input(e) {

  },
  close() {
    this.setData({
      clockAction: 0,
      editAction: 0
    })
  },
  share() {

  }
})