<template>
  <div class="year-setting">
    <el-container>
      <el-header class="year-setting-header" height="75px">
        {{ schoolYearName }} {{ settingName }}
        <div>
          <el-button
            type="primary"
            icon="el-icon-edit"
            @click="editingSetting = true"
            :disabled="loading"
            round
          >
            Edit Setting
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-check"
            @click="saveSetting(startYear, settingType)"
            :disabled="loading"
            round
          >
            Save Setting
          </el-button>
          <el-button
            class="mobile"
            type="primary"
            icon="el-icon-edit"
            @click="editingSetting = true"
            :disabled="loading"
            round
          ></el-button>
          <el-button
            class="mobile"
            type="danger"
            icon="el-icon-check"
            @click="saveSetting(startYear, settingType)"
            :disabled="loading"
            round
          ></el-button>
        </div>
      </el-header>
      <el-table
        :data="settingDisplay"
        v-loading="loading"
        :empty-text="`${settingName} not set. Please set before the start of the ${schoolYearName} school year.`"
      >
        <el-table-column prop="date" label="Date"></el-table-column>
        <el-table-column align="right">
          <span v-if="!(setting && setting.saved)" class="date-list-unsaved">
            Unsaved
          </span>
        </el-table-column>
      </el-table>
    </el-container>
    <edit-setting-modal
      :editing-setting="editingSetting"
      :start-year="startYear"
      :setting-type="settingType"
      @edit="editSetting"
      @close="editingSetting = false"
    ></edit-setting-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { format } from 'date-fns';

import EditSettingModal from './EditSettingModal.vue';
import { YearSettingType, DateSchemaWithoutID } from '../../shared/types/api';
import { ClientDate } from '../types/DateList';
import { dateTypeNames } from '../utils';
import API from '../api-wrapper';

@Component({
  name: 'year-setting',
  components: { EditSettingModal },
})
export default class YearSetting extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly settingType!: YearSettingType;
  private setting: ClientDate | null = null;
  private loadingSetting = true;
  private editingSetting = false;
  private savingSetting = false;

  private dateTypeNames = dateTypeNames;

  get loading() {
    return this.loadingSetting || this.editingSetting || this.savingSetting;
  }

  get settingName() {
    return this.dateTypeNames[this.settingType];
  }

  get schoolYearName() {
    const year = Number(this.startYear);
    return `${year} - ${year + 1}`;
  }

  get settingDisplay() {
    if (this.setting === null) {
      return [];
    }
    return [
      {
        ...this.setting,
        date: format(this.setting.date, 'MMMM D, YYYY'),
      },
    ];
  }

  public beforeRouteEnter(
    to: Route,
    from: Route,
    next: (cb: (vm: YearSetting) => void) => void,
  ) {
    next((vm: YearSetting) => {
      vm.fetchSetting(vm.startYear, vm.settingType);
    });
  }

  public async beforeRouteUpdate(
    { params: toParams }: Route,
    from: Route,
    next: () => void,
  ) {
    await this.saveSetting(this.startYear, this.settingType);
    next();
    this.fetchSetting(
      toParams.startYear,
      toParams.settingType as YearSettingType,
    );
  }

  public async beforeRouteLeave(to: Route, from: Route, next: () => void) {
    await this.saveSetting(this.startYear, this.settingType);
    next();
  }

  private async fetchSetting(year: string, type: YearSettingType) {
    this.loadingSetting = true;
    try {
      const [setting = null] = await API.getDates(year, type);
      this.setting = setting && { ...setting, saved: true };
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.loadingSetting = false;
  }

  private editSetting(setting: DateSchemaWithoutID) {
    API.editSetting(this.settingType, this.startYear, setting);
    this.setting = { ...setting, saved: false };
    this.$notify({
      title: 'Success',
      message: 'Setting changed! Please click Save Setting to commit changes.',
    });
  }

  private async saveSetting(startYear: string, setting: YearSettingType) {
    this.savingSetting = true;
    try {
      const hasChanges = await API.commitDateChanges();
      if (hasChanges && this.setting) {
        this.setting.saved = true;
        this.$notify({
          title: 'Success',
          message: `${this.schoolYearName} ${this.settingName} saved!`,
        });
      } else {
        this.$notify({
          title: 'Info',
          message: 'No settings to save.',
        });
      }
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.savingSetting = false;
  }
}
</script>

<style lang="stylus" scoped>
.year-setting
  width 80%

  @media screen and (max-width: 900px)
    width 100%

  &-header
    display flex
    align-items center
    justify-content space-between

    @media screen and (max-width: 575px)
      flex-direction column
      margin 10px

    & .mobile
      display none

    @media screen and (max-width: 370px)
      & > div
        display flex
        flex-direction row

        & > *
          display none

      & .mobile
        display block

  &-unsaved
    font-weight bold
    color: red
    margin 0 10px
</style>
