<template>
    <div class="app-container">
        <div class="login-container">
            <!-- 左侧图片 -->
            <div class="left-section">
                <img src="../assets/pic/占位.png" alt="Login Image" />
            </div>

            <!-- 中间分割线 -->
            <div class="divider"></div>

            <!-- 右侧表单 -->
            <div class="right-section">
                <el-form ref="loginForm" label-width="80px">
                    <div id="touxiang">
                        <el-avatar> user </el-avatar>
                    </div>
                    <br>
                    <el-form-item label="姓名" prop="username">
                        <el-input v-model="username" placeholder="请输入姓名"></el-input>
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="passwordHash" placeholder="请输入密码"></el-input>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="login">登录</el-button>
                        <el-button @click="register">注册</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "Login1"
}
</script>
<script setup lang="ts">
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import { useRouter } from 'vue-router'
// const form = ref({
//     username: '',
//     passwordHash: '',
// });
let username = ref('')
let passwordHash = ref('')
const router = useRouter()
const login = () => {
    // 处理登录逻辑
    fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.value, passwordHash: passwordHash.value })
    })
        .then(response => response.json())
        .then(data => {
            if (data.userId) {
                sessionStorage.setItem('userId', data.userId); // 存储用户ID
                //alert('ok');
                router.push('/home')
            } else {
                alert('Invalid credentials');
            }
        })
        .catch(error => console.error('Error:', error));

};

const register = () => {
    // 处理注册逻辑
    router.push('/signup')
};
</script>

<style scoped>
.login-container {
    display: flex;
    height: 100vh;
}

.left-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.left-section img {
    max-width: 100%;
    max-height: 100%;
}

.divider {
    height: 100%;
    width: 1px;
    background-color: #ccc;
}

.right-section {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#touxiang {
    display: flex;
    justify-content: center;
}

.app-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    /* 可根据实际情况调整高度，这里设置为视口高度 */
    padding: 20px;
    /* 适当调整边缘空白 */
    background-color: #f0f0f0;
    /* 背景颜色 */
}

/* Add your custom styles here */
</style>
