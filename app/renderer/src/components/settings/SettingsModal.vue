<template>
  <div class="settings-modal-container">
    <el-dialog v-model="settingsModalVisible" :title="title" @close="hideSettingsModalVisible">
      <el-form :model="options">
        <el-form-item label="UDID">
          <el-select v-model="options.udid" @change="udidChangeHandle" placeholder="udid">
            <el-option v-for="item in devices" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button @click="refreshDevicesHandle" icon="Refresh" circle style="cursor: pointer;margin-left: 14px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelHandle">Cancel</el-button>
          <el-button type="primary" @click="confirmHandle">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import store from "@/store";
import { ElLoading, ElMessage } from "element-plus";
import bus from "@/common/bus";

const { ipcRenderer } = require("electron");

const cancelHandle = () => {
  hideSettingsModalVisible();
}
onMounted(() => {
  store.dispatch('loadDevices');
})
const loading = ref();
let title = ref('Set connection options');
let options = ref({
  udid: ''
});
const currentDevice = computed(() => {
  return store.getters.currentDevice;
})
watch(currentDevice, (value, oldValue, onCleanup) => {
  options.value.udid = value;
})
const udidChangeHandle = (val) => {
  store.commit('setCurrentDevice', val)
}
const settingsModalVisible = computed(() => {
  return store.getters.settingsModalVisible;
})
const confirmHandle = async () => {
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  await ipcRenderer.invoke('check-automate', { udid: currentDevice.value });
  ipcRenderer.send('automate-create', { udid: currentDevice.value });
  hideSettingsModalVisible();
  store.commit('ok');
  bus.$emit('refreshLayout');
  store.commit('setMode', 'client');
}
const hideSettingsModalVisible = () => {
  store.commit('hideSettingsModal')
};
const devices = computed(() => {
  return store.getters.devices;
})
const refreshDevicesHandle = () => {
  store.dispatch('loadDevices');
}
</script>

<style scoped>
</style>
