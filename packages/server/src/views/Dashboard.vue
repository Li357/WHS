<template>
  <div class="dashboard">
    <el-container class="dashboard-container">
      <el-header class="dashboard-header">
        <i :class="['dashboard-hamburger', drawerOpen ? 'el-icon-close' : 'el-icon-s-unfold']" @click="drawerOpen = !drawerOpen"></i>
        Dashboard
        <el-button class="dashboard-logout" type="text" @click="logout">Log out</el-button>
      </el-header>
      <el-container>
        <el-aside :class="['dashboard-navbar', { open: drawerOpen }]" width="20%">
          <el-menu
            class="dashboard-navbar-list"
            unique-opened
            :default-active="`${startYear}/${!isELearning ? dateType || settingType : 'elearning'}`"
          >
            <el-submenu v-for="year in years" :key="year" :index="`${year}`">
              <template slot="title"
                >{{ year }} - {{ year + 1 }}</template
              >
              <el-menu-item v-for="(displayName, type) in dateTypeNames" :key="type" :index="`${year}/${type}`" @click="select(year, type)">{{
                displayName
              }}</el-menu-item>
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

import { DateType, YearSettingType } from '../../shared/types/api';
import { range, dateTypeNames } from '../utils';
import API from '../api-wrapper';

@Component({ name: 'dashboard' })
export default class Dashboard extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly dateType!: DateType;
  @Prop(String) private readonly settingType!: YearSettingType;
  private drawerOpen = false;

  private dateTypeNames = dateTypeNames;

  get isELearning() {
    return this.$route.path.includes('elearning');
  }

  get years() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentYearStart = currentMonth < 5 ? currentYear - 1 : currentYear;
    return range(currentYearStart - 2, currentYearStart + 3);
  }

  private select(year: string, type: string) {
    this.$router.push(`/dashboard/${year}/${type}`);
    this.drawerOpen = false;
  }

  private async logout() {
    try {
      await API.logout();
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
$breakpoint = 900px

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
    overflow hidden

    @media screen and (max-width: $breakpoint)
      width 0 !important
      position absolute
      background-color white
      left 0
      z-index 3000

      &.open
        height 100%
        width 100% !important

    &-list
      background-color unset

  &-hamburger
    display none

    @media screen and (max-width: $breakpoint)
      display block
      z-index 3001
      position relative
</style>
