<script setup>
import LayoutDisplayPane from "@/components/layout-analyzer/LayoutDisplayPane.vue";
import LayoutTreePane from "@/components/layout-analyzer/LayoutTreePane.vue";
import NodeInfoPane from "@/components/layout-analyzer/NodeInfoPane.vue";
import SettingsModal from "@/components/settings/SettingsModal.vue";
import bus from "@/common/bus";
import {useStore} from "vuex";
import ImportFileModal from "@/components/improt-file/ImportFileModal.vue";

const {ipcRenderer} = require('electron')
const store = useStore();
onMounted(() => {
  bus.$on('openSettingsModal', () => {
    store.commit('showSettingsModal');
  });
  bus.$on('openImportFileModal', () => {
    store.commit('showImportFileModal');
  });
})
onMounted(async () => {
  // let devices = await ipcRenderer.invoke('loadDevices');
  // console.log(devices);
})
let leftStyle = ref({
  marginLeft: '10px',
  marginTop: '10px',
  marginBottom: '10px',
  flex: 'unset',
})
let centerStyle = {
  marginLeft: '10px',
  marginTop: '10px',
  marginBottom: '10px',
  flex: 1,
}
let rightStyle = {
  marginLeft: '10px',
  marginRight: '10px',
  marginTop: '10px',
  marginBottom: '10px',
  flex: .5,
  minWidth: '380px'
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-main :style="leftStyle">
        <layout-display-pane :parentStyle="leftStyle"/>
      </el-main>
      <el-main :style="centerStyle">
        <layout-tree-pane/>
      </el-main>
      <el-main :style="rightStyle">
        <node-info-pane/>
      </el-main>
      <div>
        <settings-modal/>
        <import-file-modal/>
      </div>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout, .el-container {
  height: 100%;
  width: 100%;
}

.common-layout {
  box-shadow: inset #c0bfbf 0 -1px 5px;
}

.el-main {
  padding: 0 !important;
}
</style>
