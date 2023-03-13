<template>
    <div style="height:100%;" id="app">
        <div id="positionNum">{{ position }}</div>
        <div id="cesiumContainer" style="height:100%"></div>
    </div>
</template>

<script setup>
import {onMounted, ref} from "@vue/runtime-core";
import * as Cesium from "cesium";

onMounted(() => {
    mapInit()
});

let viewer
const position = ref('')
const positions = [] // 用于存储点的位置数据数组
const tempPoints = [] // 用于存储点的位置数据数组


function distance(point1, point2) {
    var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /**根据经纬度计算出距离**/
    var geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    var s = geodesic.surfaceDistance;
    //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
    //返回两点之间的距离
    s = Math.sqrt(
        Math.pow(s, 2) +
        Math.pow(point2cartographic.height - point1cartographic.height, 2)
    );
    return s;
}

var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

function Angle(p1, p2, p3) {
    var bearing21 = Bearing(p2, p1);
    var bearing23 = Bearing(p2, p3);
    var angle = bearing21 - bearing23;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
/*方向*/
function Bearing(from, to) {
    var lat1 = from.lat * radiansPerDegree;
    var lon1 = from.lon * radiansPerDegree;
    var lat2 = to.lat * radiansPerDegree;
    var lon2 = to.lon * radiansPerDegree;
    var angle = -Math.atan2(
        Math.sin(lon1 - lon2) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
    );
    if (angle < 0) {
        angle += Math.PI * 2.0;
    }
    angle = angle * degreesPerRadian; //角度
    return angle;
}


//计算多边形面积
function getArea(points) {
    var res = 0;
    //拆分三角曲面
    for (var i = 0; i < points.length - 2; i++) {
        var j = (i + 1) % points.length;
        var k = (i + 2) % points.length;
        var totalAngle = Angle(points[i], points[j], points[k]);

        var dis_temp1 = distance(positions[i], positions[j]);
        var dis_temp2 = distance(positions[j], positions[k]);
        res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
        console.log(res);
    }
    return (res / 1000000.0).toFixed(4);
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
        shouldAnimate: true,
        destination: {
            x: 109.920501,
            y: 19.087122,
            z: 450000,
        },
        orientation: [0, -90, 0],
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
        {eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL},
        {eventType: Cesium.CameraEventType.RIGHT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL}
    ];
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];


    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);



    handler.setInputAction(function (movement) {
        handler.destroy();
        positions.pop();
        var textArea = getArea(tempPoints) + "平方公里";
        viewer.entities.add({
            name: "多边形面积",
            position: positions[positions.length - 1],
            label: {
                text: textArea,
                font: "18px sans-serif",
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(20, -40),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


    handler.setInputAction(function (evt) {
        let ray = viewer.camera.getPickRay(evt.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (positions.length === 0) {
            positions.push(cartesian.clone());
        }
        positions.push(cartesian);
        //在三维场景中添加点
        var cartographic = Cesium.Cartographic.fromCartesian(
            positions[positions.length - 1]
        );
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        var heightString = cartographic.height;
        tempPoints.push({
            lon: longitudeString,
            lat: latitudeString,
            hei: heightString,
        });
        viewer.entities.add({
            name: "多边形面积",
            position: positions[positions.length - 1],
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


    // 地图中心点，destination：经纬度和高度，orientation：倾斜角度
    setTimeout(() => {
        viewer.scene.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                mapOptions.destination.x,
                mapOptions.destination.y,
                mapOptions.destination.z,
            ),
            easingFunction: Cesium.EasingFunction.LINEAR_NONE,
            duration: 2,
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

#positionNum {
    position: fixed;
    right: 20px;
    bottom: 20px;
    color: #fff;
    z-index: 999;
}

</style>
