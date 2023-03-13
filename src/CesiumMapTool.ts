/*
 * @Description: cesium
 * @Author: 林文琛
 * @Date: 2022-04-13 10:22:40
 * @LastEditTime: 2022-09-22 11:23:28
 * @LastEditors: 关润宁
 */

import * as Cesium from 'cesium';
// @ts-ignore
import CesiumNavigation from "cesium-navigation-es6";
// @ts-ignore
import * as turf from '@turf/turf';
import { ElMessage } from 'element-plus'


/** cesium地图类 */
export default class CesiumMapTool {

    /** viewer对象 */
    public viewer: Cesium.Viewer

    private homeRange: Cesium.Rectangle = Cesium.Rectangle.fromDegrees(73, 18, 140, 48);

    constructor(target: string) {
        // 设置密钥
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZDkyMDRhYi1kYzZiLTQ3NTAtYmUxMi0xNzY0YjAxNjc1ZTciLCJpZCI6MzEzNDUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTUzMDA5OTJ9.c8WqkrVGJFmEwP3imBppGj0Sf6j3zCwGWBJ0pvRAVaI";
        this.viewer = new Cesium.Viewer(target, {
            // 是否创建动画小器件，左下角仪表
            animation: false,
            // 是否显示图层选择器
            baseLayerPicker: false,
            // 是否显示全屏按钮
            fullscreenButton: false,
            // 是否显示geocoder小器件，右上角查询按钮
            geocoder: false,
            // 是否显示Home按钮
            homeButton: false,
            // 是否显示信息框
            infoBox: false,
            // 是否显示3D/2D选择器
            sceneModePicker: false,
            // 是否显示选取指示器组件
            selectionIndicator: false,
            // 是否显示时间轴
            timeline: false,
            // 是否显示右上角的帮助按钮
            navigationHelpButton: false,
            // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
            scene3DOnly: false,
            // 解决截图无法正常显示的问题
            contextOptions: {
                //@ts-ignore
                id: "cesiumCanvas",
                webgl: {
                    preserveDrawingBuffer: true
                }
            }
        });
        // 挂载到全局
        window.viewer = this.viewer;
        // 隐藏cesium版权图标
        (this.viewer as any)._cesiumWidget._creditContainer.style.display = "none";
        // 改变默认鼠标事件，左键平移，中间键缩放，右键旋转改变角度
        this.viewer.scene.screenSpaceCameraController.tiltEventTypes =
            Cesium.CameraEventType.RIGHT_DRAG;
        this.viewer.scene.screenSpaceCameraController.zoomEventTypes =
            Cesium.CameraEventType.WHEEL;
        // 改善图片清晰度
        (this.viewer.scene as any).fxaa = false;
        // 改善文字清晰度
        this.viewer.scene.postProcessStages.fxaa.enabled = true;
        // 调整分辨率
        if ((this.viewer.cesiumWidget as any)._supportsImageRenderingPixelated) {
            let vtxf_dpr = window.devicePixelRatio;
            while (vtxf_dpr >= 2.0) { vtxf_dpr /= 2.0; }
            this.viewer.resolutionScale = vtxf_dpr;
        }

        // 设置初始位置
        this.setView(this.homeRange);

        // 设置指北针
        let options = {
            // 设置重置时的视角
            defaultResetView: Cesium.Rectangle.fromDegrees(80, 22, 130, 50),
            // 是否显示罗盘
            enableCompass: true,
            // 是否显示缩放控件
            enableZoomControls: true,
            // 是否显示距离图例
            enableDistanceLegend: true,
            // 是否显示指南针外环
            enableCompassOuterRing: true,
        };
        // 将指北针挂载到当前viewer
        new CesiumNavigation(this.viewer, options);
    }

    /**
     * @Date: 2022-06-16 14:15:49
     * @description: 加载地形
     * @param {string} url
     * @return {*}
     */
    public addTerrainProvider(url: string): void {
        let terrainProvider = new Cesium.CesiumTerrainProvider({
            url: url
        });
        this.viewer.terrainProvider = terrainProvider;
    }

    /**
     * @Date: 2022-09-22 11:23:32
     * @description: 加载影像
     * @param {string} url
     * @return {*}
     */
    public addImageryProvider(url: string): void {
        let imageProvider = new Cesium.UrlTemplateImageryProvider({
            url: url
        });
        this.viewer.imageryLayers.addImageryProvider(imageProvider);
    }

    /**
     * @name: setView
     * @Date: 2022-04-27 15:41:40
     * @description: 设置视角
     * @param {Cesium} destination  位置
     * @param {any} orientation 角度
     */
    public setView = (destination: Cesium.Rectangle | Cesium.Cartesian3, orientation?: any) => {
        this.viewer.camera.setView({
            destination: destination,
            orientation: orientation
        })
    }

    /**
     * @name: flyTo
     * @Date: 2022-06-22 10:43:35
     * @description: 飞至视角
     * @param {Cesium} destination 位置
     * @param {any} orientation 角度
     */
    public flyTo = (destination: Cesium.Rectangle | Cesium.Cartesian3, orientation?: any) => {
        this.viewer.camera.flyTo({
            destination: destination,
            orientation: orientation
        })
    }

    /**
     * @name: addPrimitives
     * @Date: 2022-04-25 16:58:13
     * @description: 添加几何体
     * @param {any} primitive 几何体
     */
    public addPrimitives = (primitive: any) => {
        this.viewer.scene.primitives.add(primitive);
        this.viewer.flyTo(primitive, { offset: new Cesium.HeadingPitchRange(90, -90, 300) });
    }

    /**
     * @name: controlPrimitivesByLayer
     * @Date: 2022-04-25 16:59:46
     * @description: 通过图层控制几何体显示隐藏，用于批量控制某一类几何体
     * @param {string} layerName 图层名称
     * @param {boolean} visible 是否显示
     */
    public controlPrimitivesByLayer = (layerName: string, visible: boolean) => {
        for (let p of (this.viewer.scene.primitives as any)._primitives) {
            if (p.layerName == layerName) {
                p.show = visible;
            }
        }
    }

    /**
     * @name: controlPrimitivesById
     * @Date: 2022-04-27 16:33:40
     * @description: 通过ID控制几何体显示隐藏，用于控制单个几何体
     * @param {string} id ID
     * @param {boolean} visible 是否显示
     */
    public controlPrimitivesById = (id: string, visible: boolean) => {
        for (let p of (this.viewer.scene.primitives as any)._primitives) {
            if (p.id == id) {
                p.show = visible;
                break;
            }
        }
    }

    /**
     * @name: addPnts
     * @Date: 2022-05-06 09:28:53
     * @description: 添加点云
     * @param {string} url 点云地址
     * @param {string} layerName 图层名称
     * @param {string} id 点云ID
     * @param {number} pointSize 点云大小
     * @return {Cesium.Cesium3DTileset} 添加的点云
     */
    public addPnts = (url: string, layerName?: string, id?: string, pointSize?: number): Cesium.Cesium3DTileset => {
        let pnts = new Cesium.Cesium3DTileset({ url });
        (pnts as any).layerName = layerName ? layerName : "pnts";
        (pnts as any).id = id;
        pnts.style = new Cesium.Cesium3DTileStyle();
        (pnts.style as any).pointSize = pointSize ? pointSize : 3;
        pnts.maximumScreenSpaceError = 64.0;
        pnts.pointCloudShading.maximumAttenuation = 0;
        this.addPrimitives(pnts);
        return pnts;
    }

    /**
     * @name: addModel
     * @Date: 2022-05-06 09:28:53
     * @description: 添加模型
     * @param {string} url 模型地址
     * @param {string} layerName 图层名称
     * @param {string} id 模型
     * @return {Cesium.Cesium3DTileset} 添加的模型
     */
    public addModel = (url: string, layerName?: string, id?: string): Cesium.Cesium3DTileset => {
        let model = new Cesium.Cesium3DTileset({ url });
        (model as any).layerName = layerName ? layerName : "model";
        (model as any).id = id;
        model.maximumScreenSpaceError = 1;
        model.skipLevelOfDetail = true;
        model.skipLevels = 60;
        model.shadows = Cesium.ShadowMode.DISABLED;
        this.addPrimitives(model);
        return model;
    }

    /**
     * @name: getCenterPoint
     * @Date: 2022-05-06 09:23:16
     * @description: 获取两点之间的中点坐标
     * @param {any} point1 点1
     * @param {any} point2 点2
     * @return {Cesium.Cartesian3} 中点坐标
     */
    public getCenterPoint = (point1: any, point2: any): Cesium.Cartesian3 => {
        let x = (point1.x + point2.x) / 2.0;
        let y = (point1.y + point2.y) / 2.0;
        let z = (point1.z + point2.z) / 2.0;
        return new Cesium.Cartesian3(x, y, z);
    }

    // 赤道半周长
    public R = 20037508.3437892;

    /**
     * @name: CartesianToMercator
     * @Date: 2022-05-06 09:26:13
     * @description: 笛卡尔转墨卡托
     * @param {Cesium.Cartesian3} cartesian3 笛卡尔坐标
     * @return {number[]} 墨卡托坐标
     */
    public CartesianToMercator = (cartesian3: Cesium.Cartesian3): number[] => {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        let jd = Cesium.Math.toDegrees(cartographic.longitude);
        let wd = Cesium.Math.toDegrees(cartographic.latitude);
        let gc = cartographic.height;
        let x = jd * this.R / 180.0;
        let y = Math.log(Math.tan((90.0 + wd) * Math.PI / 360.0)) / (Math.PI / 180.0);
        y = y * this.R / 180.0;
        return [x, y, gc];
    }

    /**
     * @name: MercatorToCartesian
     * @Date: 2022-05-06 09:27:08
     * @description: 墨卡托转笛卡尔
     * @param {number} x 墨卡托坐标x
     * @param {number} y 墨卡托坐标y
     * @param {number} z 墨卡托坐标z
     * @return {Cesium.Cartesian3} 笛卡尔坐标
     */
    public MercatorToCartesian = (x: number, y: number, z: number): Cesium.Cartesian3 => {
        let jd = x / this.R * 180.0;
        let wd = y / this.R * 180.0;
        wd = 180.0 / Math.PI * (2 * Math.atan(Math.exp(wd * Math.PI / 180.0)) - Math.PI / 2);
        return Cesium.Cartesian3.fromDegrees(jd, wd, z);
    }

    /**
     * @name: screenshots
     * @Date: 2022-05-06 10:13:14
     * @description: 地图场景截图
     * @param {Cesium.Scene} scene 地图场景
     */
    public screenshots = (scene: Cesium.Scene) => {
        const dataURLtoBlob = (dataurl: string) => {
            let arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)![1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }
        let canvas = scene.canvas;
        let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        let link = document.createElement("a");
        let blob = dataURLtoBlob(image);
        let objurl = URL.createObjectURL(blob);
        link.download = "地图场景.png";
        link.href = objurl;
        link.click();
    }

    /**
     * @name: measure
     * @Date: 2022-04-29 17:07:56
     * @description: 测量对象，包含了各类测量方法
     */
    public measure = {
        // 获取上一层this
        self: this,
        // 点的可渲染集合
        pointCollection: null as unknown as Cesium.PointPrimitiveCollection | null,
        // 折线的可渲染集合
        lineCollection: null as unknown as Cesium.PolylineCollection | null,
        // 标注的可渲染集合
        labelCollection: null as unknown as Cesium.LabelCollection | null,
        // 测量点数组
        points: [] as Cesium.Cartesian3[],
        // 测量操作事件
        handler: null as unknown as Cesium.ScreenSpaceEventHandler | null,

        // 绘制点
        drawPoint(position: Cesium.Cartesian3, pointColor?: Cesium.Color) {
            let color = pointColor ? pointColor : Cesium.Color.RED;
            this.pointCollection?.add({
                position,
                color,
                pixelSize: 10,
                disableDepthTestDistance: 100000000000,
                eyeOffset: new Cesium.Cartesian3(0, 0, -10),
            });
        },

        // 绘制线
        drawLine(positions: Cesium.Cartesian3[], lineColor?: Cesium.Color) {
            let color = lineColor ? lineColor : Cesium.Color.GREENYELLOW;
            this.lineCollection?.add({
                positions,
                width: 3,
                eyeOffset: new Cesium.Cartesian3(0, 0, -10),
                disableDepthTestDistance: 100000000000,
                material: Cesium.Material.fromType('Color', { color }),
            });
        },

        // 绘制标注
        drawLabel(id: string | number, position: Cesium.Cartesian3, text: string, style?: any) {
            this.labelCollection?.add({
                id: id,
                position: position,
                text: text,
                font: '16px sans-serif',
                fillColor: Cesium.Color.WHITE,
                showBackground: true,
                backgroundColor: Cesium.Color.BLACK,
                disableDepthTestDistance: 100000000000,
                eyeOffset: new Cesium.Cartesian3(0, 0, -10),
                ...style
            });
        },

        // 清除绘制的点/线/标注
        removePointLineLabel: () => {
            if (this.measure.pointCollection) this.measure.pointCollection.removeAll();
            if (this.measure.lineCollection) this.measure.lineCollection.removeAll();
            if (this.measure.labelCollection) this.measure.labelCollection.removeAll();
        },

        // 移除事件监听
        removeEventListener: () => {
            if (!this.measure.handler) return;
            this.measure.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.measure.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            this.measure.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        },

        // 获取交跨线
        getCrossLine(points: Array<Cesium.Cartesian3>): [Cesium.Cartesian3, Cesium.Cartesian3, number] {
            const that = this.self
            let p0 = points[0];
            let p1 = points[1];
            let p2 = points[2];
            let p3 = points[3];

            let p00 = that.CartesianToMercator(p0);
            let p11 = that.CartesianToMercator(p1);
            let p22 = that.CartesianToMercator(p2);
            let p33 = that.CartesianToMercator(p3);

            let tp0 = new TPoint(p00[0], p00[1]);
            let tp1 = new TPoint(p11[0], p11[1]);
            let tp2 = new TPoint(p22[0], p22[1]);
            let tp3 = new TPoint(p33[0], p33[1]);

            let tline1 = new TLine(tp0, tp1);
            let tline2 = new TLine(tp2, tp3);
            let cp = tline1.crossPoint(tline2);
            let result1 = tline1.nearestPoint(cp!);
            let result2 = tline2.nearestPoint(cp!);
            let cpz1 = p00[2] + (p11[2] - p00[2]) * result1[1];
            let cpz2 = p22[2] + (p33[2] - p22[2]) * result2[1];
            let pp1 = that.MercatorToCartesian(result1[0].x, result1[0].y, cpz1);
            let pp2 = that.MercatorToCartesian(result2[0].x, result2[0].y, cpz2);
            let dz = Math.abs(cpz1 - cpz2);

            return [pp1, pp2, dz];
        },

        // 初始化
        init() {
            this.points = [];
            const that = this.self;
            this.pointCollection = new Cesium.PointPrimitiveCollection();
            (this.pointCollection as any).layerName = 'pointCollection';
            that.viewer.scene.primitives.add(this.pointCollection);
            this.lineCollection = new Cesium.PolylineCollection();
            (this.lineCollection as any).layerName = 'lineCollection';
            that.viewer.scene.primitives.add(this.lineCollection);
            this.labelCollection = new Cesium.LabelCollection();
            (this.labelCollection as any).layerName = 'labelCollection';
            that.viewer.scene.primitives.add(this.labelCollection);
            this.handler = new Cesium.ScreenSpaceEventHandler(that.viewer.scene.canvas);
        },

        /**
         * @name: distance
         * @Date: 2022-04-29 10:24:46
         * @description: 距离测量
         */
        distance() {
            this.remove();
            const that = this.self;
            this.init();
            // 左键单击测量
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                let ray = that.viewer.camera.getPickRay(click.position);
                let cartesian = that.viewer.scene.globe.pick(ray!, that.viewer.scene);
                if (cartesian) {
                    this.points.push(cartesian);
                    let tempLength = this.points.length;
                    this.drawPoint(this.points[this.points.length - 1]);
                    if (tempLength > 1) {
                        let p1 = this.points[this.points.length - 2];
                        let p2 = this.points[this.points.length - 1];
                        this.drawLine([p1, p2]);
                        let length = Cesium.Cartesian3.distance(p1, p2);
                        this.drawLabel(`label${this.points.length}`, p2, `${length.toFixed(2)}米`);
                    } else {
                        this.drawLabel('label1', cartesian, '起点');
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            // 左键双击结束测量
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                if (this.points.length < 2) {
                    alert("至少点击两个点！");
                    return;
                }
                let ray = that.viewer.camera.getPickRay(click.position);
                let cartesian = that.viewer.scene.globe.pick(ray!, that.viewer.scene)!;
                let totalLen = 0.0;
                for (let i = 1; i < this.points.length; i++) {
                    let len = Cesium.Cartesian3.distance(this.points[i - 1], this.points[i]);
                    totalLen = totalLen + len;
                }
                if (totalLen > 0) {
                    this.labelCollection?.remove(this.labelCollection.get(this.points.length - 1));
                    this.labelCollection?.remove(this.labelCollection.get(this.points.length - 2));
                    this.drawLabel(`label${this.points.length}`, cartesian, `总长: ${totalLen.toFixed(2)}米`);
                }
                this.removeEventListener();
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        },

        /**
         * @name: area
         * @Date: 2022-05-05 09:35:18
         * @description: 面积测量
         * @param {any} pointColor 点颜色
         * @param {any} lineColor 线颜色
         */
        area(pointColor?: any, lineColor?: any) {
            this.remove();
            const that = this.self;
            this.init();
            // 左键单击测量
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                let ray = that.viewer.camera.getPickRay(click.position);
                let cartesian = that.viewer.scene.globe.pick(ray!, that.viewer.scene);
                if (cartesian) {
                    this.points.push(cartesian);
                    this.drawPoint(this.points[this.points.length - 1], pointColor);

                    if (this.points.length > 1) {
                        this.drawLine([this.points[this.points.length - 2], this.points[this.points.length - 1]], lineColor);
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            // 右键单击结束测量
            this.handler?.setInputAction((click: any) => {
                if (this.points.length < 3) {
                    alert('请点击至少三个点！');
                    return;
                }
                this.drawLine([this.points[0], this.points[this.points.length - 1]], lineColor);
                let pnts: any = [];
                this.points.forEach((p) => {
                    let cartographic = Cesium.Cartographic.fromCartesian(p);
                    let lon = Cesium.Math.toDegrees(cartographic.longitude);
                    let lat = Cesium.Math.toDegrees(cartographic.latitude);
                    pnts.push([lon, lat]);
                });
                pnts.push(pnts[0]);
                let polygon = turf.polygon([pnts]);
                let area = turf.area(polygon);
                this.drawLabel(`label${this.points.length}`, this.points[this.points.length - 1], `面积: ${area.toFixed(2)} ㎡`);
                this.removeEventListener();
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },

        /**
         * @name: ground
         * @Date: 2022-05-05 10:02:12
         * @description: 对地距离测量
         */
        ground() {
            this.remove();
            const that = this.self;
            this.init();
            // 左键单击测量
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                let pickedObject = that.viewer.scene.pick(click.position);
                if (that.viewer.scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    let cartesian = that.viewer.scene.pickPosition(click.position);
                    if (Cesium.defined(cartesian)) {
                        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        let ray = that.viewer.camera.getPickRay(click.position);
                        let cartesian2 = that.viewer.scene.globe.pick(ray!, that.viewer.scene);
                        let cartographic2 = Cesium.Cartographic.fromCartesian(cartesian2!);
                        let cartographic3 = new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, cartographic2.height);
                        let cartesian3 = Cesium.Cartographic.toCartesian(cartographic3);
                        let condHeight = cartographic.height - cartographic2.height;
                        if (condHeight > 0) {
                            this.removePointLineLabel();
                            this.drawPoint(cartesian);
                            this.drawPoint(cartesian3);
                            this.drawLine([cartesian, cartesian3], Cesium.Color.GREENYELLOW);
                            this.drawLabel('对地距离', cartesian, `对地距离: ${condHeight.toFixed(2)}米`);
                        }
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },

        /**
         * @name: spaceDistance
         * @Date: 2022-05-05 10:25:45
         * @description: 空间距离测量
         */
        spaceDistance() {
            this.remove();
            const that = this.self;
            this.init();
            // 左键单击测量
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                let pickedObject = that.viewer.scene.pick(click.position);
                if (that.viewer.scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    let cartesian = that.viewer.scene.pickPosition(click.position);
                    if (Cesium.defined(cartesian)) {
                        this.points.push(cartesian)
                        this.drawPoint(cartesian);
                        if (this.points.length >= 2) {
                            this.drawLine([this.points[0], this.points[1]], Cesium.Color.GREENYELLOW);
                            let length = Cesium.Cartesian3.distance(this.points[0], this.points[1]);
                            let centerPt = that.getCenterPoint(this.points[0], this.points[1]);
                            this.drawLabel('空间距离', centerPt, `空间距离: ${length.toFixed(2)}米`, {
                                pixelOffset: new Cesium.Cartesian2(-40, -20)
                            });
                            this.removeEventListener();
                        }
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },

        /**
         * 空间最短距离量测
         */
        spaceShortestDistance() {
            this.remove()
            this.init();
            const that = this.self;
            // 左键单击测量
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                if (!that.viewer.scene.pickPositionSupported) {
                    return;
                }

                if (this.points.length >= 3) {
                    return ElMessage({
                        type: 'warning',
                        message: '空间最短距离测量只需要选取三个点'
                    });
                }

                let pickedPoint = that.viewer.scene.pick(click.position, 1, 1);

                if (!pickedPoint || !Cesium.defined(pickedPoint) || !(pickedPoint.primitive instanceof Cesium.Cesium3DTileset)) {
                    return ElMessage({
                        type: 'warning',
                        message: '请点击点云导线上的点'
                    });
                }

                let cartesian3 = that.viewer.scene.pickPosition(click.position)

                this.points.push(cartesian3)
                this.drawPoint(cartesian3)
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            let p0, p1, p2, p00, p11, p22, tp0, tp1, tp2;
            // 右键单击结束测量
            this.handler?.setInputAction((click: any) => {
                let tmpPoints = this.points;

                if (tmpPoints.length < 3) return ElMessage({
                    type: 'warning',
                    message: '空间最短距离测量需选取三个点'
                });

                p0 = tmpPoints[0];
                p1 = tmpPoints[1];
                p2 = tmpPoints[2];
                this.drawLine([p1, p2], Cesium.Color.GREENYELLOW);
                p00 = that.CartesianToMercator(p0);
                p11 = that.CartesianToMercator(p1);
                p22 = that.CartesianToMercator(p2);

                tp0 = new TPoint(p00[0], p00[1]);
                tp1 = new TPoint(p11[0], p11[1]);
                tp2 = new TPoint(p22[0], p22[1]);

                let tline = new TLine(tp1, tp2);
                let result = tline.nearestPoint(tp0);
                // z = y1 + (y2 - y1) * r
                let cpz = p11[2] + (p22[2] - p11[2]) * result[1];

                // 垂足坐标
                let pp = that.MercatorToCartesian(result[0].x, result[0].y, cpz);
                let dist = Cesium.Cartesian3.distance(p0, pp)
                this.drawPoint(pp, Cesium.Color.BLUE);
                this.drawLine([p0, pp], Cesium.Color.BLUE);
                let centerPt = that.getCenterPoint(p0, pp);
                this.drawLabel('最短距离', centerPt, `最短距离: ${dist.toFixed(2)}米`);
                this.points = []
                this.removeEventListener();
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },

        /**
         * @name: crossDistance
         * @Date: 2022-05-06 09:45:05
         * @description: 交跨距离测量
         */
        crossDistance() {
            this.remove();
            const that = this.self;
            this.init();
            // 鼠标样式变成十字
            (that.viewer as any)._container.style.cursor = "crosshair";
            let leyersTypetArr: any = [];
            this.handler?.setInputAction((click: { position: Cesium.Cartesian2; }) => {
                let pickedObject = that.viewer.scene.pick(click.position);
                if (that.viewer.scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    let cartesian = that.viewer.scene.pickPosition(click.position);
                    if (Cesium.defined(cartesian)) {
                        let leyersType = pickedObject.primitive.layerName;
                        // let leyersType = pickedObject.primitive.id;
                        // 用于判断点击的是否为导线类型
                        let isLineType = leyersType.indexOf('linePointClound') > -1;
                        // let isLineType = true;
                        if (isLineType) {
                            // 当前点所在导线的类型名称
                            let currentLineType = leyersType;
                            // 上一个点所在导线的类型名称
                            let prevLineType = leyersTypetArr[leyersTypetArr.length - 1];
                            // 当前点击的点为第二个或者第四个点时
                            if (leyersTypetArr.length && leyersTypetArr.length % 2 == 1) {
                                // 当前点和上一个点 点击的是同一个交跨线路
                                if (currentLineType == prevLineType) {
                                    leyersTypetArr.push(currentLineType);
                                } else {
                                    alert('第' + (leyersTypetArr.length + 1) + '个点请选择和前一个点在同一导线上取点')
                                    return;
                                }
                            }
                            // 当前点击的点为第一个或者第三个点时
                            else {
                                // 当前点击的点为第三个点时
                                if (leyersTypetArr.length && leyersTypetArr.length == 2) {
                                    // 当前点和上一个点 点击的是不同的交跨线路
                                    if (currentLineType != prevLineType) {
                                        leyersTypetArr.push(currentLineType);
                                    } else {
                                        alert('请在另外一条交跨导线上取点')
                                        return;
                                    }
                                } else {
                                    leyersTypetArr.push(currentLineType);
                                }
                            }
                            this.points.push(cartesian)
                            this.drawPoint(cartesian);
                            if (this.points.length >= 4) {
                                let [p1, p2, dist] = this.getCrossLine(this.points);
                                this.removePointLineLabel();
                                this.drawPoint(p1);
                                this.drawPoint(p2);
                                this.drawLine([p1, p2], Cesium.Color.GREENYELLOW);
                                let centerPt = that.getCenterPoint(p1, p2);
                                this.drawLabel('交跨距离', centerPt, `交跨距离: ${(dist as number).toFixed(2)}米`);
                                this.points = []
                                this.removeEventListener();
                                (that.viewer as any)._container.style.cursor = "default";
                                return
                            }
                        } else {
                            alert('请点击导线上的点')
                        }
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },

        /**
         * @name: remove
         * @Date: 2022-04-29 17:15:35
         * @description: 清除测量
         */
        remove() {
            const that = this.self;
            this.removePointLineLabel();
            this.removeEventListener();
            // 鼠标样式恢复默认
            (that.viewer as any)._container.style.cursor = "default";
        },
    }

}

/**
 * TPoint 平面点
 */
class TPoint {

    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    };

    /**
     * 平面两点之间的距离
     * @param toPt
     * @returns {number}
     */
    distance(toPt: TPoint): number {
        return Math.sqrt((toPt.x - this.x) * (toPt.x - this.x) + (toPt.y - this.y) * (toPt.y - this.y));
    };
}

/**
 * 平面直线
 */
class TLine {

    startPoint: TPoint; // 线段起始点
    endPoint: TPoint; // 线段结束点
    B: number; // 斜率

    constructor(pt1: TPoint, pt2: TPoint) {
        this.startPoint = pt1;
        this.endPoint = pt2;
        this.B = (pt2.y - pt1.y) / (pt2.x - pt1.x)
    };

    getAngle(o: TPoint, s: TPoint, e: TPoint) {
        let dsx = s.x - o.x;
        let dsy = s.y - o.y;
        let dex = e.x - o.x;
        let dey = e.y - o.y;
        let cosfi = dsx * dex + dsy * dey;
        let norm = (dsx * dsx + dsy * dsy) * (dex * dex + dey * dey);
        cosfi = cosfi / Math.sqrt(norm);
        if (cosfi >= 1.0) return 0;
        if (cosfi <= -1.0) return Math.PI;
        let fi = Math.acos(cosfi);
        return fi;
    };

    /**
     *
     * @param start 线段起始点
     * @param p 顶点
     * @param end 线段结束点
     * @returns 顶点与直线的夹角角度值
     */
    getPoleAngle(start: TPoint, p: TPoint, end: TPoint): number {
        let sp = p.distance(start)
        let pe = p.distance(end)
        let se = start.distance(end)

        let cosfi = (Math.pow(se, 2) + Math.pow(sp, 2) - Math.pow(pe, 2)) / (2 * se * sp)
        let fi = Math.acos(cosfi)

        return fi
    };

    /**
     *
     * @param p 平面顶点坐标
     * @returns {[TPoint, r]} // 顶到到直线的最短距离，即垂足平面坐标
     */
    nearestPoint(p: TPoint): [TPoint, number] {
        let ps = p.distance(this.startPoint);
        let se = this.startPoint.distance(this.endPoint);
        // let a = this.getAngle(this.startPoint, p, this.endPoint);
        let a = this.getPoleAngle(this.startPoint, p, this.endPoint);
        let r = ps * Math.cos(a) / se;
        return [
            new TPoint(
                this.startPoint.x + r * (this.endPoint.x - this.startPoint.x),
                this.startPoint.y + r * (this.endPoint.y - this.startPoint.y)
            ),
            r
        ];
    };

    crossPoint(p: TLine): (TPoint | null) {
        if (this.B == p.B) {
            return null;
        }
        let x = (this.B * this.startPoint.x - p.B * p.startPoint.x - this.startPoint.y + p.startPoint.y) / (this.B - p.B);
        let y = this.B * x - this.B * this.startPoint.x + this.startPoint.y;
        return new TPoint(x, y);
    };
}

