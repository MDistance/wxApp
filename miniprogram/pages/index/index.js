const app = getApp();
const amapFile = require('../../libs/amap-wx.js');
var myAmapFun=new amapFile.AMapWX({key: '915bf8ca09b9d5e25b6af8514b50af17'})

var markersData=[];
var recharge=[]
Page({
  data: {
    latitude: '',
    longitude: '',
    scale:18,
    topText:'摩捷出行',
    textData: {},
    markers: [],
    polyline: []
  },
 
 
onLoad: function (e) {
 var that=this;
 that.getMyLocation();
 var params = {
  iconPathSelected: '../../images/marker_checked.png',
  iconPath: '../../images/marker.png',
  success: function(data){
    markersData = data.markers;
    var poisData = data.poisData;
    var markers_new = [];
    markersData.forEach(function(item,index){
      markers_new.push({
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: item.iconPath,
        width: item.width,
        height: item.height
      })

    })
    if(markersData.length > 0){
      that.setData({
        markers: markers_new
      });
      that.setData({
        city: poisData[0].cityname || ''
      });
      that.setData({
        latitude: markersData[0].latitude
      });
      that.setData({
        longitude: markersData[0].longitude
      });
      that.showMarkerInfo(markersData,0);
    }else{
      wx.getLocation({
        type: 'gcj02',
        success: function(res) {
          that.setData({
            latitude: res.latitude
          });
          that.setData({
            longitude: res.longitude
          });
          that.setData({
            city: '北京市'
          });
        },
        fail: function(){
          that.setData({
            latitude: 39.909729
          });
          that.setData({
            longitude: 116.398419
          });
          that.setData({
            city: '北京市'
          });
        }
      })
      
      that.setData({
        textData: {
          name: '抱歉，未找到结果',
          desc: ''
        }
      });
    }
    
  },
  fail: function(info){
    // wx.showModal({title:info.errMsg})
  }
}
if(e && e.keywords){
  params.querykeywords = e.keywords;
}
myAmapFun.getPoiAround(params)
},
onReady() {
  // 创建map上下文  保存map信息的对象
  console.log(this)
  this.mapCtx = wx.createMapContext('myMap');
 
},
// 地图上的marker点击事件

markertap: function(e) {
  var id = e.markerId;
  var that = this;
  that.showMarkerInfo(markersData,id);

  that.changeMarkerColor(markersData,id);
  that.getRoute(markersData,id);
},
poitap:function(e){

},

// 获取路线代码
getRoute(data,i){
  var that=this;
  console.log(data)
  this.mapCtx.getCenterLocation({
    success:(res)=>{
      console.log(res)
      myAmapFun.getRidingRoute({
        origin:`${res.longitude},${res.latitude}`,
        destination:`${data[i].longitude},${data[i].latitude}`,
        success:(data)=>{
          let points=[];
          if(data.paths&&data.paths[0]&&data.paths[0].steps){
            let steps=data.paths[0].steps;
            for(let i=0;i<steps.length;i++){
              let poLen=steps[i].polyline.split(';');
              for(let j=0;j<poLen.length;j++){
                points.push({
                  longitude:parseFloat(poLen[j].split(',')[0]),
                  latitude:parseFloat(poLen[j].split(',')[1])
                })
              }
            }
          }
          that.setData({
            polyline:[{
              points: points,
              color: "#0095ff",
              width: 5
            }]
          })
        }

      })
    }
  })

},
// 底部信息提示
showMarkerInfo: function(data,i){
  var that = this;
  that.setData({
    textData: {
      name: data[i].name,
      desc: data[i].address
    }
  });
},
changeMarkerColor: function(data,i){
  var that = this;
  var markers = [];
  for(var j = 0; j < data.length; j++){
    if(j==i){
      data[j].iconPath = "../../images/marker_checked.png";
    }else{
      data[j].iconPath = "../../images/marker.png";
    }
    markers.push({
      id: data[j].id,
      latitude: data[j].latitude,
      longitude: data[j].longitude,
      iconPath: data[j].iconPath,
      width: data[j].width,
      height: data[j].height
    })
  }
  that.setData({
    markers: markers
  });
},
//获取当前位置
getMyLocation:function(){
  var that=this;
  wx.getLocation({
    type:'gcj02',
    success(data){
      console.log(data)
      if(data){
        let longitude=data.longitude
        let latitude=data.latitude
        that.setData({
          longitude,
          latitude
          // currentLocation:data
        })
      }
    }
  })
},
 
 //复位按钮  已完成
 toReset(){
  console.log('重置定位')
  //调回缩放比，提升体验
  var promise = new Promise((resolve) =>{
    this.mapCtx.moveToLocation();
    resolve('调回缩放比')
  })
  promise.then((value)=>{
    setTimeout(() => {
      this.setData({
        scale: 18
      })
    }, 1000)
  })
  
}, 
  // 跳转到个人中心
  toUser(){
    if (!app.globalData.loginStatus){
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/userCenter/userCenter',
      })
    }
  },
  // 跳转到消息  已完成
  toMsg() {
    wx.navigateTo({
      url: '/pages/messageCenter/messageCenter',
    })
  },



 


 })