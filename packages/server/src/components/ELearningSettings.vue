<template>
  <div class="elearning-settings">
    <el-container>
      <el-header class="elearning-settings-header" height="75px">
        {{ schoolYearName }} E-Learning Settings
        <div>
          <el-button
            type="danger"
            icon="el-icon-check"
            @click="saveSettingsAndDates"
            :disabled="loading"
            round
            >Save Settings</el-button
          >
        </div>
      </el-header>
    </el-container>
    <div class="code-container" v-loading="loading">
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
                  >{{ stringifyGroup(assignedGroup) }}</el-tag
                >
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
                    >{{ stringifyGroup(group) }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <el-divider></el-divider>
          <div class="dates-container">
            <div class="header">
              Code {{ titlecase(code) }} Dates
              <div>
                <el-button
                  type="primary"
                  icon="el-icon-plus"
                  @click="showAddDateModal(index)"
                  :disabled="loading"
                  round
                  >Add Date</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-check"
                  @click="saveSettingsAndDates"
                  :disabled="loading"
                  round
                  >Save Dates</el-button
                >
              </div>
            </div>
            <el-table
              :data="getDataForType(code)"
              empty-text="No dates"
              v-loading="loading"
            >
              <el-table-column prop="date" label="Date"></el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">
                  <span v-if="!scope.row.saved" class="date-list-unsaved">
                    Unsaved
                  </span>
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeDate(scope.row.type, scope.row.date)"
                  >
                    Delete
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <add-date-modal
      :adding-dates="addingDates"
      :start-year="startYear"
      :date-type="CODE_TYPES[currentIndex]"
      @add="addDates"
      @close="addingDates = false"
    ></add-date-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { format, isSameDay } from 'date-fns';

import {
  ELearningSettingsSchema,
  ELearningType,
  NameGroup,
  Day,
  DateSchemaWithoutID,
} from '../../shared/types/api';
import {
  ELEARNING_NAME_GROUPS,
  ELEARNING_DAYS,
  ELEARNING_CODE_TYPES,
  ELEARNING_INITIAL_SETTINGS,
} from '../utils';
import API from '../api-wrapper';
import AddDateModal from './AddDateModal.vue';
import { ELearningDate } from '../types/ELearningSettings';

@Component({ name: 'elearning-settings', components: { AddDateModal } })
export default class ELearningSettings extends Vue {
  @Prop(String) private readonly startYear!: string;
  private settings = ELEARNING_INITIAL_SETTINGS;
  private dates: ELearningDate[] = []; // this is the working-copy of dates before being saved to DB
  private loading = true;
  private addingDates = false;
  private currentIndex = 0;

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

  private getDataForType(type: ELearningType) {
    return this.dates
      .filter((dateObj) => dateObj.type === type)
      .map((dateObj) => ({
        ...dateObj,
        date: format(dateObj.date, 'MMMM D, YYYY'),
      }));
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

  private showAddDateModal(index: number) {
    this.addingDates = true;
    this.currentIndex = index;
  }

  private addDates(dates: Array<DateSchemaWithoutID<ELearningType>>) {
    const { filtered } = dates.reduce(
      (
        obj: {
          filtered: ELearningDate[];
        },
        incomingDate,
      ) => {
        const existingDateIndex = this.dates.findIndex(
          (dateObj) => dateObj.date === incomingDate.date,
        );
        const isDuplicate = existingDateIndex > -1;
        if (!isDuplicate) {
          obj.filtered.push({
            type: incomingDate.type,
            date: incomingDate.date,
            saved: false,
          });
        } else {
          // The date being added is a different type, overrides
          // So if a yellow date already exists and a red date is then added
          // the red date overwrites the yellow
          const existingDate = this.dates[existingDateIndex];
          if (existingDate.type !== incomingDate.type) {
            // mutate in place... yikers
            this.dates[existingDateIndex] = {
              ...existingDate,
              type: incomingDate.type,
              saved: false,
            };
          }
        }
        return obj;
      },
      { filtered: [] },
    );
    this.dates = [...this.dates, ...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    this.$notify({
      title: 'Success',
      message: 'Date(s) added! Please click Save Dates to commit changes.',
    });
  }

  private removeDate(type: ELearningType, date: string) {
    this.dates = this.dates.filter(
      (dateObj) =>
        !(
          dateObj.type === type &&
          isSameDay(new Date(dateObj.date), new Date(date))
        ),
    );
  }

  private async saveSettingsAndDates() {
    this.loading = true;
    try {
      const withDates = this.settings.map((setting, index) => ({
        ...setting,
        dates: this.dates
          .filter((dateObj) => dateObj.type === setting.type)
          .map((dateObj) => dateObj.date),
      }));
      await API.saveELearningSettings(withDates);
      this.dates = this.dates.map((dateObj) => ({ ...dateObj, saved: true }));
      this.$notify({
        title: 'Success',
        message: 'Settings and dates saved!',
      });
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.loading = false;
  }

  private async fetchSettings() {
    this.loading = true;
    try {
      const settings = await API.getELearningSettings();
      if (settings.length === 2) {
        this.settings = settings;
        this.dates = settings.reduce(
          (arr: ELearningDate[], setting: ELearningSettingsSchema) => [
            ...arr,
            ...setting.dates.map((date) => ({
              date,
              type: setting.type,
              saved: true,
            })),
          ],
          [],
        );
      }
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.loading = false;
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
    await this.saveSettingsAndDates();
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

.dates-container
  & .header
    display flex
    align-items center
    justify-content space-between

.date-list-unsaved
  font-weight bold
  color: red
  margin 0 10px
</style>
