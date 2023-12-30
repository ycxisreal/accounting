<template>
    <div class="io-manage-container">
        <h1 class="title">收支管理</h1>
        <el-radio-group v-model="selectedType" @change="fetchData">
            <el-radio label="income">收入</el-radio>
            <el-radio label="outcome">支出</el-radio>
        </el-radio-group>
        <el-table :data="transactions" style="width: 100%">
            <el-table-column prop="transactionId" label="事务ID"></el-table-column>
            <el-table-column prop="userId" label="用户ID"></el-table-column>
            <el-table-column prop="categoryId" label="类别ID"></el-table-column>
            <el-table-column prop="amount" label="金额"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button size="small" @click="editTransaction(row)">编辑</el-button>
                    <el-button size="small" @click="deleteTransaction(row.transactionId)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="addTransaction">添加事务</el-button>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElRadio, ElRadioGroup, ElTable, ElTableColumn, ElButton } from 'element-plus';

interface Transaction {
    transactionId: number;
    userId: number;
    categoryId: number;
    amount: number;
    description: string;
}

const selectedType = ref('income');
const transactions = ref<Transaction[]>([]);

const fetchData = async () => {
    // 模拟发送请求获取数据
    const response = await fetchTransactions(selectedType.value);
    transactions.value = response;
};

const fetchTransactions = async (type: string): Promise<Transaction[]> => {
    // 在这里发送请求到服务器，获取对应类型的数据
    // 示例数据
    return [
        { transactionId: 1, userId: 101, categoryId: 5, amount: 1000, description: '描述1', type: 'income' },
        { transactionId: 2, userId: 102, categoryId: 6, amount: 2000, description: '描述2', type: 'outcome' },
        // ...
    ].filter(t => t.type === type);
};

const editTransaction = (transaction: Transaction) => {
    // 编辑事务的逻辑
    console.log('编辑事务', transaction);
};

const deleteTransaction = async (transactionId: number) => {
    // 删除事务的逻辑
    console.log('删除事务', transactionId);
};

const addTransaction = () => {
    // 添加事务的逻辑
    console.log('添加事务');
};

onMounted(() => {
    fetchData();
});
</script>
<style scoped>
.io-manage-container {
    margin: 20px;
}

.title {
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}
</style>
