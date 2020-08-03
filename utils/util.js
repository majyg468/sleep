
const appId = 'wx4ac0db645a0f04b0';
let app = getApp();
let { globalData } = app;
let systemInfo;
let networkType;

let playIndex = 0;
let playUrlList = [];
let currentSongInfo = {};

function _getACSRFToken(key) {
  let skey = wx.getStorageSync(key);
  let hash = 5381;
  if (skey) {
    for (let i = 0, len = skey.length; i < len; ++i) {
      hash += (hash << 5) + skey.charCodeAt(i);
    }
  }
  return hash & 0x7fffffff;
};

/**
 * 获取小程序音乐登录态music_key、music_uin和openid
 */
function musicLogin(callback) {
  let self = this;
  // console.log(3455);
  if (globalData.curCode) {
    // debugger;
    let _login = (userData, needUpdateUserInfo) => {
      // debugger;
      // let data = {
      //   code: globalData.curCode,
      //   encryptData: userData.encryptedData,
      //   iv: userData.iv,
      //   signature: userData.signature,
      //   rawData: userData.rawData,
      //   appid: appId
      // };
      // // console.log("hoho");

      // let opt = {
      //   url: 'https://ct.y.qq.com/base/fcgi-bin/mina_wx_login.fcg',
      //   _startTime: new Date().valueOf(),
      //   method: 'post',
      //   data: data,
      //   success: (res) => {
      //     // console.log(res);
      //     if (res && res.data && res.data.code == 0) {
      //       globalData.music_uin = res.data.music_uin;
      //       globalData.music_key = res.data.music_key;
      //       globalData.openid = res.data.openid;
      //       globalData.g_tk = _getACSRFToken(res.data.music_key);
      //       typeof callback == 'function' && callback();
      //     } else {
      //       tip('用户信息获取失败1', 'none', 4000);
      //     }
      //   },
      //   fail: () => {
      //     tip('用户信息获取失败2', 'none', 4000);
      //   }
      // }

      // request(opt);
      ajaxU({
        url: 'https://ud.y.qq.com/cgi-bin/musicu.fcg',
        method: "GET",
        data: {
          getUserInfo: {
            "module": "wxSleepRadio",
            "method": "WxLogin",
            "param": {
              "code": globalData.curCode
            }
          }
        },
        success: (res) => {
          res = res.data
          console.log(res.getUserInfo);
          if (res && res.getUserInfo && res.getUserInfo.data && res.getUserInfo.code == 0) {
            let datatmp = res.getUserInfo.data
            globalData.music_uin = datatmp.music_uin;
            globalData.music_key = datatmp.music_key;
            // globalData.openid = datatmp.openid;
            // globalData.g_tk = _getACSRFToken(datatmp.music_key);
            typeof callback == 'function' && callback();
          } else {
            tip('用户信息获取失败1', 'none', 4000);
          }
        },
        fail: function (err) {
          tip('用户信息获取失败2', 'none', 4000);
        }
      });
      globalData.curCode = false; // code只能用一次
      login(); // 拉取下次的code
    };

    let userData = globalData.userData;
    // console.log(userData)
    if (userData) {
      _login(userData, 0);
    } else {
      tip('用户信息获取失败3', 'none', 4000);
    }
  } else {
    login(function(){
      musicLogin(callback);
    });
  }
}

/** 
 * @method login
 * @desc 获取微信登录，缓存下code
 * @param  {Function}
 */
function login(cb) {
  wx.login({
    success: function(res) {
      let code = res.code; //用户code
      // console.log(code);
      globalData.curCode = code;
      cb && cb();
    }
  });
}

function ajaxU(opt) {
  if (!opt.data) {
    return;
  }

  if (!opt.data.comm) {
    opt.data.comm = {
      'qq': globalData.music_uin,
      'authst': globalData.music_key
    };
  }

  if (opt.method == 'GET') {
    opt.data = {
      data: JSON.stringify(opt.data)
    };
  }

  request(opt);
}

function ajax(opt) {
  let data = {
    music_uin: globalData.music_uin || 0,
    uin: globalData.music_uin || 0,
    music_key: globalData.music_key || 0,
    wxopenid: globalData.openid || 0,
    g_tk: globalData.g_tk || 0
  };

  opt._startTime = new Date().valueOf();
  opt.data = Object.assign(data, opt.data);
  request(opt);
}

function request(opt) {
  let time = 1;
  let code, area = '';
  let data = opt.data;
  opt.totalStartTime = Date.now();

  function _request() {
    opt.requestStartTime = Date.now();
    wx.request({
      url: opt.url,
      data: data,
      method: opt.method || "GET",
      success: function(res) {
        opt.endTime = Date.now();
        // debugger;
        if (res.statusCode == 200) {
          if (res.data && res.data.code == 0 || typeof res.data == "string") {
            opt.needretry = 0;
            typeof opt.success == "function" && opt.success(res);
          } else {
            opt.needretry = 1;
          }
        } else {
          opt.needretry = 1;
        }
      },
      fail: function(res) {
        opt.endTime = Date.now();
        opt.needretry = 1;
      },
      complete: function(res) {
        if (res.data) {
          if (typeof res.data == 'string') {
            let str = res.data.split('code":')[1];
            code = str && parseInt(str.split(',')[0]);
          } else {
            code = res.data.code;
          }
        } else {
          code = res.statusCode;
        }

        if (area == 'sz' || area == 'sh') {
          opt['code_' + area] = code;
          opt['time_' + area] = opt.endTime - opt.requestStartTime;
        }

        opt['code'] = code;
        opt['time'] = opt.endTime - opt.requestStartTime;


        if (opt.needretry) {
          if (time == 1) {
            if (opt.url.indexOf('c.y.qq.com') != -1) {
              opt.url = opt.url.replace('c.y.qq.com', 'szc.y.qq.com'); //优先使用深圳
              time += 1;
              area = 'sz';
              _request();
            }
          } else if (time == 2) {
            if (opt.url.indexOf('szc.y.qq.com') != -1) {
              opt.url = opt.url.replace('szc.y.qq.com', 'shc.y.qq.com'); //使用上海
              time += 1
              area = 'sh'
              _request();
            }
          } else {
            typeof opt.fail == "function" && opt.fail(res);
            return;
          }
        } else {
        }
      }
    });
  }
  _request();

}


/**
 * @method getPic
 * @desc 获取专辑,歌手图片
 * @param {string} type 图片类型: album或singer
 * @param {string} mid  字符串mid 或者 数字id  注意:优先使用mid, 数字id是要废弃的
 * @param {string} size  图片尺寸 默认:68  可选:68,90,150,300,500  注意: 部分尺寸图片可能不存在 ,尤其是数字id拼接的
 * @return 图片地址
 */
function getPic(type, mid, size) {
  let url = 'https://y.gtimg.cn/mediastyle/music_v11/extra/default_300x300.jpg?max_age=31536000';
  if (typeof mid == 'string' && mid.length >= 14) { //字符串mid 走photo_new新逻辑
    type = (type == 'album' ? 'T002' : (type == 'singer' ? 'T001' : type));
    url = `https://y.gtimg.cn/music/photo_new/${type}R${size || 68}x${size || 68}M000${mid}.jpg?max_age=2592000`;
  } else if (mid > 0) { //数字id
    url = `https://y.gtimg.cn/music/photo/${type}_${size || 68}/${mid % 100}/${size || 68}_${type}pic_${mid}_0.jpg?max_age=2592000`;
  }
  return url;
};



/**
 * 获取系统信息
 */
function getSystemInfo(cb) {
  if (systemInfo) {
    return cb && cb(systemInfo);
  }
  wx.getSystemInfo({
    success: (res) => {
      if (res) {
        cb && cb(res);
        systemInfo = res;
      }
    }
  })
}

function getNetworkType(cb) {
  if (networkType) {
    return cb && cb(networkType);
  }
  wx.getNetworkType({
    success: (res) => {
      networkType = res.networkType;
      cb && cb(networkType);
    }
  })
}




function tip(title, icon, time) {
  wx.showToast({
    title: title,
    icon: icon || 'none',
    duration: time || 1000
  })
}




let curPlayerManager;

function initPlayer(backgroundAudioManager, updatePlayState) {
  let self = this;
  if (backgroundAudioManager && updatePlayState) {
    backgroundAudioManager.onPause(() => {
      updatePlayState();
    });

    backgroundAudioManager.onEnded(() => {
      // 结束的时候要轮播
      console.log(23455);
      debugger;

      playIndex++;
      if (!playUrlList[playIndex]){
        playIndex = 0;
      }
      currentSongInfo.index = playIndex;
      // this.src = playUrlList[playIndex];
      self.play(currentSongInfo)
      updatePlayState();
    });

    backgroundAudioManager.onError(() => {
      updatePlayState();
    });

    backgroundAudioManager.onPlay(() => {
      updatePlayState();
    });

    backgroundAudioManager.onStop(() => {
      updatePlayState();
    });
    curPlayerManager = backgroundAudioManager;
  }
}

function play(songinfo) {
  if (!curPlayerManager) {
    curPlayerManager = wx.getBackgroundAudioManager();
  }

  if (!songinfo) {
    curPlayerManager.play();
  } else {
    currentSongInfo = songinfo;

    curPlayerManager.title = songinfo.albumName || '';
    curPlayerManager.singer = songinfo.singerName || ''
    curPlayerManager.coverImgUrl = songinfo.albumImg;
    playUrlList = songinfo.url || [];
    playIndex = songinfo.index || 0;
    // console.log(playUrlList);
    curPlayerManager.src = playUrlList[playIndex];
    
    wx.setStorageSync('curplayingmid', songinfo.albumId);
  }


}

function pause() {
  if (!curPlayerManager) {
    curPlayerManager = wx.getBackgroundAudioManager();
  }

  curPlayerManager.pause();
}

module.exports = {
  login: login,
  musicLogin: musicLogin,
  ajax: ajax,
  ajaxU: ajaxU,
  request: request,
  getPic: getPic,
  initPlayer: initPlayer,
  play: play,
  pause: pause,
  getSystemInfo: getSystemInfo,
  getNetworkType: getNetworkType,
  tip: tip,
}