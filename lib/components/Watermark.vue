<template>
	<div ref="watermarkContainer" class="waterMask"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const watermarkContainer = ref<HTMLElement | null>(null);
export interface Props {
	text?: string;
}
const props = withDefaults(defineProps<Props>(), {
	text: "https://github.com/Huo-zai-feng-lang-li",
});
watch(
	() => props.text,
	(newVal: string, oldVal: string) => {
		if (newVal !== oldVal) {
			addWatermark();
		}
	}
);
// 获取计算后的样式属性
function getComputedStyleForElement(el: Element, property: string): string {
	return window.getComputedStyle(el, null).getPropertyValue(property);
}

// 递归获取非透明的背景颜色
function getNonTransparentBackgroundColor(element: Element | null): string {
	if (!element || element === document.body) return "rgb(255, 255, 255)"; // 默认背景色为白色
	const bgColor = getComputedStyleForElement(element, "background-color");
	if (bgColor === "rgba(0, 0, 0, 0)" || bgColor === "transparent") {
		return getNonTransparentBackgroundColor(element.parentElement);
	}
	return bgColor;
}

// 判断颜色是否为深色
const isDarkColor = (color: string): boolean => {
	const rgb = color.match(/\d+/g);
	let brightness: number;
	if (rgb) {
		const [r, g, b] = rgb.map(Number);
		brightness = (r * 299 + g * 587 + b * 114) / 1000;
	} else {
		brightness = 255;
	}
	return brightness < 128;
};

const addWatermark = () => {
	const watermarkText = props.text;
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	// 设置字体，以便我们可以测量文本
	const fontSize = 16;
	ctx.font = `${fontSize}px Arial`;

	// 测量文本宽度
	const textWidth = ctx.measureText(watermarkText).width;

	// 根据文本宽度设置画布大小，添加一些额外的间隔
	const scale = window.devicePixelRatio || 1; // 考虑设备像素比以支持高分辨率显示
	const padding = 50; // 设置50像素的间隔
	canvas.width = (textWidth + padding) * scale;
	canvas.height = fontSize * 2 * scale;

	ctx.scale(scale, scale);
	ctx.font = `${fontSize}px Arial`;

	// 获取背景颜色并设置文本颜色
	const bgColor = getNonTransparentBackgroundColor(watermarkContainer.value);
	const textColor = isDarkColor(bgColor)
		? "rgba(255,255,255,0.005)"
		: "rgba(0,0,0,0.005)";
	ctx.fillStyle = textColor;
	ctx.textAlign = "center";

	// 将文本绘制在画布中央
	ctx.fillText(
		watermarkText,
		canvas.width / scale / 2,
		canvas.height / (scale * 2)
	);

	// 应用水印样式
	const watermarkStyle = watermarkContainer.value?.style;
	if (watermarkStyle) {
		watermarkStyle.position = "fixed";
		watermarkStyle.top = "0";
		watermarkStyle.left = "0";
		watermarkStyle.width = "100%";
		watermarkStyle.height = "100%";
		watermarkStyle.zIndex = "9999";
		watermarkStyle.pointerEvents = "none";
		watermarkStyle.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
		watermarkStyle.backgroundRepeat = "repeat";
		watermarkStyle.backgroundSize = `${canvas.width / scale}px ${
			canvas.height / scale
		}px`; // 设置背景大小以匹配画布大小
	}
	console.log(
		"% W is running",
		"color: #1e80ff; font-size: 20px; background: #fff; padding: 8px;"
	);
};
let observer: MutationObserver | null = null;

onMounted(() => {
	addWatermark();
	if (watermarkContainer.value) {
		observer = new MutationObserver(() => addWatermark());
		observer.observe(watermarkContainer.value, {
			attributes: true,
			childList: true,
			subtree: true,
		});
	}
});

onUnmounted(() => {
	if (watermarkContainer.value) {
		watermarkContainer.value.style.backgroundImage = "";
	}
	if (observer) {
		observer.disconnect();
		observer = null;
	}
});
</script>

<style scoped>
.waterMask {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	background: transparent;
	pointer-events: none;
}
</style>
