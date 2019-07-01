<template>
  <div class="dashboard">
    <el-container class="dashboard-container">
      <el-header class="dashboard-header">
        Dashboard
        <el-button class="dashboard-logout" type="text" @click="logout">Log out</el-button>
      </el-header>
      <el-container>
        <el-aside class="dashboard-navbar" width="20%">
          <el-menu
            class="dashboard-navbar-list" unique-opened
            :default-active="`${startYear}/${dateType}`"
          >
            <el-submenu v-for="year in years" :key="year" :index="`${year}`">
              <template slot="title">{{ year }} - {{ year + 1 }}</template>
              <el-menu-item
                v-for="(displayName, type) in dateTypes"
                :key="type" :index="`${year}/${type}`"
                @click="$router.push(`/dashboard/${year}/${type}`)"
              >{{ displayName }}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <router-view></router-view>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { range } from '../utils';

@Component({ name: 'dashboard' })
export default class Dashboard extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly dateType!: string;
  private years = range(Number(this.startYear) - 2, Number(this.startYear) + 2);

  private dateTypes = {
    'assembly': 'Assembly Dates',
    'no-school': 'No School Dates',
    'early-dismissal': 'Early Dismissal Dates',
    'late-start': 'Late Start Dates',
    'semester-one-start': 'Semester One Start',
    'semester-one-end': 'Semester One End',
    'semester-two-start': 'Semester Two Start',
    'semester-two-end': 'Semester Two End',
  };

  private async logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) {
        throw new Error('There was a problem logging out.');
      }
      this.$router.push('/login');
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
  }
}
</script>

<style lang="stylus" scoped>
.dashboard
  display flex

  &-container
    display flex
  
  &-header
    display flex
    align-items center
    justify-content space-between
    font-size 1.5em
    font-weight bold
    box-shadow 0 2px 12px 0 rgba(0, 0, 0, .1)

  &-navbar
    background-color rgba(0, 0, 0, .04)
    
    &-list
      background-color unset
</style>
