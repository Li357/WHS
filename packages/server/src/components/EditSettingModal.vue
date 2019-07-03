<template>
  <div class="add-date-dialog">
    <el-dialog
      :visible="editingSetting"
      @close="$emit('close')"
      width="40%"
    >
      <div slot="title" class="add-date-header">
        Edit {{ startYear }} - {{ Number(startYear) + 1 }} {{ dateTypeNames[settingType] }}
        <span class="add-date-header-description">Pick a date to set</span>
      </div>
      <div class="add-date-container add-date-dialog-row">
        <el-date-picker
          v-model="setting"
          type="date"
          placeholder="Pick new date"
        ></el-date-picker>
      </div>
      <div slot="footer">
        <el-button
          type="primary" class="add-date-submit"
          @click="editSetting" :disabled="setting === null"
        >Edit Setting</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { DateSchemaWithoutID, YearSettingType } from '../../shared/types/api';
import { dateTypeNames } from '../utils';

@Component({ name: 'edit-setting-modal' })
export default class EditSettingModal extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly settingType!: YearSettingType;
  @Prop(Boolean) private readonly editingSetting!: boolean;
  @Prop(Function) private readonly edit!: (setting: DateSchemaWithoutID) => void;
  private setting: Date | null = null;

  private dateTypeNames = dateTypeNames;

  private editSetting() {
    const setting: DateSchemaWithoutID = {
      type: this.settingType,
      year: this.startYear,
      date: this.setting!.toISOString(),
      comment: '',
    };
    this.$emit('edit', setting);
    this.$emit('close');
    this.setting = null;
  }
}
</script>

