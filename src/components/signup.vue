<template>
    <div class="app-container">
        <div class="container1">
            <!-- 左侧图片 -->
            <div class="left-section">
                <img src="../assets/pic/占位.png" alt="Login Image" />
            </div>

            <!-- 中间分割线 -->
            <div class="divider"></div>

            <div class="signup-container">
                <el-card class="border-card" shadow="hover">
                    <div id="touxiang">
                        <el-avatar> user </el-avatar>
                    </div>
                    <div class="progress">
                        <el-progress class="pro" :text-inside="false" :stroke-width="10" :percentage="70" striped
                            striped-flow />
                    </div>
                    <el-form ref="signupForm" class="signup-form" label-width="80px">
                        <el-form-item label="姓名" prop="username">
                            <el-input v-model="username" placeholder="请输入姓名"></el-input>
                        </el-form-item>

                        <el-form-item label="密码" prop="password">
                            <el-input v-model="passwordHash" type="password" placeholder="请输入密码"></el-input>
                        </el-form-item>

                        <el-form-item label="邮箱" prop="email">
                            <el-input v-model="email" placeholder="请输入邮箱"></el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-button type="primary" @click="handleSignup">注册</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import { useRouter } from 'vue-router'
let username = ref('')
let passwordHash = ref('')
let email = ref('')

const router = useRouter()
const handleSignup = () => {
    // 这里可以添加注册逻辑，例如发起注册请求
    // 如果注册成功，可以跳转到登录页面或其他页面
    fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.value, passwordHash: passwordHash.value, email: email.value })
    })
        .then(response => {
            if (response.ok) {
                router.push('/')
            } else {
                alert('Registration failed');
            }
        })
        .catch(error => console.error('Error:', error));

}

</script>

<style scoped>
.container1 {
    display: flex;
    height: 100vh;
}

.signup-container {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.signup-form {
    margin-top: 20px;
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

#touxiang {
    display: flex;
    justify-content: center;
}

.progress {
    margin-bottom: 10px;
    width: 100%;
}

.pro {

    display: flex;
    justify-content: center;
    align-items: center;
}

.divider {
    height: 100%;
    width: 1px;
    background-color: #ccc;
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
</style>
