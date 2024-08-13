<template>
    <topnav @changeCanvasSize="changeCanvasSize" />
    <div class="drawing-board">
        <!-- 使用 Element Plus 的容器布局 -->
        <el-row justify="center" align="middle">
            <el-col :span="24">
                <!-- Canvas 用于绘制区域 -->
                <canvas ref="canvas" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing"
                    @mouseleave="stopDrawing"></canvas>
            </el-col>
        </el-row>

        <!-- 工具栏，包含颜色选择、工具选择、笔刷大小调节和操作按钮 -->
        <el-row justify="center" class="tools" :gutter="20">
            <el-col :span="1">
                <!-- 颜色选择器 -->
                <el-color-picker v-model="color" @change="updateColor" />
            </el-col>
            <el-col :span="3">
                <!-- 工具选择按钮 -->
                <el-button-group>
                    <el-button @click="setTool('brush')" round>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="m13.289 6.213l4.939-3.842a1 1 0 0 1 1.32.083l2.995 2.994a1 1 0 0 1 .082 1.32l-3.84 4.939a7.505 7.505 0 0 1-7.283 9.292C8 20.999 3.5 19.497 1 17.997c3.98-3 3.047-4.81 3.5-6.5c1.058-3.95 4.842-6.258 8.789-5.284M16.7 8.092q.098.095.194.193L18.03 9.42l2.475-3.182l-1.746-1.746l-3.182 2.475z" />
                        </svg>
                    </el-button>
                    <el-button @click="setTool('eraser')" round>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M14 18.997h7v2h-9l-3.998.002l-6.487-6.488a1 1 0 0 1 0-1.414L12.12 2.491a1 1 0 0 1 1.414 0l7.779 7.778a1 1 0 0 1 0 1.414zm1.657-4.486l3.535-3.535l-6.364-6.364l-3.535 3.535z" />
                        </svg>
                    </el-button>
                </el-button-group>
            </el-col>
            <el-col :span="4">
                <div class="slider-demo-block">
                    <span class="demonstration">笔刷大小</span>
                    <el-slider v-model="brushSize" :min="1" :max="50" @change="updateBrushSize"></el-slider>
                </div>
            </el-col>
            <el-col :span="4">
                <el-popconfirm title="真的要清空画布吗?" hide-icon="true" @confirm="clear">
                    <template #reference>
                        <el-button circle size="large">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path fill="currentColor"
                                    d="M17 4h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5V2h10zM9 9v8h2V9zm4 0v8h2V9z" />
                            </svg>
                        </el-button>
                    </template>
                </el-popconfirm>

                <!-- 撤销、重做和保存按钮 -->
                <el-button @click="undo" circle size="large">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8 7v4L2 6l6-5v4h5a8 8 0 1 1 0 16H4v-2h9a6 6 0 0 0 0-12z" />
                    </svg>
                </el-button>
                <el-button @click="redo" circle size="large">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M16 7h-5a6 6 0 1 0 0 12h9v2h-9a8 8 0 1 1 0-16h5V1l6 5l-6 5z" />
                    </svg>
                </el-button>
                <el-button @click="saveImage" circle size="large">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M5 5v14h14V7.828L16.172 5zM4 3h13l3.707 3.707a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m8 15a3 3 0 1 1 0-6a3 3 0 0 1 0 6M6 6h9v4H6z" />
                    </svg>
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useDrawingStore } from '../stores/drawing';
import topnav from './TopNav.vue'

const canvas = ref(null);
const ctx = ref(null);
const drawingStore = useDrawingStore();

const color = ref(drawingStore.currentColor);
const brushSize = ref(drawingStore.brushSize);
let isDrawing = false;

const canvasWidth = ref(800);
const canvasHeight = ref(600);
const backgroundColor = ref('#ffffff'); // 默认背景颜色

const currentTool = ref('brush');

const setTool = (tool) => {
    currentTool.value = tool;
    drawingStore.setTool(tool);
};

watch(canvasWidth, resizeCanvas);
watch(canvasHeight, resizeCanvas);

// 监听画布大小变化
function changeCanvasSize(size) {
    switch (size) {
        case 'small':
            canvasWidth.value = 640;
            canvasHeight.value = 480;
            break;
        case 'medium':
            canvasWidth.value = 800;
            canvasHeight.value = 600;
            break;
        case 'large':
            canvasWidth.value = 1024;
            canvasHeight.value = 768;
            break;
    }
    resizeCanvas(); // 调整画布大小
}

onMounted(() => {
    resizeCanvas(); // 调整画布大小并设置背景
});

// 调整画布大小并设置默认背景颜色
function resizeCanvas() {
    const canvasEl = canvas.value;
    canvasEl.width = canvasWidth.value;
    canvasEl.height = canvasHeight.value;

    ctx.value = canvasEl.getContext('2d', { willReadFrequently: true });

    // 设置背景颜色
    ctx.value.fillStyle = backgroundColor.value;
    ctx.value.fillRect(0, 0, canvasEl.width, canvasEl.height);

    redrawCanvas(); // 重新绘制画布上的内容
}

function startDrawing(event) {
    if (currentTool.value === 'paintBucket') {
        const { offsetX, offsetY } = event;
        const targetColor = ctx.value.getImageData(offsetX, offsetY, 1, 1).data;
        const fillColor = hexToRgb(color.value);
        floodFill(ctx.value, offsetX, offsetY, targetColor, fillColor);
    } else {
        isDrawing = true;

        const { offsetX, offsetY } = event;
        const path = {
            color: drawingStore.currentTool === 'brush' ? drawingStore.currentColor : '#FFFFFF',
            size: drawingStore.brushSize,
            points: [{ x: offsetX, y: offsetY }],
        };

        drawingStore.addPath(path);
    }
}

function draw(event) {
    if (!isDrawing || currentTool.value === 'paintBucket') return;

    const { offsetX, offsetY } = event;
    const path = drawingStore.paths[drawingStore.paths.length - 1];
    path.points.push({ x: offsetX, y: offsetY });

    redrawCanvas();
}

function stopDrawing() {
    isDrawing = false;
}

function redrawCanvas() {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height);

    ctx.value.fillStyle = backgroundColor.value;

    for (const path of drawingStore.paths) {
        ctx.value.strokeStyle = path.color;
        ctx.value.lineWidth = path.size;
        ctx.value.beginPath();

        for (let i = 0; i < path.points.length; i++) {
            const point = path.points[i];
            if (i === 0) {
                ctx.value.moveTo(point.x, point.y);
            } else {
                ctx.value.lineTo(point.x, point.y);
            }
        }
        ctx.value.stroke();
    }
}

function updateColor() {
    drawingStore.setColor(color.value);
}

function updateBrushSize() {
    drawingStore.setBrushSize(brushSize.value);
}

function clear() {
    drawingStore.clear();
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

function undo() {
    drawingStore.undo();
    redrawCanvas();
}

function redo() {
    drawingStore.redo();
    redrawCanvas();
}

function saveImage() {
    const link = document.createElement('a');
    link.download = 'drawing.jpg';
    link.href = canvas.value.toDataURL('image/jpeg');
    link.click();
}

// 转换颜色格式
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function uint8ClampedArrayToRGBA(arr) {
    if (arr.length !== 4) {
        throw new Error('Array length must be 4 to convert to RGBA.');
    }
    return {
        r: arr[0],
        g: arr[1],
        b: arr[2],
        a: arr[3]
    };
}

function floodFill(ctx, x, y, targetColor, fillColor) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const getPixelColor = (x, y) => {
        const index = (y * width + x) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2],
            a: data[index + 3],
        };
    };

    const setPixelColor = (x, y, color) => {
        const index = (y * width + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255; // 设置不透明度为100%
    };

    const colorsMatch = (color1, color2) => {
        return color1.r === color2.r && color1.g === color2.g && color1.b === color2.b && color1.a === color2.a;
    };

    // 检查点击的像素颜色是否已经是填充颜色，如果是则无需填充
    if (colorsMatch(getPixelColor(x, y), fillColor)) {
        return;
    }

    const queue = [{ x, y }];

    while (queue.length > 0) {
        const { x, y } = queue.shift();

        if (x < 0 || y < 0 || x >= width || y >= height) {
            continue;
        }

        const currentColor = getPixelColor(x, y);

        if (colorsMatch(currentColor, uint8ClampedArrayToRGBA(targetColor))) {
            setPixelColor(x, y, fillColor);
            queue.push({ x: x + 1, y });
            queue.push({ x: x - 1, y });
            queue.push({ x, y: y + 1 });
            queue.push({ x, y: y - 1 });
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
</script>


<style>
.drawing-board {
    padding: 2vh;
}

canvas {
    border: 3px solid #95aeaa;
    border-radius: 10px;
    cursor: crosshair;
    display: block;
    margin: 0 auto;
}

.tools {
    text-align: center;
    margin-top: 3vh;
}
</style>
