<template>
  <div class="login">
    <el-card class="login-card">
      <div slot="header">Login to WHS App Server</div>
      <el-alert v-if="error.length > 0" :title="error" type="error"></el-alert>
      <el-input class="login-input" placeholder="Username" v-model="username"></el-input>
      <el-input class="login-input" placeholder="Password" v-model="password" type="password"></el-input>
      <el-button class="login-button" type="primary" :disabled="!canLogin" @click="login">Login</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({ name: 'login' })
export default class Home extends Vue {
  private username = '';
  private password = '';
  private error = '';

  get canLogin() {
    return this.username.length > 0 && this.password.length > 0;
  }

  private async login() {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });
      if (!response.ok && response.status !== 401) {
        throw new Error('Please check your internet connection.');
      }

      const user = await response.json();
      if (user.auth) {
        return this.$router.push('/');
      }

      throw new Error('Your username or password was incorrect.');
    } catch ({ message }) {
      this.error = message;
    }
  }
}
</script>

<style lang="stylus" scoped>
.login
  display flex
  justify-content center
  align-items center

  &-card
    min-width 300px
    max-width 400px

  &-input, &-button
    margin-bottom 10px

  &-button
    width 100%
</style>
