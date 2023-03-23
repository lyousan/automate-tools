<template>
  <div class="container thin-border large-radius">
    <el-container style="height: 100%;" direction="vertical">
      <el-header style="height:auto">
        <pane-header :title="title">
          <template v-slot:title>
            <Icon icon="akar-icons:info-fill" color="gray" height="24px"
              style="vertical-align: middle;margin-right: 5px" />
            <span>{{ title }}</span>
          </template>
          <template v-slot:extra>
            <!--      暂无更多的功能      -->
          </template>
        </pane-header>
      </el-header>
      <div class="info-container">
        <el-scrollbar height="100%">
          <div style="padding: 12px">
            <el-row>
              <el-col :span="24">
                <el-button-group>
                  <el-tooltip effect="light" content="点击节点" placement="bottom">
                    <el-button @click="nodeClickHandle" :disabled="currentMode !== 'client' || !currentNode.cacheId"
                      type="">
                      <Icon icon="icon-park-outline:click-tap" />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip effect="light" content="输入" placement="bottom">
                    <el-button @click="openInputModal" :disabled="currentMode !== 'client' || !currentNode.cacheId"
                      type="" icon="EditPen" />
                  </el-tooltip>
                </el-button-group>
                <el-button-group style="margin-left:12px">
                  <el-tooltip effect="light" content="点击" placement="bottom">
                    <el-button @click="globalClickHandle"
                      :disabled="currentMode !== 'client' || store.getters.isSwiping" type="" icon="Aim" />
                  </el-tooltip>
                  <el-tooltip effect="light" content="滑动" placement="bottom">
                    <el-button @click="globalSwipeHandle"
                      :disabled="currentMode !== 'client' || store.getters.isClicking">
                      <Icon icon="fluent:double-tap-swipe-down-20-regular" :rotate="3" height="20" />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip effect="light" content="返回" placement="bottom">
                    <el-button @click="globalBackHandle" :disabled="currentMode !== 'client'" type="" icon="Back" />
                  </el-tooltip>
                  <el-tooltip effect="light" content="HOME" placement="bottom">
                    <el-button @click="globalHomeHandle" :disabled="currentMode !== 'client'" type="" icon="House" />
                  </el-tooltip>
                  <el-tooltip effect="light" content="最近任务" placement="bottom">
                    <el-button @click="globalRecentsHandle" :disabled="currentMode !== 'client'" type=""
                      icon="CopyDocument" />
                  </el-tooltip>
                </el-button-group>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-collapse :model-value="expands">
                  <el-collapse-item title="Location" name="Location">
                    <el-table :data="locationData" size="small" fit table-layout="fixed" @cell-click="valueClickHandle">
                      <el-table-column prop="key" label="by" min-width="30" />
                      <el-table-column prop="value" label="selector" />
                    </el-table>
                  </el-collapse-item>
                  <el-collapse-item title="Attributes" name="Attributes">
                    <el-table :data="attributeData" size="small" fit table-layout="fixed"
                      @cell-click="valueClickHandle">
                      <el-table-column prop="key" label="key" min-width="30" />
                      <el-table-column prop="value" label="value" />
                    </el-table>
                  </el-collapse-item>
                </el-collapse>
              </el-col>
            </el-row>
          </div>
        </el-scrollbar>
      </div>
    </el-container>
    <el-dialog v-model="inputModalVisible" @close="hideInputModal" title="">
      <el-form label-width="60px">
        <el-form-item label="text">
          <el-input v-model="inputText" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="hideInputModal">Cancel</el-button>
          <el-button type="primary" @click="sendInputText">Send</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import store from "@/store";
import { ElLoading, ElMessage } from "element-plus";
import bus from "@/common/bus";

const { ipcRenderer } = require('electron')
let title = ref("Node Info");
let expands = ref(["Location", "Attributes"]);
let loading = ref();
let inputModalVisible = ref(false);
let inputText = ref('');
const globalRecentsHandle = async () => {
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let response = await ipcRenderer.invoke('automate-global-recents');
  loading.value.close();
  if (response.code != 200) {
    console.log(response);
    ElMessage({
      message: response.msg,
      type: 'error'
    });
    return
  }
  bus.$emit('refreshLayout');
}
const globalHomeHandle = async () => {
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let response = await ipcRenderer.invoke('automate-global-home');
  loading.value.close();
  if (response.code != 200) {
    console.log(response);
    ElMessage({
      message: response.msg,
      type: 'error'
    });
    return
  }
  bus.$emit('refreshLayout');
}
const globalBackHandle = async () => {
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let response = await ipcRenderer.invoke('automate-global-back');
  loading.value.close();
  if (response.code != 200) {
    console.log(response);
    ElMessage({
      message: response.msg,
      type: 'error'
    });
    return
  }
  bus.$emit('refreshLayout');
}
const globalClickHandle = async () => {
  if (store.getters.isClicking) {
    store.commit('setClicking', false);
    document.querySelector('.layout-container .el-image').style.zIndex = 0;
    document.querySelector('body').style.cursor = 'auto';
  } else {
    store.commit('setClicking', true);
    document.querySelector('.layout-container .el-image').style.zIndex = 1;
    document.querySelector('body').style.cursor = 'crosshair';
  }
}
const globalSwipeHandle = async () => {
  if (store.getters.isSwiping) {
    store.commit('setSwiping', false);
    document.querySelector('.layout-container .el-image').style.zIndex = 0;
    document.querySelector('body').style.cursor = 'auto';
    store.commit('setStartPoint', {});
    store.commit('setEndPoint', {});
  } else {
    store.commit('setSwiping', true);
    document.querySelector('.layout-container .el-image').style.zIndex = 1;
    document.querySelector('body').style.cursor = 'crosshair';
  }
}
const nodeClickHandle = async () => {
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let response = await ipcRenderer.invoke('automate-node-click', currentNode.value.cacheId);
  if (response.code != 200) {
    ElMessage({
      message: response.msg,
      type: 'error'
    })
  }
  setTimeout(() => {
    bus.$emit('refreshLayout');
  }, 200);
}
const openInputModal = () => {
  inputModalVisible.value = true
}
const hideInputModal = () => {
  inputModalVisible.value = false
}
const sendInputText = async () => {
  if (!inputText.value || !currentNode.value.cacheId) {
    return
  }
  debugger
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let response = await ipcRenderer.invoke('automate-input', { cacheId: currentNode.value.cacheId, text: inputText.value });
  if (response.code != 200) {
    ElMessage({
      message: response.msg,
      type: 'error'
    })
    loading.value.close();
    return
  }
  bus.$emit('refreshLayout');
  hideInputModal();
}
const locationData = computed(() => {
  let arr = [];
  let node = currentNode.value;
  let allNodes = Array.from(store.getters.originNodeCache.values());
  if (node.resourceId) {
    // 这个vs是用来过滤的，如果有多个节点id都是一样的话，那么就不能单靠id来定位，换而言之，只有当id唯一时才显示，content-desc同理
    let vs = allNodes.filter(n => n.resourceId == node.resourceId)
      .map(n => n);
    if (vs.length === 1) {
      arr.push({
        key: 'id',
        value: node.resourceId,
      });
    }
  }
  if (node.contentDesc) {
    let vs = allNodes.filter(n => n.contentDesc == node.contentDesc)
      .map(n => n);
    if (vs.length == 1) {
      arr.push({
        key: 'content-desc',
        value: node.contentDesc,
      });
    }
  }
  if (node.xpath) {
    arr.push({
      key: 'xpath',
      value: node.xpath
    });
  }
  return arr;
})
const valueClickHandle = (row, column, cell, event) => {
  console.log(row.value);
  if (row.value) {
    ipcRenderer.send('setClipboard', row.value);
    ElMessage({
      message: '复制成功',
      type: 'success',
    })
  }
}
const attributeData = computed(() => {
  let arr = [];
  let node = currentNode.value;
  arr.push({ key: "class", value: node.class })
  arr.push({ key: "resource-id", value: node.resourceId })
  arr.push({ key: "text", value: node.text })
  arr.push({ key: "content-desc", value: node.contentDesc })
  arr.push({ key: "checkable", value: node.checkable })
  arr.push({ key: "checked", value: node.checked })
  arr.push({ key: "clickable", value: node.clickable })
  arr.push({ key: "editable", value: node.editable })
  arr.push({ key: "enabled", value: node.enabled })
  arr.push({ key: "focusable", value: node.focusable })
  arr.push({ key: "focused", value: node.focused })
  arr.push({ key: "scrollable", value: node.scrollable })
  arr.push({ key: "long-clickable", value: node.longClickable })
  arr.push({ key: "selected", value: node.selected })
  arr.push({ key: "bounds", value: node.bounds })
  return arr;
})
const currentNode = computed(() => {
  return store.getters.currentNode;
})
const currentMode = computed(() => {
  return store.getters.mode;
})
</script>

<style scoped>
.el-header,
el-main {
  padding: 0;
}

.info-container {
  height: calc(100% - 7vh);
  overflow-y: hidden;
  font-size: 14px;
  text-align: left;
  /*background-color: #fcc;*/
  /*padding: 12px;*/
  box-sizing: border-box;
  margin-top: 1px;
}

.info-container>.el-row {
  margin-bottom: 12px;
}

/deep/ .el-table .cell {
  cursor: pointer;
}

/deep/ .el-collapse {
  border-top: none;
}

/deep/ .el-collapse-item__wrap {
  border-bottom: none;
}
</style>
