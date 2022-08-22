import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import 'element-plus/dist/index.css'
import './assets/main.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {Icon} from '@iconify/vue'

let app = createApp(App);
app.use(store);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.component('Icon', Icon);
app.mount('#app');
