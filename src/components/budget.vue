<template>
    <div class="budget-container">
        <el-card class="border-card" shadow="hover">
            <el-form :model="form" :rules="rules" ref="budgetForm" class="budget-form" label-width="120px">
                <el-form-item label="选择类别" prop="category">
                    <el-select v-model="form.categoryId" placeholder="请选择类别">
                        <el-option label="餐饮" value=1></el-option>
                        <el-option label="购物" value=2></el-option>
                        <el-option label="住房" value=3></el-option>
                        <el-option label="交通" value=4></el-option>
                        <el-option label="娱乐" value=5></el-option>
                        <el-option label="教育" value=6></el-option>
                        <el-option label="医疗健康" value=7></el-option>
                        <el-option label="公共事业" value=8></el-option>
                        <el-option label="投资理财" value=9></el-option>
                        <el-option label="个人护理" value=10></el-option>
                        <el-option label="工资" value=11></el-option>
                        <el-option label="兼职" value=12></el-option>
                        <el-option label="投资" value=13></el-option>
                        <el-option label="礼物" value=14></el-option>
                        <el-option label="其他" value=15></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="数量" prop="amount">
                    <el-input-number v-model="form.amount" controls-position="right" :min="0"></el-input-number>
                </el-form-item>

                <el-form-item label="时间单位" prop="timeUnit">
                    <el-radio-group v-model="form.timeUnit">
                        <el-radio label="day">每天</el-radio>
                        <el-radio label="week">每周</el-radio>
                        <el-radio label="month">每月</el-radio>
                        <el-radio label="year">每年</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="初始日期" prop="startDate">
                    <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期"></el-date-picker>
                </el-form-item>

                <el-form-item label="截止日期" prop="endDate">
                    <el-date-picker v-model="form.endDate" type="date" placeholder="选择日期"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm">提交</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, ElInputNumber, ElRadio, ElRadioGroup, ElDatePicker, ElInput, ElButton } from 'element-plus'

const form = ref({
    categoryId: '',
    amount: 0,
    timeUnit: 'day',
    startDate: '',
    endDate: '',
})

const rules = ref({
    category: [{ required: true, message: '请选择类别', trigger: 'blur' }],
    amount: [{ required: true, message: '请输入数量', trigger: 'blur' }],
    timeUnit: [{ required: true, message: '请选择时间单位', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择初始日期', trigger: 'blur' }],
    endDate: [{ required: true, message: '请选择截止日期', trigger: 'blur' }]
})

const submitForm = () => {
    // 提交表单逻辑
}
</script>

<style scoped>
.budget-container {
    width: 400px;
    margin: 50px auto;
}

.border-card {
    border: 1px solid #ebeef5;
    border-radius: 8px;
}

.budget-form {
    margin-top: 20px;
}
</style>
