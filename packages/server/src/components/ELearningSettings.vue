<template>
  <div class="elearning-settings">
    <el-container>
      <el-header class="elearning-settings-header" height="75px"> {{ schoolYearName }} E-Learning Settings </el-header>
    </el-container>
    <div class="day-container" v-for="day in days" :key="day">
      <span>{{ titlecase(day) }}</span>
      <el-dropdown trigger="click" @command="onSelect">
        <span class="namegroup-dropdown">{{ settings[day] || 'Name Group' }}<i class="el-icon-arrow-down el-icon--right"></i></span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="group in nameGroups" :key="group" :command="group">{{ group }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ELearningSettingsSchema } from '../../shared/types/api';

const NAME_GROUPS = ['A-E', 'F-K', 'L-R', 'S-Z'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

@Component({ name: 'elearning-settings' })
export default class ELearningSettings extends Vue {
  @Prop(String) private readonly startYear!: string;
  private settings: ELearningSettingsSchema = {};
  private nameGroups = NAME_GROUPS;
  private days = DAYS;

  get schoolYearName() {
    const year = Number(this.startYear);
    return `${year} - ${year + 1}`;
  }

  private onSelect(group: string) {
    console.log(group);
  }

  private titlecase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
</script>

<style lang="stylus" scoped>
.elearning-settings
  width 80%

  @media screen and (max-width: 900px)
    width 100%

  &-header
    display flex
    align-items center
    justify-content space-between

.namegroup-dropdown
  cursor pointer
  color #409EFF
</style>
