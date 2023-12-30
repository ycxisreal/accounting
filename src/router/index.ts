import { createRouter, createWebHistory } from 'vue-router'

import signup from '@/components/signup.vue'
import su from '@/components/submission.vue'
import home from '@/components/Home.vue'
import Login1Vue from '@/components/Login1.vue'
import editc from '@/components/editC.vue'
import iomanage from '@/components/iomanage.vue'
import budget from '@/components/budget.vue'
import budgetTrack from '@/components/BudgetTracking.vue'
import financialGoals from '@/components/financialGoals.vue'
import test from '@/components/test.vue'
import summary from '@/components/summary.vue'
import trendsAnalysisVue from '@/components/trendsAnalysis.vue'
// import trendsAnalysisVue from '@/components/trendsAnalysis.vue'
// import FSummaryVue from '@/components/FSummary.vue'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            components: {
                rootview: Login1Vue
            }
        },
        {
            path: '/signup',
            components: {
                rootview: signup
            }
        },
        {
            path: '/home',
            components: {
                rootview: home
            },
            children: [
                {
                    path: 'submission', // 相对路径
                    components: {
                        homeview: su
                    }
                },
                {
                    path: 'editc',
                    components: {
                        homeview: editc
                    }
                },
                {
                    path: 'iomanage',
                    components: {
                        homeview: iomanage
                    }
                },
                {
                    path: 'budget',
                    components: {
                        homeview: budget
                    }
                },
                {
                    path: 'summary',
                    components: {
                        homeview: summary
                    }
                },
                {
                    path: 'financialGoals',
                    components: {
                        homeview: financialGoals
                    }
                },
                {
                    path: 'test',
                    components: {
                        homeview: test
                    }
                },
                {
                    path: 'budgetTracking',
                    components: {
                        homeview: budgetTrack
                    }
                },
                {
                    path: 'trends',
                    components: {
                        homeview: trendsAnalysisVue
                    }
                }
            ]
        }
    ]
})
//暴露出去
export default router