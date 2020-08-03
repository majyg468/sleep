const util = require('../../utils/util.js');
const app = getApp();
let { globalData } = app;

Page({
  data: {

  },

  onLoad(){
    console.log(23445);
    // wx.login({
    //   success: function (res) {
    //     console.log(res);
    //     let code = res.code; //用户code
    //     globalData.curCode = code;
    //     wx.getUserInfo({
    //       success(res) {
    //         console.log(res);
            
    //       }
    //     })
    //   }
    // });
    wx.navigateTo({
      url: '../detail/index'
    });
  },
  getUserInfo(e) {
    app.globalData.userData = e.detail || {};
    // console.log(e.detail);
    wx.navigateTo({
      url: '../detail/index'
    });
    // wx.login({
    //   success: function (res) {
    //     let code = res.code; //用户code
    //     globalData.curCode = code;
    //     wx.getUserInfo({
    //       success(res) {
    //         app.globalData.userData = res;
    //         wx.navigateTo({
    //           url: '../detail/index'
    //         });
    //       }
    //     })
    //   }
    // });
  }
})