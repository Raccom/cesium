import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import CZML from './CZML.vue'
import Demo from './Demo.vue'
import Measure from './Measure.vue'
import csdn from './csdn.vue'
import Measure2 from './Measure2.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(csdn).use(ElementPlus).mount('#app')
