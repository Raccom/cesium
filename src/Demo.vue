<template>
    <div style="height:100%;" id="app">
        <div id="positionNum">{{ mousePosition }}</div>
        <div id="cesiumContainer" style="height:100%"></div>
    </div>
</template>

<script setup>
import {onMounted, ref, reactive, toRaw} from "vue";
import * as Cesium from "cesium";

onMounted(() => {
    mapInit()
});

let viewer, handler // cesium创建对象
const mousePosition = ref('')

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
            x: 116.39181,
            y: 39.90654,
            z: 600,
        },
        orientation: [0, -90, 0],
    }


    viewer = new Cesium.Viewer('cesiumContainer', mapOptions);
    viewer._cesiumWidget._creditContainer.style.display = "none" // 去除版权信息
    // viewer.extend(Cesium.viewerCesiumInspectorMixin)
    // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
    let terrainProvider = Cesium.createWorldTerrain({
        requestWaterMask: false, // 否需要请求额外的水
        requestVertexNormals: false // 光数据
    })
    // let imageryProvider = new Cesium.UrlTemplateImageryProvider({
    //     url: "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}"
    // })
    // viewer.terrainProvider = terrainProvider // 显示地形
    // viewer.imageryProvider = imageryProvider // 显示影像

    viewer.scene.globe.depthTestAgainstTerrain = true // 关闭地形

    viewer.scene.screenSpaceCameraController.tiltEventTypes = [
        Cesium.CameraEventType.RIGHT_DRAG, Cesium.CameraEventType.PINCH,
        {eventType: Cesium.CameraEventType.LEFT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL},
        {eventType: Cesium.CameraEventType.RIGHT_DRAG, modifier: Cesium.KeyboardEventModifier.CTRL}
    ];
    viewer.scene.screenSpaceCameraController.zoomEventTypes = [Cesium.CameraEventType.MIDDLE_DRAG, Cesium.CameraEventType.WHEEL, Cesium.CameraEventType.PINCH];


    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);


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

            mousePosition.value = lng + ", " + lat + ", " + height;
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)


    //地图中心点，destination：经纬度和高度，orientation：倾斜角度
    // setTimeout(() => {
    //     viewer.scene.camera.flyTo({
    //         destination: Cesium.Cartesian3.fromDegrees(
    //             mapOptions.destination.x,
    //             mapOptions.destination.y,
    //             mapOptions.destination.z,
    //         ),
    //         easingFunction: Cesium.EasingFunction.LINEAR_NONE,
    //         duration: 2,
    //     })
    // }, 2000)
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10 // 距离地形的距离
    viewer.scene.fxaa = false;//改善实体图片清晰度，去除图片锯齿
    viewer.scene.postProcessStages.fxaa.enabled = true;////去锯齿 使文字清晰
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        // 判断是否支持图像渲染像素化处理
        viewer.resolutionScale = window.devicePixelRatio;
    }

    const tileset = new Cesium.Cesium3DTileset({
        url: '/obj/tileset.json',
        modelMatrix: Cesium.Matrix4.fromArray([
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ]),
    });
    const tileset2 = new Cesium.Cesium3DTileset({
        url: '/osgb/tileset.json',
        modelMatrix: Cesium.Matrix4.fromArray([
            1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
        ]),
    });
    tileset.readyPromise.then((tileset) => {
        console.log('tileset', tileset);
        console.log('tileset默认位置', tileset.boundingSphere.center);
        const params = {
            tx: 120.72558333333333 - 0.00410,
            ty: 31.043325 + 0.00459,
            tz: 10, // 修改高程
            rx: -65,
            ry: 39,
            rz: 0 // 修改旋转
        };
        const update3dtilesMaxtrix = (tileset, params) => {
            // 旋转
            const mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
            const my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
            const mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
            const rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
            const rotationY = Cesium.Matrix4.fromRotationTranslation(my);
            const rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
            // 平移（修改经纬度）
            const position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
            const m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            // 旋转、平移矩阵相乘
            Cesium.Matrix4.multiply(m, rotationX, m);
            Cesium.Matrix4.multiply(m, rotationY, m);
            Cesium.Matrix4.multiply(m, rotationZ, m);
            // 缩放（修改缩放比例）
            const scale = Cesium.Matrix4.fromUniformScale(0.95);
            Cesium.Matrix4.multiply(m, scale, m);
            // 赋值给tileset
            tileset._root.transform = m;
        }
        update3dtilesMaxtrix(tileset, params);
        viewer.scene.primitives.add(tileset);
        // viewer.zoomTo(tileset)
    })
    tileset2.readyPromise.then((tileset) => {
        console.log('tileset', tileset);
        console.log('tileset默认位置', tileset.boundingSphere.center);
        const params = {
            tx: 120.72558333333333 - 0.00410,
            ty: 31.043325 + 0.00579,
            tz: -20, // 修改高程
            rx: 20,
            ry: 0,
            rz: -35 // 修改旋转
        };
        const update3dtilesMaxtrix = (tileset, params) => {
            // 旋转
            const mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
            const my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
            const mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
            const rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
            const rotationY = Cesium.Matrix4.fromRotationTranslation(my);
            const rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
            // 平移（修改经纬度）
            const position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
            const m = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            // 旋转、平移矩阵相乘
            Cesium.Matrix4.multiply(m, rotationX, m);
            Cesium.Matrix4.multiply(m, rotationY, m);
            Cesium.Matrix4.multiply(m, rotationZ, m);
            // 缩放（修改缩放比例）
            const scale = Cesium.Matrix4.fromUniformScale(0.95);
            Cesium.Matrix4.multiply(m, scale, m);
            // 赋值给tileset
            tileset._root.transform = m;
        }
        update3dtilesMaxtrix(tileset, params);
        viewer.scene.primitives.add(tileset);
        viewer.zoomTo(tileset)
    })

}
</script>

<style scoped>
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

.groupButton {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999;
}

.mockButtonGroup {
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 999;
    background-color: #fff;
    padding: 0 10px;
    border-radius: 5px;
}

</style>



