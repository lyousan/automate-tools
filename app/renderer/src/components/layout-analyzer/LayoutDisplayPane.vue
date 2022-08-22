<template>
  <el-main class="thin-border large-radius" style="height: 100%">
    <el-container style="height: 100%;" direction="vertical">
      <el-header>
        <pane-header>
          <template v-slot:title>
            <Icon icon="ant-design:layout-filled" color="gray" height="24px"
                  style="vertical-align: middle;margin-right: 5px"/>
            <span>{{ title }}{{ isOK }}</span>
          </template>
          <template v-slot:extra>
            <el-tooltip
                effect="light"
                content="刷新"
                placement="bottom"
            >
              <el-button @click="refreshHandle" icon="Refresh" circle style="cursor: pointer"/>
            </el-tooltip>
          </template>
        </pane-header>
      </el-header>
      <div class="layout-container" :style="{width:capImgLoaded?'auto':'24vw'}">
        <ElImage ref="capImgRef" @load="capImgLoadHandle" :src="capFilePath" alt=""
                 style="height: 100%">
          <template #error>
            <div class="image__error">
              <el-icon>
                <Picture/>
              </el-icon>
            </div>
          </template>
        </ElImage>
        <div class="structure-container" @mouseover="handleNodeMouseover" @mouseover.ctrl="handleNodeMouseoverWithCtrl"
             @mouseout="activeNodes=[];activeCtrlNodes=[]">
          <template v-for="(v,i) in renderedNodeCache.values()" :key="v.cacheId">
            <div :cacheId="v.cacheId" class="node"
                 :class="{'active':isActive(v.cacheId),'active-ctrl':isActiveCtrl(v.cacheId),'clicked':currentNode.cacheId===v.cacheId,'exclude':isExclude(v.cacheId)}"
                 @click="handleNodeClick"
                 @click.ctrl="handleNodeClickWithCtrl"
                 :style="v.style"></div>
          </template>
        </div>
      </div>
    </el-container>
  </el-main>
</template>

<script setup>
import {ref} from "vue";
import {useStore} from "vuex";
import bus from "@/common/bus";
import {ElLoading, ElMessage} from "element-plus";

const {ipcRenderer} = require("electron");
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
    let scaleRate = getLayoutImgSize().width / capImgOriginSize.value.width;
    store.dispatch('renderNodeCache', {scaleRate: scaleRate});
  })
}
/**
 * 刷新，重置一些变量，重新初始化
 */
const refreshHandle = async () => {
  const doHandle = async () => {
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
    let capFilePath = await ipcRenderer.invoke('screenCap', {
      udid: store.getters.currentDevice,
      filename: `layout_${timestamp}.png`
    });
    let {data} = await ipcRenderer.invoke('automate-dump', {filename: `layout_${timestamp}.xml`});
    store.commit('setCapFilePath', {filepath: capFilePath});
    store.commit('setXmlFilePath', {filepath: data});
    // init();
    loading.value.close();
  };
  doHandle();
  setTimeout(() => {
    if (loading.value.visible) {
      console.error("加载失败");
      ElMessage({
        message: '加载失败，即将重试',
        type: 'error',
      });
      doHandle();
    }
  }, 20 * 1000);
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
  debugger
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
}

.el-header, el-main {
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
</style>
