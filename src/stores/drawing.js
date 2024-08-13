import { defineStore } from 'pinia';

export const useDrawingStore = defineStore('drawing', {
    state: () => ({
        paths: [],
        undonePaths: [],
        currentColor: '#57E79D',
        currentTool: 'brush',
        brushSize: 5, // 默认笔刷大小
        backgroundColor: '#ffffff',
    }),
    actions: {
        addPath(path) {
            this.paths.push(path);
            this.undonePaths = []; // 清空撤销列表
        },
        undo() {
            if (this.paths.length > 0) {
                const undonePath = this.paths.pop();
                this.undonePaths.push(undonePath);
            }
        },
        redo() {
            if (this.undonePaths.length > 0) {
                const redonePath = this.undonePaths.pop();
                this.paths.push(redonePath);
            }
        },
        clear() {
            this.undonePaths = [];
            this.paths = [];
        },
        setColor(color) {
            this.currentColor = color;
        },
        setTool(tool) {
            this.currentTool = tool;
        },
        setBrushSize(size) {
            this.brushSize = size; // 更新笔刷大小
        },
        fillBucket(position) {
            const newPath = {
                type: 'fill',
                color: this.currentColor,
                position: position,
            };
            this.addPath(newPath);
        },
        setBackgroundColor(color) {
            this.backgroundColor = color;
        }
    },
});

