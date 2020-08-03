
const util = require('../../utils/util.js');
const app = getApp();
let { globalData } = app;


Page({
  data: {
    songInfo:{

    },
    userInfo:{},
    pic: '',
    canvas: '',
    contextWidth: 0,
    contextHeight: 0,
    posterWidth: 0,
    posterHeight: 0,
    shareid: '',
    loading: true
  },
  
  
  onLoad(options) {

    let width = +(options.w || 600); // wx.canvasToTempFilePath在生成图片的时候对部分手机是有canvas大小限制，wx开发说：每个系统创建 bitmap 有一定限制，canvas 目前没做分片处理，后续会优化
    // width = 2000;
    // console.log(width)
    let ratio = width / 300;

    this.setData({
      songInfo: globalData['songInfo'],
      userInfo: globalData['userData']['userInfo'],
      contextWidth: width,
      contextHeight: width + (70 * ratio),
    });

    

    

    this.setData({
      contextBg: wx.createCanvasContext('js_shareCanvas')
    })
    let context = this.data.contextBg;
    
    // if (globalData['songInfo'].albumImg) {
      const coverPromise = new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: globalData['songInfo'].albumImg,
          // src: '../image/album.jpg',
          success: (res) => {
            resolve(res.path);
          },
          fail: (err) => {
            util.tip('图片获取失败');
            resolve('');
          }
        });
      });

      const avatarPromise = new Promise((resolve, reject) => {
        // 画头像
        console.log(this.data.userInfo.avatarUrl);
        wx.getImageInfo({
          src: this.data.userInfo.avatarUrl,
          success: (res) => {
            resolve(res.path);
          },
          fail: (err) => {
            util.tip('头像获取失败');
            resolve('');
          }
        })
      });

      

      Promise.all([coverPromise, avatarPromise]).then((paths) => {
        // let coverPath = paths[0];
        
        let coverPath = paths[0];
        let avatarPath = paths[1];
        let diskPath = '../image/disk.png';
        let qrtcodePath = '../image/qrcode.png';


        const grd = context.createLinearGradient(0, 0, 600, 960)
        grd.addColorStop(0, '#4B4B4B')
        grd.addColorStop(1, '#1C1C1C')
        context.setFillStyle(grd)
        context.fillRect(0, 0, 600, 960)

        // 日期
        context.setFillStyle('#FFF')
        context.setFontSize(32)
        context.fillText(this.data.songInfo.dateNum, 48, 70)

        // 歌曲名和歌手名
        context.setFontSize(26)
        context.fillText(this.data.songInfo.songName, 48, 590, 500)
        context.fillText(this.data.songInfo.singerName, 48, 630, 500)


        // 歌曲描述
        context.setFillStyle('rgba(255, 255, 255, .6)')
        context.setFontSize(24)

        for (var i = 0; i < this.data.songInfo.desc.length; i = (i + 20)){
          console.log(i, this.data.songInfo.desc.slice(i, i +20));
          if (!this.data.songInfo.desc.slice(i, i+20)){
            continue;
          }
          context.fillText(this.data.songInfo.desc.slice(i, i + 20), 48, 700 + i*2, 500)
        }

        
        
        // context.fillText('描述文字描述文字描述文字描述文字描述文字', 48, 740, 500)
        // context.fillText('描述文字', 48, 780, 500) 

        // 封面
        context.drawImage(coverPath, 48, 95, 445, 445)
        context.drawImage(diskPath, 493, 100, 48, 429)

        // 头像
        context.drawImage(avatarPath, 30, 850, 80, 80)

        // 用户名
        context.setFillStyle('rgba(255, 255, 255, .6)')
        context.setFontSize(22)
        context.fillText(this.data.userInfo.nickName, 130, 900)

        // 二维码
        context.drawImage(qrtcodePath, 490, 850, 80, 80)


        context.draw(true, () => {
          this.generateImage();
        });
      });
    // }

  },
  generateImage: function () {
    let contextBg = this.data.contextBg;
    wx.canvasToTempFilePath({
      canvasId: 'js_shareCanvas',
      fileType: 'jpg',
      success: (res) => {
        this.setData({
          fullImageUrl: res.tempFilePath
        });

        this.setData({
          loading: false
        })
      },
      fail: (err) => {
        this.setData({
          loading: false
        })
      }
    }, this)
  },
  download: function () {
    if (!this.data.loading) {
      wx.showLoading({
        title: '保存中...',
      });
      wx.canvasToTempFilePath({
        canvasId: 'js_shareCanvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
              wx.hideLoading();
              util.tip('图片已保存，可以在相册中查看', 'none', 3000)
            },
            fail: (err) => {
              wx.hideLoading();
              util.tip('保存到相册失败，', 'none', 3000)
            }
          })
        },
        fail: (err) => {
        }
      }, this);
    }
  },
  generateImage: function () {
    let contextBg = this.data.contextBg;
    wx.canvasToTempFilePath({
      canvasId: 'js_shareCanvas',
      fileType: 'jpg',
      success: (res) => {
        this.setData({
          fullImageUrl: res.tempFilePath
        });

        this.setData({
          loading: false
        })
      },
      fail: (err) => {
        this.setData({
          loading: false
        })
      }
    }, this)
  },
  downloadImage: function () {
    if (!this.data.loading) {
      wx.showLoading({
        title: '保存中...',
      });
      wx.canvasToTempFilePath({
        canvasId: 'js_shareCanvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
              wx.hideLoading();
              util.tip('图片已保存，可以在相册中查看', 'none', 3000)
            },
            fail: (err) => {
              wx.hideLoading();
              util.tip('保存到相册失败', 'none', 3000)
            }
          })
        },
        fail: (err) => {
        }
      }, this);
    }
   
  },
  /**
   * 分享
   */
  onShareAppMessage: function () {
    

    return {
      title: '分享我的眠眠电台',
      desc: '分享我的眠眠电台',
      imageUrl: globalData['songInfo'].albumImg,
      path: '/pages/index/index'
    }
  }
  
})