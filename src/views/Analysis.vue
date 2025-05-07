<template>
    <div class="analysis">
        <div class="content">
            <el-row>
                <!-- 第一列 -->
                <el-col :span="17">
                    <div class="grid-content ep-bg-purple" />
                    <!-- 地图 -->
                    <div id="map" class="map"></div>
                </el-col>
                <!-- 第二列 -->
                <el-col :span="7">
                    <div class="grid-content ep-bg-purple-light" />
                    <el-row>
                        <!-- 第一个卡片 -->
                        <el-card style="max-width: 480px">
                            <template #header>
                                <div class="card-header">
                                    <span>按『类别』统计数据</span>
                                </div>
                            </template>
                            <p v-for="(item, index) in categoryData" :key="index" class="text item">
                                <span class="r1">{{ 'Top' + (index + 1) }}</span>
                                <span class="r2">{{ item.categoryDesc }}</span>
                                <span class="r3">{{ item.quantity }}</span>
                            </p>
                        </el-card>
                    </el-row>

                    <el-row>
                        <!-- 第二个卡片 -->
                        <el-card style="max-width: 480px">
                            <template #header>
                                <div class="card-header">
                                    <span>按『城市』统计数据</span>
                                </div>
                            </template>
                            <p v-for="(item, index) in cityData" :key="index" class="text item">
                                <span class="r1">{{ 'Top' + (index + 1) }}</span>
                                <span class="r2">{{ item.city }}</span>
                                <span class="r3">{{ item.quantity }}</span>
                            </p>
                        </el-card>
                    </el-row>
                </el-col>
            </el-row>
        </div>
        <!-- 统计组件 -->
        <div class="statistic">
            <el-statistic title="岗位总量" :value="total" />
        </div>
    </div>
</template>

<script setup>
// 引入中国地图json数据
import chinamap from '@/map/chinamap'
import * as echarts from 'echarts'
import { onMounted } from 'vue';
import {
    getJobByProvince,
    getJobByCity,
    getJobByCategory,
    getJobListData
} from '@/utils/apis'
import { reactive, ref } from 'vue';
const mapEcharts = () => {
    let chartDom = document.getElementById('map')
    if (chartDom) {
        // 初始化echarts实例
        let mapChart = echarts.init(chartDom);

        // 注册地图
        echarts.registerMap('chinamap', chinamap);

        // 设置配置项
        let options = {
            roam: true, // 鼠标缩放地图

            // 提示框
            tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{c}'
            },

            // 工具栏：数据视图、还原、保存为图片
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                iconStyle: {
                    color: 'none',
                    borderColor: '#fff',
                    borderWidth: 1,
                    borderType: 'solid'
                },
                feature: {
                    dataView: { readOnly: false },
                    restore: {},
                    saveAsImage: {}
                }
            },
            // 视觉映射组件
            visualMap: {
                min: 0,
                max: 5000,
                text: ['High', 'Low'],
                left: 'left',
                realtime: false,
                calculable: true,
                textStyle: {
                    fontWeight: 'bold', // 字体加粗
                    color: '#fff', // 字体颜色
                },
                inRange: {
                    color: ['lightskyblue', 'yellow', 'orangered']
                }
            },
            // 地理区域数据可视化，配合visualMap，展示不同区域的数据
            series: [
                {
                    type: 'map',
                    map: 'chinamap',
                    zoom: 1.4, // 默认缩放级别
                    center: [104.114129, 37.550339], // 缩放中心点，北京的经纬度

                    // 地图文字设置
                    label: {
                        show: true,
                        fontSize: 8,
                    },

                    itemStyle: {
                        borderColor: '#091A7A',
                        borderWidth: 1,
                    },

                    emphasis: {
                        itemStyle: {
                            areaColor: '#0258f0', // 高亮时的颜色
                        }
                    },

                    // 区域数据
                    data: dataList.value
                    // data: [
                    //     { name: '北京市', value: 120 },
                    //     { name: '天津市', value: 120 },
                    //     { name: '河北省', value: 220 },
                    //     { name: '山西省', value: 520 },
                    //     { name: '内蒙古自治区', value: 220 },
                    //     { name: '辽宁省', value: 210 },
                    //     { name: '吉林省', value: 120 },
                    //     { name: '黑龙江省', value: 120 },
                    //     { name: '上海市', value: 120 },
                    //     { name: '江苏省', value: 520 },
                    //     { name: '浙江省', value: 220 },
                    // ],
                }
            ]
        }

        // 绘制地图
        mapChart.setOption(options);
    }
}



let dataList = ref([]); //保存后端响应JobsByProvinceVo
// 将JobsByProvinceVo转换为echarts规定的数据格式，即{ name: '北京市', value: 120 }
let dataTemp = reactive({})

let categoryData = ref([])// 保存后端JobsByCategoryVo的top5
let cityData = ref([]) //保存后端JobsByCityVo的top5
let total = ref(0) //总记录数
const fetchData = () => {
    // 按类别拿岗位数量
    getJobByCategory().then(res => {
        // console.log(res.data.data)
        for (let i in res.data.slice(0, 5)) {
            categoryData.value.push(res.data[i]);
        }

    })

    // 按城市拿岗位数据
    getJobByCity().then(res => {
        // console.log(res.data.data)
        for (let i in res.data.slice(0, 5)) {
            cityData.value.push(res.data[i]);
        }
    })

    //获取第一页数据拿到总记录数total
    getJobListData(1).then(res => {
        // console.log(res.data.data)
        total.value = res.data.total
    })
}
// 挂载后
onMounted(() => {
    getJobByProvince().then(res => {
        // console.log(res.data.data);
        for (let i in res.data) {
            // 写法一：使用 Object.assign 进行的是浅拷贝，这意味着如果源对象包含嵌套对象，嵌套对象不会被复制，而是引用同一个对象。
            // dataTemp = Object.assign({},{
            //     name: res.data.data[i]['province'],
            //     value: res.data.data[i]['quantity']
            // })
            // 写法二：使用 reactive 包装新的对象
            dataTemp = reactive({
                name: res.data[i]['province'],
                value: res.data[i]['quantity']
            });
            dataList.value.push(dataTemp)
        }
        mapEcharts()//渲染echarts
    })
    // console.log(dataList.value);

    fetchData();

})
</script>

<style lang="less" scoped>
.map {
    height: 630px;
    margin-left: 15px;
}

.analysis {
    background-color: #3366FF;
    position: relative;
    height: 630px;
}

.content {
    position: absolute;
    width: 100%;
}

.statistic {
    position: absolute;
    z-index: 3;
    margin-top: 25px;
    margin-left: 25px;
}

// :deep 可以穿透并修改子组件的样式
:deep( .el-statistic__head) {
    font-size: 22px;
    color: #fff;
    font-weight: bolder;
    margin-bottom: 10px;
}

:deep( .el-statistic__number ){
    color: #DBA230;
    font-weight: bolder;
}

.el-card {
    background-color: transparent;
    margin-top: 12px;
    margin-bottom: 12px;
    margin-left: 30px;
    border-color: rgb(62, 94, 221);
    border-width: 2px;
    font-size: 15px;
    color: #fff;
}

.card-header {
    font-weight: bolder;
}

.r1 {
    margin-right: 12px;
}

.r2 {
    width: 185px;
    display: inline-block;
}

.r3 {
    color: #DBA230;
}
</style>