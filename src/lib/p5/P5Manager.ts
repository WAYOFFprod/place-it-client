import P5 from 'p5';
import GridManager from '$lib/p5/GridManager';
import ControlManager from '$lib/components/toolbar/ControlManager';
import Networker from '$lib/utility/Networker';
import { ToolType, backToTool, setTempTool } from '$lib/stores/toolStore';
import { isReady } from '$lib/stores/canvaStore';

export default class P5Manager {
	private p5!: P5;
	private gridManager!: GridManager;
	private controlManager!: ControlManager;
	private networker: Networker;
	private wheelHandler!: (e: WheelEvent) => void;

	constructor(
		container: HTMLElement,
		private canva: CanvaPreviewData,
		private viewOnly: boolean,
		private marginBottom: number,
		private setPaletteColors: (colors: string[]) => void
	) {
		this.networker = Networker.getInstance();

		const script = (canvas: P5) => {
			this.p5 = canvas;
			this.p5.setup = this.setup.bind(this);
			this.p5.draw = this.draw.bind(this);
			this.p5.mousePressed = this.mousePressed.bind(this);
			this.p5.touchStarted = this.touchStarted.bind(this);
			this.p5.touchEnded = this.touchEnded.bind(this);
			this.p5.mouseReleased = this.mouseReleased.bind(this);
			this.p5.keyPressed = this.keyPressed.bind(this);
			this.p5.keyReleased = this.keyReleased.bind(this);
		};

		new P5(script, container);
	}

	private setup() {
		const cnv = this.p5.createCanvas(this.canva.width, this.canva.height);
		cnv.id('place-it-canvas');
		this.p5.resizeCanvas(this.p5.windowWidth, this.p5.windowHeight - this.marginBottom);
		this.p5.noSmooth();

		this.initManagers();

		this.wheelHandler = (e: WheelEvent) => {
			e.preventDefault();
			if (!this.isTargeting(e.target, 'place-it-canvas')) return;
			if (e.deltaY > 0) {
				this.controlManager.scroll(1 - 0.1);
			} else {
				this.controlManager.scroll(1 + 0.1);
			}
		};
		window.addEventListener('wheel', this.wheelHandler, { passive: false });
	}

	private initManagers() {
		const size: Size2D = { width: this.canva.width, height: this.canva.height };
		this.gridManager = new GridManager(this.p5, size, this.canva.id, this.marginBottom);
		this.controlManager = ControlManager.getInstance(this.p5, this.viewOnly, this.gridManager);

		const data = {
			id: this.canva.id,
			data: this.canva,
			size: size
		};
		this.connect(data);
	}

	private connect(canvasData: CanvaData) {
		this.networker.connectToSocket(this.gridManager);
		const pixels = this.networker.tempPoints as { [key: string]: string };
		this.gridManager.loadImage(canvasData.data.image, pixels);
		this.setPaletteColors(canvasData.data.colors);
		this.networker.joinLiveCanva(canvasData.id);
	}

	private isTargeting(target: EventTarget | null, id: string): boolean {
		if (target == null) return false;
		const targetId = (target as HTMLElement).id;
		return targetId === id;
	}

	private draw() {
		let ready = false;
		const unsubscribe = isReady.subscribe((val) => (ready = val));
		unsubscribe();

		if (!ready) return;

		this.controlManager.checkMousePosition();

		if (this.gridManager.needsUpdate || this.controlManager.hasNewScreenOffset()) {
			this.p5.push();
			this.p5.background(150);
			this.p5.translate(this.gridManager.screenOffset.x, this.gridManager.screenOffset.y);
			this.p5.scale(this.gridManager.currentScale);

			this.gridManager.refreshCanva();
			this.p5.pop();
			this.gridManager.needsUpdate = false;

			this.controlManager.saveScreenOffset();
		}
	}

	private mousePressed(e: MouseEvent) {
		if (!this.isTargeting(e.target, 'place-it-canvas')) return;
		this.controlManager.mousePressed();
	}

	private touchStarted(e: TouchEvent) {
		if (!this.isTargeting(e.target, 'place-it-canvas')) return;
		this.controlManager.mousePressed();
	}

	private touchEnded(e: TouchEvent) {
		if (!this.isTargeting(e.target, 'place-it-canvas')) return;
		this.controlManager.mouseReleased();
	}

	private mouseReleased() {
		this.controlManager.mouseReleased();
	}

	private keyPressed() {
		this.controlManager.keyDown();
		switch (this.p5.keyCode) {
			case this.p5.OPTION:
				setTempTool(ToolType.Hand, this.p5);
				break;
			default:
				break;
		}
	}

	private keyReleased() {
		this.controlManager.keyUp();
		switch (this.p5.keyCode) {
			case this.p5.UP_ARROW:
				this.controlManager.scroll(1 + 0.1);
				break;
			case this.p5.DOWN_ARROW:
				this.controlManager.scroll(1 - 0.1);
				break;
			case this.p5.OPTION:
				backToTool();
				break;
			default:
				break;
		}
	}

	public destroy() {
		this.networker.disconnect();
		if (this.p5) {
			this.p5.remove();
		}
		if (this.controlManager) {
			this.controlManager.destroy();
		}
		// if (this.gridManager) {
		// 	this.gridManager.destroy();
		// }
		if (this.wheelHandler) {
			window.removeEventListener('wheel', this.wheelHandler);
		}
	}

	public getP5() {
		return this.p5;
	}
}
