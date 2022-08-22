<template>
  <div class="import-file-modal-container">
    <el-dialog v-model="importFileModalVisible"
               :title="title"
               @close="hideImportFileModal">
      <!--      <el-form :model="form">
              <el-form-item label="udid">
                <el-input v-model="form.udid" autocomplete="off"/>
              </el-form-item>
            </el-form>-->
      <el-row style="justify-content: space-around">
        <el-col :span="11">
          <el-upload
              ref="uploadImgRef"
              drag
              :accept="['.png','.jpeg','jpg']"
              :file-list="imgFileList"
              :auto-upload="false"
              :on-change="imgChangeHandle"
          >
            <el-icon class="el-icon--upload">
              <picture-filled/>
            </el-icon>
            <div class="el-upload__text">
              Drop capture file here or <em>click to upload</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                only supports png/jpeg
              </div>
            </template>
          </el-upload>
        </el-col>
        <el-col :span="11">
          <el-upload
              ref="uploadXmlRef"
              drag
              accept=".xml"
              :auto-upload="false"
              :file-list="xmlFileList"
              :on-change="xmlChangeHandle"
          >
            <el-icon class="el-icon--upload">
              <Document/>
            </el-icon>
            <div class="el-upload__text">
              Drop layout file here or <em>click to upload</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                only supports xml
              </div>
            </template>
          </el-upload>
        </el-col>
      </el-row>

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
import {ElLoading, ElMessage} from "element-plus";
import bus from "@/common/bus";

let uploadImgRef = ref();
let uploadXmlRef = ref();
let title = ref('Import file')
let form = ref({})
let imgFileList = ref([])
let xmlFileList = ref([])

const loading = ref();
const imgChangeHandle = (file, files) => {
  imgFileList.value = [];
  imgFileList.value[0] = file;
}
const xmlChangeHandle = (file, files) => {
  xmlFileList.value = [];
  xmlFileList.value[0] = file;
}
const importFileModalVisible = computed(() => {
  return store.getters.importFileModalVisible;
})
const cancelHandle = () => {
  hideImportFileModal();
}
const confirmHandle = () => {
  if (!imgFileList.value[0] || !xmlFileList.value[0]) {
    ElMessage({
      message: 'please choose file first',
      type: 'warn'
    });
    return;
  }
  loading.value = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  });
  // 这几步一定要是同步执行的才行，否则可能会导致界面的更新不完整
  store.commit('setCapFilePath', {filepath: imgFileList.value[0].raw.path});
  store.commit('setXmlFilePath', {filepath: xmlFileList.value[0].raw.path});
  bus.$emit('refreshLayout');
  store.commit('ok');
  hideImportFileModal();
  loading.value.close();
  store.commit('setMode', 'file')
}
const hideImportFileModal = () => {
  store.commit('hideImportFileModal');
};
</script>

<style scoped>

</style>
