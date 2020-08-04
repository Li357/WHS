<template>
  <div class="elearning-plans">
    <el-container>
      <el-header class="elearning-plans-header" height="75px">
        {{ schoolYearName }} E-Learning Plans
        <div>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="showAddPlanModal"
            :disabled="loading"
            round
            >Add Plan</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-check"
            @click="savePlans"
            :disabled="loading"
            round
            >Save Plans</el-button
          >
        </div>
      </el-header>
    </el-container>
    <div class="plan-container" v-loading="loading">
      <span v-if="plans.length === 0"
        >Click "Add Plans" to add an e-learning plan.</span
      >
      <el-tabs v-else v-model="activePlanName" editable @edit="onPlanEdit">
        <el-tab-pane
          v-for="(plan, index) in plans"
          :key="plan.name"
          :label="titlecase(plan.name)"
          :name="plan.name"
        >
          <div class="day-container" v-for="day in DAYS" :key="day">
            <strong>{{ titlecase(day) }}</strong>
            <div class="right-container">
              <div class="tag-container" v-if="plans[index]">
                <el-tag
                  v-for="assignedGroup in plans[index].groups[day]"
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
              {{ titlecase(plan.name) }} Dates
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
                  @click="savePlans"
                  :disabled="loading"
                  round
                  >Save Dates</el-button
                >
              </div>
            </div>
            <el-table
              :data="getDatesForPlan(plan.name)"
              empty-text="No dates"
              v-loading="loading"
            >
              <el-table-column prop="date" label="Date"></el-table-column>
              <el-table-column align="right">
                <template slot-scope="scope">
                  <span v-if="!scope.row.saved" class="date-list-unsaved"
                    >Unsaved</span
                  >
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="removeDate(scope.row.name, scope.row.date)"
                    >Delete</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <add-date-modal
      v-if="plans.length > 0"
      :adding-dates="addingDates"
      :start-year="startYear"
      :date-type="plans[currentIndex].name"
      @add="addDates"
      @close="addingDates = false"
    ></add-date-modal>
    <el-dialog :visible="addingPlan" width="40%" @close="resetPlanModal">
      <div slot="title" class="add-plan-header">
        Add E-Learning Plan
        <span class="add-plan-header-description"
          >Pick a name for the new plan</span
        >
      </div>
      <el-input v-model="newPlanName" placeholder="Plan name"></el-input>
      <div slot="footer">
        <el-button
          type="primary"
          @click="addPlan"
          :disabled="newPlanName.length === 0"
          >Add Plan</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { format, isSameDay } from 'date-fns';

import {
  ELearningPlanSchema,
  NameGroup,
  Day,
  DateSchemaWithoutID,
} from '../../shared/types/api';
import { ELEARNING_NAME_GROUPS, ELEARNING_DAYS } from '../utils';
import API from '../api-wrapper';
import AddDateModal from './AddDateModal.vue';
import { ELearningDate } from '../types/ELearningSettings';

@Component({ name: 'elearning-plans', components: { AddDateModal } })
export default class ELearningPlans extends Vue {
  @Prop(String) private readonly startYear!: string;
  private plans: ELearningPlanSchema[] = []; // list of e-learning plans, i.e. name group assignments
  private dates: ELearningDate[] = []; // this is the working-copy of dates before being saved to DB
  private loading = true;
  private addingDates = false;
  private currentIndex = 0;

  private addingPlan = false;
  private newPlanName = '';

  // make sure all settings show up even if not set
  private DAYS = ELEARNING_DAYS;
  private nameGroups = ELEARNING_NAME_GROUPS;
  private activePlanName = '';

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
    this.plans[index].groups[day].push(group);
  }

  private titlecase(str: string) {
    return str
      .split(' ')
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
  }

  private stringifyGroup(group: NameGroup) {
    return group.join('-');
  }

  private getDatesForPlan(planName: string) {
    return this.dates
      .filter((dateObj) => dateObj.plan === planName)
      .map((dateObj) => ({
        ...dateObj,
        date: format(dateObj.date, 'MMMM D, YYYY'),
      }));
  }

  private isGroupChosen(index: number, day: Day, group: NameGroup) {
    return (
      this.plans[index].groups[day].findIndex((curr) => curr[0] === group[0]) >
      -1
    );
  }

  private onRemoveGroup(group: NameGroup, index: number, day: Day) {
    this.plans[index].groups[day] = this.plans[index].groups[day].filter(
      (curr) => curr[0] !== group[0],
    );
  }

  private showAddDateModal(index: number) {
    this.addingDates = true;
    this.currentIndex = index;
  }

  private addDates(dates: Array<DateSchemaWithoutID<string>>) {
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
            plan: incomingDate.type,
            date: incomingDate.date,
            saved: false,
          });
        } else {
          // The date being added is a different type, overrides
          // So if a yellow date already exists and a red date is then added
          // the red date overwrites the yellow
          const existingDate = this.dates[existingDateIndex];
          if (existingDate.plan !== incomingDate.type) {
            // mutate in place... yikers
            this.dates[existingDateIndex] = {
              ...existingDate,
              plan: incomingDate.type,
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

  private removeDate(planName: string, date: string) {
    this.dates = this.dates.filter(
      (dateObj) =>
        !(
          dateObj.plan === planName &&
          isSameDay(new Date(dateObj.date), new Date(date))
        ),
    );
  }

  private showAddPlanModal() {
    this.addingPlan = true;
  }

  private addPlan() {
    const newPlan: ELearningPlanSchema = {
      name: this.newPlanName,
      groups: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      },
      dates: [],
    };
    this.plans.push(newPlan);
    this.activePlanName = newPlan.name;
    this.resetPlanModal();
  }

  private resetPlanModal() {
    this.newPlanName = '';
    this.addingPlan = false;
  }

  private onPlanEdit(target: string, action: string) {
    switch (action) {
      case 'add':
        this.addingPlan = true;
      case 'remove':
        this.plans = this.plans.filter((plan) => plan.name !== target);
        this.activePlanName = this.plans.length > 0 ? this.plans[0].name : '';
    }
  }

  private async savePlans() {
    this.loading = true;
    try {
      const withDates = this.plans.map((plan, index) => ({
        ...plan,
        dates: this.dates
          .filter((dateObj) => dateObj.plan === plan.name)
          .map((dateObj) => dateObj.date),
      }));
      await API.saveELearningPlans(withDates);
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
      const plans = await API.getELearningPlans();
      this.plans = plans;
      this.dates = plans.reduce(
        (arr: ELearningDate[], plan: ELearningPlanSchema) => [
          ...arr,
          ...plan.dates.map((date) => ({
            date,
            plan: plan.name,
            saved: true,
          })),
        ],
        [],
      );

      if (plans.length > 0) {
        this.activePlanName = plans[0].name;
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
    next: (cb: (vm: ELearningPlans) => void) => void,
  ) {
    next((vm: ELearningPlans) => {
      vm.fetchSettings();
    });
  }

  private async beforeRouteLeave(to: Route, from: Route, next: () => void) {
    await this.savePlans();
    next();
  }
}
</script>

<style lang="stylus" scoped>
.elearning-plans
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

.plan-container
  padding 0 20px

  & > span
    color gray

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

.add-plan
  &-header
    display flex
    flex-direction column
    font-weight bold
    font-size 1.5em

    &-description
      font-weight normal
      font-size 0.75em
</style>
