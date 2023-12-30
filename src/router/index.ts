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
        // {
        //     path: '/home/submission',
        //     components: {
        //         rootview: home,
        //         homeview: su
        //     }
        // },
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
                    path: 'budgetTracking',
                    components: {
                        homeview: budgetTrack
                    }
                },
                {
                    path: 'financialGoals',
                    components: {
                        homeview: financialGoals
                    }
                }
                // {
                //     path: 'trendsAnalysis',
                //     components: {
                //         homeview: trendsAnalysisVue
                //     }
                // },
                // {
                //     path: 'FSummary',
                //     components: {
                //         homeview: FSummaryVue
                //     }
                // }
            ]
        }
    ]
})
//暴露出去
export default router