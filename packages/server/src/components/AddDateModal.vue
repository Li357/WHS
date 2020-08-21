<template>
  <div class="add-date-dialog">
    <el-dialog
      :visible="addingDates"
      @close="$emit('close')"
      width="40%"
    >
      <div slot="title" class="add-date-header">
        Add {{ startYear }} - {{ Number(startYear) + 1 }} {{ dateTypeNames[dateType] }}
        <span class="add-date-header-description">Pick a single date or range to add</span>
      </div>
      <div class="add-date-container add-date-dialog-row">
        <el-date-picker
          v-model="dates"
          type="date"
          placeholder="Pick new date"
        ></el-date-picker>
        <span class="add-date-separator">OR</span>
        <el-date-picker
          v-model="dates"
          type="daterange"
          range-separator="To"
          start-placeholder="Pick start date"
          end-placeholder="Pick end date"
        ></el-date-picker>
      </div>
      <div v-if="commentable" class="add-date-dialog-row">
        <el-input v-model="comment" placeholder="Add comment"></el-input>
      </div>
      <div slot="footer">
        <el-button
          type="primary" class="add-date-submit"
          @click="addDates" :disabled="dates === null"
        >Add Date</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { eachDay } from 'date-fns';

import { DateSchemaWithoutID, DateType } from '../../shared/types/api';
import { dateTypeNames } from '../utils';

@Component({ name: 'add-date-modal' })
export default class AddDateModal extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly dateType!: DateType;
  @Prop(Boolean) private readonly addingDates!: boolean;
  @Prop(Function) private readonly add!: (dates: DateSchemaWithoutID[]) => void;
  @Prop(Boolean) private readonly commentable?: boolean;
  private dates: [Date, Date] | Date | null = null;
  private comment = '';

  private dateTypeNames = dateTypeNames;

  private addDates() {
    let dates = [this.dates!];
    if (Array.isArray(this.dates!)) {
      dates = eachDay(...this.dates!);
    }

    const documents: DateSchemaWithoutID[] = (dates as Date[]).map((date: Date) => ({
      type: this.dateType,
      year: this.startYear,
      date: date.toISOString(),
      comment: this.comment,
    }));
    this.$emit('add', documents);
    this.$emit('close');
    this.dates = null;
    this.comment = '';
  }
}
</script>

<style lang="stylus">
.add-date
  &-dialog
    & .el-dialog
      min-width 350px

    & .el-dialog__body
      word-break unset

  &-header
    display flex
    flex-direction column
    font-weight bold
    font-size 1.5em

    &-description
      font-weight normal
      font-size 0.75em

  &-container
    display flex
    justify-content space-between
    margin-bottom 10px

  &-separator
    margin 0 10px
    display flex
    align-items center
</style>
