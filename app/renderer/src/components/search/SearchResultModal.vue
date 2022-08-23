<template>
    <div class="search-result-modal-container">
        <el-dialog v-model="searchResultModalVisible" :title="title" @close="hideSearchResultModal" width="30%"
            draggable :modal="false" :close-on-click-modal="false">
            <el-row>
                <el-col :class="24">
                    <div class="result-list">
                        <el-scrollbar height="400px">
                            <el-row v-for="node in nodes" :key="node.cacheId">
                                <el-col :span="24">
                                    <p class="node" @click="setCurrentNode(node.cacheId)"
                                        :class="currentNode.cacheId === node.cacheId ? 'current' : ''">
                                        {{ node.cacheId }} - {{ node.class }}</p>
                                </el-col>
                            </el-row>
                        </el-scrollbar>
                    </div>
                </el-col>
            </el-row>
            <el-row style="margin-top: 12px;">
                <el-col :span="24" style="text-align:right">
                    <el-button @click="back">back</el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>
<script setup>
import store from '../../store';
import bus from "@/common/bus";
let title = ref('Search result');
const nodes = computed(() => {
    return store.getters.searchResultNodes
})
const searchResultModalVisible = computed(() => {
    return store.getters.searchResultModalVisible
})
const hideSearchResultModal = () => {
    store.commit('hideSearchResultModal');
}
const back = () => {
    hideSearchResultModal();
    store.commit('showSearchModal');
}
const setCurrentNode = (cacheId) => {
    console.log(cacheId);
    store.dispatch('setCurrentNode', cacheId);
    bus.$emit("changeCurrentNode", cacheId);
}
const currentNode = computed(() => {
    return store.getters.currentNode
})
</script>
<style scoped>
.result-list .node {
    cursor: pointer;
    padding: 5px;
}

.result-list .node:hover {
    background: rgba(156, 189, 232, 0.5);
}

.current {
    background: rgba(156, 189, 232, 0.5);
}
</style>
