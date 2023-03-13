<template>
  <div style="height:100%;" id="app">
        <div id="positionNum">{{position}}</div>
        <button @click="cameraRoute" class="pathButton">route</button>
        <button @click="stopRoute" class="mockButton">stop</button>

        <button @click="cameraTranslate" class="tranButton">trans</button>
        <button @click="stopTranslate" class="stopTranButton">stop</button>
        <button @click="info" class="infoButton">info</button>
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
let routeFlag = false, moveFlag = false

const move = function(clock) {
    viewer.scene.camera.rotateRight(0.008);
}

const info = () => {
    var head = viewer.scene.camera.heading
    var pitch = viewer.scene.camera.pitch
    var roll  = viewer.scene.camera.roll
    var info ={'head': head ,'pitch': pitch ,'roll': roll};
    // 获取位置 wgs84的地心坐标系，x,y坐标值以弧度来表示
    var position = viewer.scene.camera.positionCartographic //with longitude and latitude expressed in radians and height in meters.
            //以下方式也可以获取相机位置只是返回的坐标系不一样
    // var position = viewer.scene.camera.position //cartesian3 空间直角坐标系
    // var ellipsoid = scene.globe.ellipsoid;
    // var position =ellipsoid.cartesianToCartographic(viewer.scene.camera.position)//
    // 弧度转经纬度
    var longitude = Cesium.Math.toDegrees(position.longitude).toFixed(6)
    var latitude =  Cesium.Math.toDegrees(position.latitude).toFixed(6)
    var height = position.height
    const resInfo = {lng:longitude,lat:latitude,h:height,mat:info}
    console.log(resInfo);
}

const cameraTranslate = () => {
    if(moveFlag) return
    moveFlag = true
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
        // viewer.trackedEntity =undefined
    viewer.camera.cancelFlight()
    viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            110.217149, 24.3903, 436.1423428779514
        ),
        orientation: {
            heading : 1.575128294766218,
            pitch : -0.3490679348077246,//Cesium.Math.toRadians(-35.0),
            roll : 3.7854342682663855e-7
        }
    })
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10 // 距离地形的距离
    viewer.camera.flyTo({
        easingFunction: Cesium.EasingFunction.LINEAR_NONE,
        duration: 20,
        destination: Cesium.Cartesian3.fromDegrees(110.228241, 24.389998 ,436.058142617345),
        orientation: {
            heading : 1.5751283032513648,
            pitch : -0.34906793470673136 ,//Cesium.Math.toRadians(-35.0),
            roll : 3.5373465490096123e-7
        },
    })
}

const stopTranslate = () => {
    moveFlag = false
    viewer.camera.cancelFlight()
}

const cameraRoute = () => {
    if(routeFlag) return
    routeFlag = true

    viewer.camera.cancelFlight()
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    // Lock camera to a point
    var center = Cesium.Cartesian3.fromDegrees(110.2203, 24.3903, 230)
    var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    //相机位置初始化

    viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(3.827657527141585, -0.5138211629018499, 200));
    viewer.clock.onTick.addEventListener(move);
}

const stopRoute = () => {
    routeFlag = false
    viewer.clock.onTick.removeEventListener(move)
}

const mapInit = () => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZjExMGM2NS1mMWQzLTRjNzEtODc1ZC0xMmQwYzNjZWE3ZDkiLCJpZCI6MTEwNjA0LCJpYXQiOjE2NjUzODc1ODB9.IoY4_TZQFr81KOFpT14H6aMTdbo90y0KbewQhu-wPx0'

    const mapOptions = {
        homeButton: false, //是否显示主页按钮
        sceneModePicker: false, //是否显示场景按钮
        baseLayerPicker: false, //是否显示图层选择控件
        navigationHelpButton: false, //导航帮助按钮
        selectionIndicator: false, //鼠标选择指示器
        infoBox: false, //信息提示框
        animation: false, //是否创建动画小器件，左下角仪表
        timeline: false, //是否显示时间线控件
        geocoder: false, //是否显示地名查找控件
        fullscreenButton: true, //是否全屏按钮
        shouldAnimate: false,
        destination: {
            x: 102.0524,
            y: 25.5800,
            z: 3528,
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
    viewer.terrainProvider = terrainProvider, // 显示地形
    // viewer.imageryProvider = imageryProvider, // 显示影像

    // viewer.scene.globe.depthTestAgainstTerrain = true // 关闭地形

    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
        Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.PINCH,
        { eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL },
        { eventType: Cesium.CameraEventType.RIGHT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL }
    ];
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];

    // 点云
    var arr = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: 'http://192.168.2.205:9009/pnts/tileset.json?version=201901&include=6&include=12&include=21&include=29&include=30&include=31&include=33&include=17',//文件的路径
        })
    );
    console.log(arr)
    // 定位过去


    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);


    // // 鼠标移动获取坐标
    // handler.setInputAction(function(movement){
	//     //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    //     var ellipsoid = viewer.scene.globe.ellipsoid;
    //     var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
    //     if(cartesian){
    //         //将笛卡尔三维坐标转为地图坐标（弧度）
    //         var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    //         //将地图坐标（弧度）转为十进制的度数
    //         var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
    //         var lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
    //         var height = (viewer.camera.positionCartographic.height/1000).toFixed(2);

    //         position.value = lng+", "+lat+", "+height;
    //     }
	// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

const positions = [] // 用于存储点的位置数据数组
handler.setInputAction(function (evt) {
 if (viewer.scene.mode !== Cesium.SceneMode.MORPHING) {
     const pickedObject = viewer.scene.pick(evt.position);
        if (viewer.scene.pickPositionSupported && Cesium.defined(pickedObject)) {
         const cartesian = viewer.scene.pickPosition(evt.position);
            if (Cesium.defined(cartesian)) {
             const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                const lng = Cesium.Math.toDegrees(cartographic.longitude);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const height = cartographic.height;//模型高度
                const mapPosition = { x: lng, y: lat, z: height };
                console.log(mapPosition)
                    viewer.entities.add({
                    	name: "点云点",
	                    position: Cesium.Cartesian3.fromDegrees(lng, lat, height),
                    	point: {
                    		color: Cesium.Color.DEEPSKYBLUE,
                    		outlineColor: Cesium.Color.SKYBLUE,
                    		pixelSize: 10,
                    		outlineWidth: 2,
                    		disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                            // 由于点需要定位在点云模型上 因此不能设置为显示在地面
	                    }
                   })
                }
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// 注册鼠标左击事件 
const points = []
viewer.screenSpaceEventHandler.setInputAction(function (click) { 
    let ray = viewer.camera.getPickRay(click.position);
                let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
                if (cartesian) {
                    points.push(cartesian);
                    let tempLength = points.length;
                    if (tempLength > 1) {
                        let p1 = points[points.length - 2];
                        let p2 = points[points.length - 1];
                        let length = Cesium.Cartesian3.distance(p1, p2);
                        console.log(333.8072040178474)
                    } 
                }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK); 

// 注册鼠标移动事件 


    // // 地图中心点，destination：经纬度和高度，orientation：倾斜角度
    setTimeout(() => {
        viewer.scene.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                mapOptions.destination.x,
                mapOptions.destination.y,
                mapOptions.destination.z,
            ),
            orientation: {
                heading: Cesium.Math.toRadians(mapOptions.orientation[0]),
                pitch: Cesium.Math.toRadians(mapOptions.orientation[1]),
                roll: Cesium.Math.toRadians(mapOptions.orientation[2])
            },
            easingFunction: Cesium.EasingFunction.LINEAR_NONE,
            duration: 1,
            complete: () => {
                viewer.scene.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                        mapOptions.destination.x,
                        mapOptions.destination.y,
                        mapOptions.destination.z,
                    ),
                    orientation: {
                        heading: Cesium.Math.toRadians(mapOptions.orientation[0]),
                        pitch: Cesium.Math.toRadians(-20),
                        roll: Cesium.Math.toRadians(mapOptions.orientation[2])
                    },
                    easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                    duration: 1,
                })
            }
        })
    }, 2000)
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10 // 距离地形的距离

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
.pathButton{
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999;
}
.mockButton{
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
}
</style>
