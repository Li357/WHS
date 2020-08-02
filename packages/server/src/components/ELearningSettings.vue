<template>
  <div class="elearning-settings">
    <el-container>
      <el-header class="elearning-settings-header" height="75px">
        {{ schoolYearName }} E-Learning Settings
        <div>
          <el-button
            type="danger"
            icon="el-icon-check"
            @click="saveSettings"
            :disabled="loading"
            round
          >
            Save Settings
          </el-button>
        </div>
      </el-header>
    </el-container>
    <div class="code-container" v-loading="loadingSettings">
      <el-tabs v-model="activeName">
        <el-tab-pane
          v-for="(code, index) in CODE_TYPES"
          :key="code"
          :label="`Code ${titlecase(code)}`"
          :name="code"
        >
          <div class="day-container" v-for="day in DAYS" :key="day">
            <strong>{{ titlecase(day) }}</strong>
            <div class="right-container">
              <div class="tag-container" v-if="settings[index]">
                <el-tag
                  v-for="assignedGroup in settings[index].groups[day]"
                  :key="stringifyGroup(assignedGroup)"
                  closable
                  @close="onRemoveGroup(assignedGroup, index, day)"
                >
                  {{ stringifyGroup(assignedGroup) }}
                </el-tag>
              </div>
              <el-dropdown trigger="click" @command="onSelect">
                <span class="namegroup-dropdown">
                  <i class="el-icon-plus el-icon--left"></i>
                  Add Name Group
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="group in nameGroups"
                    :key="stringifyGroup(group)"
                    :command="{ group, day, index }"
                    :disabled="isGroupChosen(index, day, group)"
                  >
                    {{ stringifyGroup(group) }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <el-table
            :data="settings[index].dates"
            empty-text="No dates"
            v-loading="loadingSettings"
          >
            <el-table-column prop="date" label="Date"></el-table-column>
            <el-table-column align="right">
              <!-- <template slot-scope="scope"> </template> -->
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import {
  ELearningSettingsSchema,
  NameGroup,
  Day,
} from '../../shared/types/api';
import {
  ELEARNING_NAME_GROUPS,
  ELEARNING_DAYS,
  ELEARNING_CODE_TYPES,
  ELEARNING_INITIAL_SETTINGS,
} from '../utils';
import API from '../api-wrapper';

@Component({ name: 'elearning-settings' })
export default class ELearningSettings extends Vue {
  @Prop(String) private readonly startYear!: string;
  private settings = ELEARNING_INITIAL_SETTINGS;
  private loadingSettings = true;

  // make sure all settings show up even if not set
  private DAYS = ELEARNING_DAYS;
  private CODE_TYPES = ELEARNING_CODE_TYPES;
  private nameGroups = ELEARNING_NAME_GROUPS;
  private activeName = ELEARNING_CODE_TYPES[0];

  get schoolYearName() {
    const year = Number(this.startYear);
    return `${year} - ${year + 1}`;
  }

  private onSelect({
    group,
    day,
    index,
  }: {
    group: NameGroup;
    day: Day;
    index: number;
  }) {
    this.settings[index].groups[day].push(group);
  }

  private titlecase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private stringifyGroup(group: NameGroup) {
    return group.join('-');
  }

  private isGroupChosen(index: number, day: Day, group: NameGroup) {
    return (
      this.settings[index].groups[day].findIndex(
        (curr) => curr[0] === group[0],
      ) > -1
    );
  }

  private onRemoveGroup(group: NameGroup, index: number, day: Day) {
    this.settings[index].groups[day] = this.settings[index].groups[day].filter(
      (curr) => curr[0] !== group[0],
    );
  }

  private async saveSettings() {
    try {
      await API.saveELearningSettings(this.settings);
      this.$notify({
        title: 'Success',
        message: `Settings saved!`,
      });
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
  }

  private async fetchSettings() {
    this.loadingSettings = true;
    try {
      const settings = await API.getELearningSettings();
      if (settings.length === 2) {
        this.settings = settings;
      }
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.loadingSettings = false;
  }

  private beforeRouteEnter(
    to: Route,
    from: Route,
    next: (cb: (vm: ELearningSettings) => void) => void,
  ) {
    next((vm: ELearningSettings) => {
      vm.fetchSettings();
    });
  }

  private async beforeRouteLeave(to: Route, from: Route, next: () => void) {
    await this.saveSettings();
    next();
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

.code-container
  padding 0 20px

.day-container
  display flex
  flex-direction row
  align-items center
  justify-content space-between
  padding 10px 0
  height 40px

.tag-container
  display flex
  align-items center
  flex-direction row

  & > *
    margin 0 10px

.right-container
  display flex
  align-items center
  flex-direction row
</style>
