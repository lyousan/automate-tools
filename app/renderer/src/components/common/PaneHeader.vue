<script setup lang="ts">

</script>

<template>
  <div class="pane-header">
    <el-row style="padding-left: 10px">
      <el-col :span="12">
        <slot name="title">
        </slot>
      </el-col>
      <el-col :span="12" style="text-align: right;padding-right: 10px">
        <slot name="extra">
        </slot>
      </el-col>
    </el-row>
  </div>
</template>


<style scoped>
.pane-header {
  height: 7vh;
  line-height: 7vh;
  vertical-align: middle;
  text-align: left;
  border-bottom: 1px var(--el-border-color) solid;
  min-height: 40px;
  overflow: hidden;
  box-sizing: border-box;
}

</style>
