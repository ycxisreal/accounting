<template>
    <div class="io-manage-container">
        <h1 class="title">收支管理</h1>
        <el-radio-group v-model="selectedType" @change="fetchData">
            <el-radio label="income">收入</el-radio>
            <el-radio label="outcome">支出</el-radio>
        </el-radio-group>
        <el-table :data="filteredTransactions" style="width: 100%">
            <!-- ...表格列 -->
            <el-table-column prop="transactionId" label="事务ID"></el-table-column>
            <el-table-column prop="userId" label="用户ID"></el-table-column>
            <el-table-column prop="categoryId" label="类别ID"></el-table-column>
            <el-table-column prop="amount" label="金额"></el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作">
                <template #default="{ row }">
                    <el-button size="small" @click="showEditTransactionDialog(row)">编辑</el-button>
                    <el-button size="small" @click="deleteTransaction(row.transactionId)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-button @click="showAddTransactionDialog">添加事务</el-button>

        <!-- 添加事务对话框 -->
        <!-- ... -->
        <el-dialog title="添加新事务" v-model="addTransactionDialogVisible">
            <el-form :model="newTransaction">
                <el-form-item label="用户ID" prop="userId">
                    <el-input-number v-model="newTransaction.userId" controls-position="right" :min="1"></el-input-number>
                </el-form-item>
                <el-form-item label="类别ID" prop="categoryId">
                    <el-input-number v-model="newTransaction.categoryId" controls-position="right"
                        :min="1"></el-input-number>
                </el-form-item>
                <el-form-item label="金额" prop="amount">
                    <el-input-number v-model="newTransaction.amount" controls-position="right" :min="0"></el-input-number>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="newTransaction.description"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addTransactionDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="addTransaction">确定</el-button>
            </span>
        </el-dialog>


        <!-- 编辑事务对话框 -->
        <!-- ... -->
        <el-dialog title="编辑事务" v-model="editTransactionDialogVisible">
            <el-form :model="currentTransaction">
                <el-form-item label="用户ID" prop="userId">
                    <el-input-number v-model="currentTransaction.userId" controls-position="right"
                        :min="1"></el-input-number>
                </el-form-item>
                <el-form-item label="类别ID" prop="categoryId">
                    <el-input-number v-model="currentTransaction.categoryId" controls-position="right"
                        :min="1"></el-input-number>
                </el-form-item>
                <el-form-item label="金额" prop="amount">
                    <el-input-number v-model="currentTransaction.amount" controls-position="right"
                        :min="0"></el-input-number>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="currentTransaction.description"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editTransactionDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="editTransaction">确定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElRadioGroup, ElRadio, ElTable, ElTableColumn, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus';

interface Transaction {
    transactionId: number;
    userId: number;
    categoryId: number;
    amount: number;
    description: string;
}
const selectedType = ref('income');
const transactions = ref<Transaction[]>([]);
const addTransactionDialogVisible = ref(false);
const editTransactionDialogVisible = ref(false);
const newTransaction = ref({ userId: 0, categoryId: 0, amount: 0, description: '' });
const currentTransaction = ref({ transactionId: 0, userId: 0, categoryId: 0, amount: 0, description: '' });

const filteredTransactions = computed(() => {
    return transactions.value.filter(transaction =>
        (selectedType.value === 'income' && transaction.categoryId <= 10) ||
        (selectedType.value === 'outcome' && transaction.categoryId > 10)
    );
});

const fetchData = async () => {
    const response = await fetch('http://localhost:8080/api/transactions/all');
    if (response.ok) {
        const data = await response.json();
        transactions.value = data;
    }
};

// 添加、编辑和删除事务的方法
// ...
const showAddTransactionDialog = () => {
    addTransactionDialogVisible.value = true;
};

const addTransaction = () => {
    // 添加事务的逻辑
    // 例如，向数组中添加新事务，然后重置表单
    transactions.value.push({ ...newTransaction.value, transactionId: Date.now() }); // 使用当前时间戳作为事务ID
    newTransaction.value = { userId: 0, categoryId: 0, amount: 0, description: '' };
    addTransactionDialogVisible.value = false;
};

const showEditTransactionDialog = (transaction: Transaction) => {
    currentTransaction.value = { ...transaction };
    editTransactionDialogVisible.value = true;
};

const editTransaction = () => {
    // 编辑事务的逻辑
    const index = transactions.value.findIndex(t => t.transactionId === currentTransaction.value.transactionId);
    if (index !== -1) {
        transactions.value[index] = { ...currentTransaction.value };
    }
    editTransactionDialogVisible.value = false;
};

const deleteTransaction = (transactionId: number) => {
    // 删除事务的逻辑
    transactions.value = transactions.value.filter(t => t.transactionId !== transactionId);
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

<!-- <template>
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
</style> -->
