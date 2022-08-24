<template>
  <div class="container thin-border large-radius">
    <el-container style="height: 100%;" direction="vertical">
      <el-header style="height:auto">
        <pane-header :title="title">
          <template v-slot:title>
            <Icon icon="ic:round-account-tree" color="gray" height="24px"
              style="vertical-align: middle;margin-right: 5px" />
            <span>{{ title }}</span>
          </template>
          <template v-slot:extra>
            <el-tooltip effect="light" content="设置" placement="bottom">
              <el-button icon="Setting" @click="openSettingsModal" circle />
            </el-tooltip>
            <el-tooltip effect="light" content="导入文件" placement="bottom">
              <el-button icon="FolderOpened" @click="openImportFileModal" circle :disabled="store.getters.mode=='client'"/>
            </el-tooltip>
            <el-tooltip effect="light" content="复制XML" placement="bottom">
              <el-button icon="DocumentCopy" @click="copyXmlHandle" :disabled="!store.getters.isOk" circle />
            </el-tooltip>
            <el-tooltip effect="light" content="搜索" placement="bottom">
              <el-button icon="Search" @click="openSearchModal" circle :disabled="store.getters.mode!='client'" />
            </el-tooltip>
          </template>
        </pane-header>
      </el-header>
      <div ref="treeContainerRef" class="tree-container">
        <el-scrollbar height="100%">
          <el-tree class="el-scrollbar" ref="nodeTreeRef" :data="nodeTree" :props="treeProps" node-key="cacheId"
            :highlight-current="true" :default-expand-all="false" :current-node-key="currentNode"
            :expand-on-click-node="false" :height="treeContainerRef && treeContainerRef.clientHeight"
            @node-click="nodeClickHandle" width="auto">
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span class="label-class">&lt;node</span>
                <span class="label-extra">
                  <span class="label-extra-label" v-if="data.class">
                    class="<span class="label-extra-value">{{ data.class }}</span>"
                  </span>
                  <span class="label-extra-label" v-if="data.resourceId">
                    resource-id="<span class="label-extra-value">{{ data.resourceId }}</span>"
                  </span>
                  <span class="label-extra-label" v-if="data.contentDesc">
                    content-desc="<span class="label-extra-value">{{ data.contentDesc }}</span>"
                  </span>&gt;
                </span>
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>
    </el-container>
  </div>
</template>

<script setup>

import { useStore } from "vuex";
import bus from "@/common/bus";
import { ElMessage } from "element-plus";

const { ipcRenderer } = require("electron");

const store = useStore();
let title = ref('Layout Tree')
const customNodeClass = (data, node) => {
  if (store.getters.excludeNodes.indexOf(data.cacheId) > -1) {
    return 'exclude-node';
  }
  return null;
}
let treeProps = ref({
  label: 'class',
  children: 'children',
  class: customNodeClass
});
let currentNode = ref();
let nodeTreeRef = ref();
let treeContainerRef = ref();
onMounted(() => {
  // 因为element ui的tree组件不是响应式的，不能通过vuex的数据来驱动，所以使用了busEvent来实现组件间的通讯
  bus.$on("changeCurrentNode", (cacheId) => {
    console.log("changeCurrentNode:", cacheId);
    nodeTreeRef.value.setCurrentKey(cacheId);
  });
})
onMounted(() => {
  // store.dispatch('convertNodeTree');
})
const nodeTree = computed(() => {
  return store.getters.nodeTree;
})
const nodeClickHandle = (data, node) => {
  let event = window.event;
  // 按着ctrl点击的节点
  if (event.ctrlKey) {
    console.log("nodeClickWithCtrl:", data.cacheId);
    store.dispatch('toggleExcludeNode', data.cacheId);
  } else {
    console.log("nodeClick:", data.cacheId);
    store.commit('setCurrentNode', data.cacheId);
  }
}
const openSettingsModal = () => {
  bus.$emit('openSettingsModal');
}
const openImportFileModal = () => {
  bus.$emit('openImportFileModal');
}
const openSearchModal = () => {
  bus.$emit('openSearchModal');
}
const copyXmlHandle = () => {
  if (originXml.value) {
    ipcRenderer.send('setClipboard', originXml.value);
    ElMessage({
      message: '复制成功',
      type: 'success',
    })
  }
}
const originXml = computed(() => {
  return store.getters.originXml;
})
</script>

<style scoped>
.el-tree {
  min-width: 100%;
  display: inline-block !important;
}

.el-header,
el-main {
  padding: 0;
}

.tree-container {
  height: calc(100% - 7vh);
  overflow-y: hidden;
  text-align: center;
  margin-top: 1px;
  font-size: 14px;
}

.label-class {
  font-size: 14px;
}

.label-extra-label {
  margin-left: 8px;
  font-size: 14px;
  color: #9da8a9;
}

.label-extra-value {
  font-size: 14px;
  color: #6f7e85;
}

/deep/ .exclude-node>.el-tree-node__content {
  background: rgba(252, 224, 136, 0.2) !important;
}
</style>
