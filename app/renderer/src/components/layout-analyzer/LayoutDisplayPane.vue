<template>
  <el-main class="thin-border large-radius" style="height: 100%">
    <el-container style="height: 100%;" direction="vertical">
      <el-header style="height:auto">
        <pane-header>
          <template v-slot:title>
            <Icon icon="ant-design:layout-filled" color="gray" height="24px"
              style="vertical-align: middle;margin-right: 5px" />
            <span>{{ title }}</span>
          </template>
          <template v-slot:extra>
            <el-tooltip effect="light" content="刷新" placement="bottom">
              <el-button @click="refreshHandle" :disabled="!store.getters.isOk" icon="Refresh" circle />
            </el-tooltip>
          </template>
        </pane-header>
      </el-header>
      <div class="layout-container" @mousemove="handleMousemove" @click="handleClickForPoint"
        :style="{ width: capImgLoaded ? 'auto' : '24vw' }">
        <div class="startPoint"
          v-show="(store.getters.isClicking || store.getters.isSwiping) && store.getters.startPoint.x"
          :style="[{ top: startPoint.y - 15 + 'px' }, { left: startPoint.x - 15 + 'px' }]">
          <!-- 15 是球球的半径 -->
        </div>
        <div class="coord" v-show="store.getters.isClicking || store.getters.isSwiping">
          <span>X: {{ point.x }}</span>
          <span>Y: {{ point.y }}</span>
          <!-- <br />
          {{ store.getters.startPoint }}
          <br />
          {{ store.getters.endPoint }} -->
        </div>
        <ElImage ref="capImgRef" @load="capImgLoadHandle" :src="capFilePath" alt="" style="height: 100%">
          <template #error>
            <div class="image__error">
              <el-icon>
                <Picture />
              </el-icon>
            </div>
          </template>
        </ElImage>
        <div class="structure-container" @mouseover="handleNodeMouseover" @mouseover.ctrl="handleNodeMouseoverWithCtrl"
          @mouseout="activeNodes = []; activeCtrlNodes = []">
          <template v-for="(v, i) in renderedNodeCache.values()" :key="v.cacheId">
            <div :cacheId="v.cacheId" class="node"
              :class="{ 'active': isActive(v.cacheId), 'active-ctrl': isActiveCtrl(v.cacheId), 'clicked': currentNode.cacheId === v.cacheId, 'exclude': isExclude(v.cacheId) }"
              @click="handleNodeClick" @click.ctrl="handleNodeClickWithCtrl" :style="v.style"></div>
          </template>
        </div>
      </div>
    </el-container>
  </el-main>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import bus from "@/common/bus";
import { ElLoading, ElMessage } from "element-plus";

const { ipcRenderer } = require("electron");
const store = useStore();
const sizeOf = require('image-size')
const props = defineProps(['parentStyle'])
const loading = ref();
let title = ref("Layout Display");
let capImgLoaded = ref(false);
let capImgOriginSize = ref();
let capImgRef = ref();
let activeNodes = ref([]);
let activeCtrlNodes = ref([]);
let scaleRate = ref();
let point = ref({});
let startPoint = ref({});
let endPoint = ref({});
onMounted(() => {
  bus.$on('refreshLayout', () => {
    refreshHandle();
  });
})
/**
 * 监听窗口尺寸变化的事件，因为采用了flex布局，当窗口尺寸发生变化时，外层的节点会跟随着改变，
 * 最终影响到布局结构，就会导致缩放窗口后，鼠标再滑动到布局节点上时会出现布局结构的尺寸与图片对应不上的问题
 */
window.onresize = () => {
  console.log("resize");
  if (store.getters.isOk) {
    renderLayout();
  }
}
const handleClickForPoint = async (ev) => {
  if (!store.getters.isSwiping && !store.getters.isClicking) {
    return
  }
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  console.log(ev.offsetX, ev.offsetY);
  point.value = { x: Math.floor(ev.offsetX / scaleRate.value), y: Math.floor(ev.offsetY / scaleRate.value) };
  console.log('point:', point);
  if (!store.getters.startPoint.x) {
    store.commit('setStartPoint', point.value);
  } else {
    store.commit('setEndPoint', point.value);
  }
  let response = null;
  if (store.getters.isClicking) {
    response = await ipcRenderer.invoke('automate-global-click', { x: store.getters.startPoint.x, y: store.getters.startPoint.y });
    store.commit('setStartPoint', {});
    store.commit('setClicking', false);
  } else if (store.getters.isSwiping && store.getters.endPoint.x) {
    let points = [{ x: store.getters.startPoint.x, y: store.getters.startPoint.y }, { x: store.getters.endPoint.x, y: store.getters.endPoint.y }];
    console.log('swpie:', points);
    response = await ipcRenderer.invoke('automate-global-swipe', [{ x: store.getters.startPoint.x, y: store.getters.startPoint.y }, { x: store.getters.endPoint.x, y: store.getters.endPoint.y }]);
    store.commit('setStartPoint', {});
    store.commit('setEndPoint', {});
    store.commit('setSwiping', false);
  } else {
    loading.value.close();
    return;
  }
  document.querySelector('body').style.cursor = 'auto';
  document.querySelector('.layout-container .el-image').style.zIndex = 0;
  loading.value.close();
  if (response && response.code != 200) {
    ElMessage({
      message: response.msg,
      type: 'error'
    })
    return
  }
  bus.$emit('refreshLayout');
}
const handleMousemove = (ev) => {
  if ((store.getters.isClicking || store.getters.isSwiping)) {
    console.log(ev.offsetX, ev.offsetY);
    point.value = { x: ev.offsetX, y: ev.offsetY };
    if (!store.getters.startPoint.x) {
      startPoint.value = point.value;
    } else {
      endPoint.value = point.value;
    }
  }
}
/**
 * 初始化：加载图片 加载xml 渲染布局结构
 */
const init = () => {
  if (store.getters.isOk) {
    console.log("init");
    renderLayout();
    store.dispatch('loadNodeTree');
  }
}

const renderLayout = () => {
  /**
   * 初始化图片的原始尺寸
   */
  const initLayoutImgOriginSize = () => {
    capImgOriginSize.value = sizeOf(capFilePath.value);
  };
  /**
   * 获取图片在界面上显示的尺寸
   */
  const getLayoutImgSize = () => {
    return {
      width: capImgRef.value.$el.clientWidth,
      height: capImgRef.value.$el.clientHeight
    }
  };
  initLayoutImgOriginSize();
  nextTick(() => {
    scaleRate.value = getLayoutImgSize().width / capImgOriginSize.value.width;
    store.dispatch('renderNodeCache', { scaleRate: scaleRate.value });
  })
}

/**
 * 刷新，重置一些变量，重新初始化
 */
const refreshHandle = async () => {
  const doHandle = async (timer) => {
    if (!store.getters.isOk) {
      console.log('请先创建连接或手动选择布局文件');
      return;
    }
    loading.value = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    activeNodes.value = [];
    store.commit('clearCurrentNode');
    store.commit('clearExcludeNodes');
    // TODO 更换图片/xml资源
    let timestamp = new Date().getTime();
    let { data } = await ipcRenderer.invoke('automate-dump', { filename: `layout_${timestamp}.xml` });
    let capFilePath = await ipcRenderer.invoke('screenCap', {
      udid: store.getters.currentDevice,
      filename: `layout_${timestamp}.png`
    });
    store.commit('setXmlFilePath', { filepath: data });
    store.commit('setCapFilePath', { filepath: capFilePath });
    // init();
    loading.value.close();
    clearTimeout(timer);
  };
  let timer = setTimeout(() => {
    if (loading.value && loading.value.visible) {
      console.error("加载失败");
      ElMessage({
        message: '加载失败，即将重试',
        type: 'error',
      });
      doHandle();
    }
  }, 20 * 1000);
  doHandle(timer);
};
/**
 * 布局节点的鼠标滑动事件处理，为当前鼠标指向的节点添加高亮处理
 * @param ev
 */
const handleNodeMouseover = (ev) => {
  let cacheId = ev.target.attributes.cacheid.value;
  // console.log(cacheId);
  activeNodes.value = [];
  activeNodes.value.push(cacheId);
  activeCtrlNodes.value = [];
}
const handleNodeMouseoverWithCtrl = (ev) => {
  let cacheId = ev.target.attributes.cacheid.value;
  activeNodes.value = [];
  activeCtrlNodes.value = [];
  activeCtrlNodes.value.push(cacheId);
}

/**
 * 布局节点的鼠标点击事件处理，为当前鼠标点击的节点添加高亮处理
 * @param ev
 */
const handleNodeClick = (ev) => {
  let cacheId = ev.target.attributes.cacheid.value;
  console.log('clicked:', cacheId);
  store.dispatch('setCurrentNode', cacheId);
  bus.$emit("changeCurrentNode", cacheId);
}
const handleNodeClickWithCtrl = (ev) => {
  let cacheId = ev.target.attributes.cacheid.value;
  console.log(cacheId);
  excludeNodes.value.push(cacheId);
}
const isActive = (cacheId) => {
  return activeNodes.value.indexOf(cacheId) > -1;
}
const isActiveCtrl = (cacheId) => {
  return activeCtrlNodes.value.indexOf(cacheId) > -1;
}
const isExclude = (cacheId) => {
  return excludeNodes.value.indexOf(cacheId) > -1;
}
/**
 * 图片加载完成后的处理，加载完成主要意味着图片在界面上显示完成了，可以获取到正常的图片尺寸了，在此之前获取到的图片尺寸可能并不完整
 * @param event
 */
const capImgLoadHandle = (event) => {
  console.log('capImgLoaded')
  capImgLoaded.value = true;
  renderLayout();
  store.dispatch('loadNodeTree');
}

const renderedNodeCache = computed(() => {
  return store.getters.renderedNodeCache;
})

const currentNode = computed(() => {
  return store.getters.currentNode;
})

const excludeNodes = computed(() => {
  return store.getters.excludeNodes;
})

const xmlFilePath = computed(() => {
  return store.getters.xmlFilePath;
})

const capFilePath = computed(() => {
  return store.getters.capFilePath;
})
</script>

<style scoped>
.layout-container {
  height: calc(100% - 7vh);
  /*background: #fcc;*/
  position: relative;
  overflow: hidden;
  text-align: center;
  margin-top: 1px;
}

.el-header,
el-main {
  padding: 0;
}

.el-main {
  --el-main-padding: 0
}

.structure-container {
  position: absolute;
  top: 0;
}

.el-image {
  height: calc(100% - 100px);
}

.node {
  position: absolute;
}

.active {
  background-color: rgba(255, 205, 210, .5);
}

.active-ctrl {
  background: rgba(252, 224, 136, .5);
}

.clicked {
  background: rgba(156, 189, 232, 0.5);
}

.exclude {
  display: none;
}

.el-image {
  width: 100%;
}

.image__error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 90px;
}

/deep/ .image-slot .el-icon {
  font-size: 30px;
}

.startPoint {
  position: absolute;
  height: 30px;
  width: 30px;
  background-color: #fcc;
  opacity: .8;
  z-index: 2;
  border-radius: 50%;
}

.coord {
  text-align: left;
  position: absolute;
  padding: 8px;
  width: 80px;
  background-color: #fcc;
  opacity: .8;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.coord span {
  display: inline-block;
  width: 40px;
}

.show {
  display: block !important;
}

.hide {
  display: none !important;
}
</style>
