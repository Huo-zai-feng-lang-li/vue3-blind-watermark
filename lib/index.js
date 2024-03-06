import { createApp } from "vue";

export default {
	watermarkInstance: null,
	async install(app, options) {
		const WatermarkComponent = await import("./components/Watermark.vue").catch(
			() => {
				console.error("Failed to load the Watermark component");
				return null;
			}
		);

		if (WatermarkComponent) {
			const instance = createApp(WatermarkComponent.default, { ...options });
			const div = document.createElement("div");
			document.body.appendChild(div);
			this.watermarkInstance = instance.mount(div);
		}
	},
};
