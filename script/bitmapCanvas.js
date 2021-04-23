export default class {

	constructor(bitmapSrc) {
		this.bitmap = new Image();
		this.bitmap.src = bitmapSrc;

		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
	}

	async load() {
		await this.bitmap.decode();
		this.canvas.width = this.width = this.bitmap.width;
		this.canvas.height = this.height = this.bitmap.height;
		this.context.drawImage(this.bitmap, 0, 0);
	}

	findBorder() {

	}

	crop() {
		
	}
}