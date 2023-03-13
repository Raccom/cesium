<template>
    <div style="height:100%;" id="app">
        <div id="positionNum">{{ position }}</div>
        <div id="cesiumContainer" style="height:100%"></div>
    </div>
</template>

<script>
import {onMounted, ref} from "@vue/runtime-core";
import * as Cesium from "cesium";

onMounted(() => {
    mapInit()
});

let viewer, poly
let distance = 0
const position = ref('')
const positions = [] // 用于存储点的位置数据数组
const linePositions = ref([]) // 用于存储点的位置数据数组

/**
 * @description 生成CZML线的JSON数据
 * @param {number[]} cartographicDegrees 多组经度纬度高度 组成的坐标数组
 * @return {Array} 所有线的CZML JSON数据
 */
const getCzmlLine = (cartographicDegrees) => {
    return [{
        "id": "document",
        "name": "CZML Geometries: Polyline",
        "version": "1.0"
    }, {
        "id": "fullLine",
        "name": "Yellow full line",
        "polyline": {
            "positions": {
                "cartographicDegrees": cartographicDegrees
            },
            "material": {
                "solidColor": {
                    "color": {
                        "rgba": [255, 255, 0, 255]
                    }
                }
            }
        }
    }];
}

/**
 * @description 添加CZML线实体到地图显示
 * @param {Array} polyLinePositions 由值为经纬度的对象组成的坐标数组（不含高度）
 */
const creatLine = (polyLinePositions) => {
    // 创建czml文件；得到czml数据源
    const polyLineSet = polyLinePositions.reduce((positionCollection, item) => {
        const values = Object.values(item)
        if (values.length < 3) positionCollection = [...positionCollection, ...values, 0]
        return positionCollection
    }, [])
    const czmlLine = getCzmlLine(polyLineSet);
    // 加载提供的URL或CZML对象，替换任何现有数据。
    const dataSourcePromise = Cesium.CzmlDataSource.load(czmlLine);
    viewer.dataSources.add(dataSourcePromise);
    // 添加czml数据到三维球上
    // viewer.zoomTo(dataSourcePromise);
}


function getSpaceDistance(positions) {
    var distance = 0;
    for (var i = 0; i < positions.length - 1; i++) {
        var point1cartographic = Cesium.Cartographic.fromCartesian(
            positions[i]
        );
        var point2cartographic = Cesium.Cartographic.fromCartesian(
            positions[i + 1]
        );
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //返回两点之间的距离
        s = Math.sqrt(
            Math.pow(s, 2) +
            Math.pow(point2cartographic.height - point1cartographic.height, 2)
        );
        distance = distance + s;
    }
    return distance.toFixed(2);
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
        terrainProvider: Cesium.createWorldTerrain({
            requestWaterMask: false, // 否需要请求额外的水
            requestVertexNormals: false // 光数据
        }),
        destination: {
            x: 102.0470,
            y: 25.5825,
            z: 2528,
        },
        orientation: [0, -90, 0],
    }


    viewer = new Cesium.Viewer('cesiumContainer', mapOptions);
    viewer._cesiumWidget._creditContainer.style.display = "none" // 去除版权信息


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


    // 鼠标移动获取坐标
    handler.setInputAction(function (movement) {
        //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesian) {
            //将笛卡尔三维坐标转为地图坐标（弧度）
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            //将地图坐标（弧度）转为十进制的度数
            var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
            var lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
            var height = (viewer.camera.positionCartographic.height / 1000).toFixed(2);

            position.value = lng + ", " + lat + ", " + height;
        }


        let ray = viewer.camera.getPickRay(movement.endPosition);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (positions.length >= 2) {
            if (!Cesium.defined(poly)) {
                poly = new Cesium.GroundPolylinePrimitive(positions);
            } else {
                positions.pop();
                positions.push(cartesian);
            }
            distance = getSpaceDistance(positions);
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(function (movement) {
        handler.destroy(); //关闭事件句柄
        positions.pop(); //最后一个点无效
        // viewer.entities.remove(floatingPoint);
        // tooltip.style.display = "none";
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


    handler.setInputAction(function (evt) {
        let ray = viewer.camera.getPickRay(evt.position);
        let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        let latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度

        if (positions.length === 0) {
            positions.push(cartesian.clone());
        }
        positions.push(cartesian);
        //在三维场景中添加Label
        var textDisance = distance + "米";
        viewer.entities.add({
            name: "空间直线距离",
            position: positions[positions.length - 1],
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
            },
            label: {
                text: textDisance,
                font: "18px sans-serif",
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(20, -20),
            },
        });
        linePositions.value.push({longitude, latitude})

        if (linePositions.value.length < 1) return; // 至少具有两组点的坐标 才划线
        creatLine(linePositions.value)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    var arr = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
            url: 'http://192.168.2.205:9009/pnts/tileset.json?version=201901&include=6&include=12&include=21&include=29&include=30&include=31&include=33&include=17',//文件的路径
        })
    );

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
