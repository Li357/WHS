<template>
  <div class="not-found">
    <div>404 :(</div>
    <el-button type="text" @click="$router.push('/')">Back to safety</el-button>
  </div>
</template>

<style lang="stylus" scoped>
.not-found
  font-size 10em
  font-weight bold
  display flex
  flex-direction column
  justify-content center
  align-items center
</style>
