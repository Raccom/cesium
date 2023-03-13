<template>
  <div style="height:100%;" id="app">
        <div id="positionNum">{{position}}</div>
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
    handler.setInputAction(function(event){
        // console.log(viewer.scene.camera.heading);
        // console.log(viewer.scene.camera.pitch);
        // console.log(viewer.scene.camera.roll);
        // console.log(viewer.scene.camera.position)
        let ray = viewer.camera.getPickRay(event.position);
        let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        let alt = cartographic.height; // 高度
        let coordinate = {
        longitude: Number(lng.toFixed(6)),
        latitude: Number(lat.toFixed(6)),
        altitude: Number(alt.toFixed(2))
        };
        console.log(coordinate);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);



const czml = [
    {
      "id": "document",
      "clock": {
          "interval": "2022-10-14T10:08:00+08:00/2022-10-15T16:08:00+08:00",
          "currentTime": "2022-10-14T10:08:00+08:00",
          "step": "SYSTEM_CLOCK_MULTIPLIER",
          "range": "CLAMPED",
          "multiplier": 60,
      },
      "version": "1.0"
    },
    {
        "id": "Air",
        "name": "Cesium Air",
        "description": "Cesium Air",
        "position": { // 位置变化
            "epoch": "2022-10-14T10:08:00+08:00", // 开始时间
            "cartographicDegrees":[
                0,
                109.32366609903016,
                19.416210072233245,
                0,
                500,
                109.4419785936138,
                18.680568851269086,
                0,
                1000,
                109.89192932581032,
                19.724133832572555,
                0,
                1500,
                110.2229377097452,
                19.04305216359129,
                0,
                2000,
                110.4442347566511,
                19.566040820754438,
                0,
                2500,
                112.14814972449157,
                20.235553306209056,
                0
            ]
        },
        // "model": {
        //     "gltf": new URL('./assets/GroundVehicle.glb', import.meta.url).href,
        //     "scale": 1,
        //     "minimumPixelSize": 5,
        // },
        "ellipsoid": {
            "radii": {
                "cartesian": [300, 300, 300],
            },
            "fill": true,
            "material": {
                "solidColor": {
                    "color": {
                        "rgba": [255, 0, 0, 100],
                    },
                },
            },
            "outline": true,
            "outlineColor": {
                "rgbaf": [0, 0, 0, 1],
            },
        },
        "path" : { // 路径
             material: {
                polylineOutline: {
                    color: {
                        rgba: [255, 0, 255, 255],
                    },
                },
            },
            width: 8,
            leadTime: 10,
            trailTime: 1000,
            resolution: 5,
        },
        label: { //文字
            fillColor: {
                rgba: [255, 255, 255, 255],
            },
            horizontalOrigin: "LFET",
            pixelOffset: {
                cartesian2: [0, 60],
            },
            // style: "FILL",
            text: "汽车",
            showBackground: true,
            backgroundColor: {
                rgba: [112, 89, 57, 0],
            },
        },
    },
];



const dataSourcePromise = viewer.dataSources.add(
    Cesium.CzmlDataSource.load(czml)
);

dataSourcePromise
    .then(function (dataSource) {
        viewer.trackedEntity = dataSource.entities.getById(
            "Air"
        );
        viewer.dataSources.add(dataSource).then(function(ds){
            var s = ds.entities.getById("Air");
            s.orientation =new Cesium.VelocityOrientationProperty(s.position);
        });

        // viewer.flyTo(dataSource)
    })
    .catch(function (error) {
        window.alert(error);
    });





    // 鼠标移动获取坐标
    handler.setInputAction(function(movement){
	    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if(cartesian){
            //将笛卡尔三维坐标转为地图坐标（弧度）
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            //将地图坐标（弧度）转为十进制的度数
            var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
            var lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
            var height = (viewer.camera.positionCartographic.height/1000).toFixed(2);

            position.value = lng+", "+lat+", "+height;
        }
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

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
