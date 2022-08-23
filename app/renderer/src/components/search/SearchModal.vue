<template>
    <div class="search-modal-container">
        <el-dialog v-model="searchModalVisible" :title="title" @close="hideSearchModal" draggable>
            <el-form :model="options" label-width="80px">
                <el-form-item label="selector">
                    <el-select v-model="options.type" placeholder="selector">
                        <el-option v-for="item in types" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="value">
                    <el-input v-model="options.value" autosize type="textarea" placeholder="Please input" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelHandle">Cancel</el-button>
                    <el-button type="primary" @click="confirmHandle">Confirm</el-button>
                </span>
            </template>
        </el-dialog>
        <search-result-modal />
    </div>
</template>

<script setup>
import store from "@/store";
const { ipcRenderer } = require('electron')
let types = ref([
    'id',
    'xpath',
    'content-desc'
])
let options = ref({})
let loading = ref()
const confirmHandle = async () => {
    if (!options.value.type || !options.value.value) {
        return
    }
    loading.value = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    let response = await ipcRenderer.invoke('automate-find', { type: options.value.type, value: options.value.value });
    console.log(response);
    if (response.code != 200) {
        ElMessage({
            message: response.msg,
            type: 'error'
        })
        return;
    }
    let reg = new RegExp('cacheId="(.*?)"');
    let arr = response.data;
    let ids = [];
    for (let i = 0; i < arr.length; i++) {
        ids[i] = reg.exec(arr[i])[1];
    }
    console.log(ids);
    // 根据id查缓存
    let nodes = store.getters.findNodesByIds(ids);
    console.log(nodes);
    store.commit('setSearchResultNodes', nodes)
    hideSearchModal();
    store.commit('showSearchResultModal');
    loading.value.close();
}
const cancelHandle = () => {
    hideSearchModal()
}
const hideSearchModal = () => {
    store.commit('hideSearchModal')
}
const searchModalVisible = computed(() => {
    return store.getters.searchModalVisible
})
</script>

<style scoped>
</style>
