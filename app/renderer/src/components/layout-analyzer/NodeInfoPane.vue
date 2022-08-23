<template>
  <div class="container thin-border large-radius">
    <el-container style="height: 100%;" direction="vertical">
      <el-header>
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
                  <el-tooltip effect="light" content="点击" placement="bottom">
                    <el-button @click="nodeClickHandle" :disabled="true" type="" icon="Aim" />
                  </el-tooltip>
                  <el-tooltip effect="light" content="点击节点" placement="bottom">
                    <el-button @click="nodeClickHandle" :disabled="currentMode !== 'client'" type="">
                      <Icon icon="icon-park-outline:click-tap" />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip effect="light" content="滑动" placement="bottom">
                    <el-button :disabled="true">
                      <Icon icon="fluent:double-tap-swipe-down-20-regular" :rotate="3" height="20" />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip effect="light" content="输入" placement="bottom">
                    <el-button :disabled="currentMode !== 'client'" type="" icon="EditPen" />
                  </el-tooltip>
                  <el-tooltip effect="light" content="计时" placement="bottom">
                    <el-button :disabled="true" type="" icon="Stopwatch" />
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
                      <el-table-column prop="timing" label="timing" width="100" />
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
  arr.push({ key: "resources-id", value: node.resourceId })
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
