<template>
    <div style="height:100%;" id="app">
          <div id="cesiumContainer" style="height:100%"></div>
      </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from "@vue/runtime-core";
  import * as Cesium from "cesium";
  
  onMounted(() => {
      mapInit()
  });
  
  let viewer
  const position = ref('')
  
  
  
  const mapInit = () => {
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZjExMGM2NS1mMWQzLTRjNzEtODc1ZC0xMmQwYzNjZWE3ZDkiLCJpZCI6MTEwNjA0LCJpYXQiOjE2NjUzODc1ODB9.IoY4_TZQFr81KOFpT14H6aMTdbo90y0KbewQhu-wPx0'
  
      const mapOptions = {
          homeButton: false, //是否显示主页按钮
          sceneModePicker: false, //是否显示场景按钮
          baseLayerPicker: false, //是否显示图层选择控件
          navigationHelpButton: false, //导航帮助按钮
          selectionIndicator: false, //鼠标选择指示器
          animation: false, //是否创建动画小器件，左下角仪表
          timeline: false, //是否显示时间线控件
          geocoder: false, //是否显示地名查找控件
          fullscreenButton: true, //是否全屏按钮
          shouldAnimate: true,
          infoBox: false,
          destination: {
              x: 110.220501,
              y: 24.387122,
              z: 850,
          },
          orientation: [0, -90, 0],
          // tileDataOption: {
          //     name: "倾斜摄影",
          //     type: "OsgbModelLayer",
          //     url: "http://xxxxxx/3dtileset.json",
          //     height: 0
          // },
      }
  
  
      viewer = new Cesium.Viewer('cesiumContainer', mapOptions);
      viewer._cesiumWidget._creditContainer.style.display = "none" // 去除版权信息
  
      let terrainProvider = Cesium.createWorldTerrain({
          requestWaterMask: false, // 否需要请求额外的水
          requestVertexNormals: false // 光数据
      })
      // let imageryProvider = new Cesium.UrlTemplateImageryProvider({
      //     url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
      // })
      // viewer.terrainProvider = terrainProvider, // 显示地形
      // viewer.imageryProvider = imageryProvider, // 显示影像
  
      // viewer.scene.globe.depthTestAgainstTerrain = true // 关闭地形
  
      viewer.scene.screenSpaceCameraController.tiltEventTypes = [
          Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.PINCH,
          { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
          { eventType: Cesium.CameraEventType.RIGHT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL }
      ];
      viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];
  

      

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
	// 点击时获取经纬度
	let ray = viewer.camera.getPickRay(movement.position);
    let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
    let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
    let alt = cartographic.height; // 高度

    viewer.entities.add({
        name: "点",
        position: Cesium.Cartesian3.fromDegrees(lng, lat, alt), // 点生成的位置
        point: {
            color: Cesium.Color.DEEPSKYBLUE,	// 点颜色
            outlineColor: Cesium.Color.SKYBLUE,	// 点边框颜色
            pixelSize: 10,						// 点大小
            outlineWidth: 2,					// 点边框大小
            disableDepthTestDistance: Number.POSITIVE_INFINITY,		 // 受地形遮挡
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 生成在地形表面
        }
    });
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  }
  </script>
  
  <style>
  html,
  body,
  #app,
  #cesiumContainer {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    max-width: 100%;
  }
  #positionNum{
      position: fixed;
      right: 20px;
      bottom: 20px;
      color: #fff;
      z-index: 999;
  }
  /* .routeButton{
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999;
  }
  .stopButton{
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999;
  }
  .tranButton{
      position: fixed;
      top: 150px;
      right: 20px;
      z-index: 999;
  }
  .stopTranButton{
      position: fixed;
      top: 220px;
      right: 20px;
      z-index: 999;
  }
  .infoButton{
      position: fixed;
      bottom: 60px;
      right: 20px;
      z-index: 999;
  } */
  </style>
  