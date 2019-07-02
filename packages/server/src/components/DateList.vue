<template>
  <div class="date-list">
    <el-container>
      <el-header class="date-list-header" height="75px">
        {{ startYear }} - {{ Number(startYear) + 1 }} {{ dateTypeNames[dateType] }}
        <div>
          <el-button
            type="primary" icon="el-icon-plus"
            @click="addingDates = true" round
          >Add Date</el-button>
          <el-button
            type="danger" icon="el-icon-check"
            @click="saveDates" :disabled="savingDates" round
          >Save Dates</el-button>
          <el-button
            class="mobile" type="primary" icon="el-icon-plus"
            @click="addingDates = true" round
          ></el-button>
          <el-button
            class="mobile" type="danger" icon="el-icon-check"
            @click="saveDates" :disabled="savingDates" round
          ></el-button>
        </div>
      </el-header>
      <el-table :data="dateStrings" empty-text="No dates" v-loading="savingDates || loadingDates">
        <el-table-column prop="date" label="Date"></el-table-column>
        <el-table-column prop="comment" label="Comment"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-button
              type="danger" size="mini" icon="el-icon-delete"
              @click="removeDate(scope.$index)"
            >Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-container>
    <add-date-modal :adding-date="addingDates" @add="addDate" @close="addingDates = false"></add-date-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { format } from 'date-fns';

import AddDateModal from './AddDateModal.vue';
import { DateSchema, DateSchemaWithoutID, DateType } from '../../shared/types/api';
import { dateTypeNames } from '../utils';
import API from '../api-wrapper';

@Component({
  name: 'date-list',
  components: { AddDateModal },
})
export default class DateList extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly dateType!: DateType;
  private addingDates = false;
  private savingDates = false;
  private loadingDates = true;
  private dates: DateSchema[] = [];

  private dateTypeNames = dateTypeNames;

  public mounted() {
    this.fetchDates(this.dateType, this.startYear);
  }

  public async beforeRouteUpdate({ params: toParams }: Route, from: Route, next: () => void) {
    await this.saveDates();
    next();
    this.fetchDates(toParams.dateType, toParams.startYear);
  }

  get dateStrings() {
    return this.dates.map(({ date }) => format(date, 'MMMM D, YYYY'));
  }

  private async fetchDates(dateType: string, startYear: string) {
    this.loadingDates = true;
    try {
      this.dates = await API.getDates(startYear, dateType);
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.loadingDates = false;
  }

  private addDates(dates: DateSchemaWithoutID[]) {
    API.addDates(dates);
  }

  private async saveDates() {
    this.savingDates = true;
    try {
      await API.commitDateChanges();
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.savingDates = false;
  }

  private removeDate(id: string) {
    API.removeDate(id);
  }
}
</script>

<style lang="stylus" scoped>
.date-list
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

    @media screen and (max-width: 340px)
      & > div
        display flex
        flex-direction row

        & *
          display none

      & .mobile
        display block
</style>
