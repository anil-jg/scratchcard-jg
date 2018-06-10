export class SimpleButton extends PIXI.Graphics {

    private label: PIXI.Text;

    constructor(width: number, height: number, color: number) {
        super();

        this.buttonMode = true;
        this.interactive = true;

        this.beginFill(color);
        this.drawRect(0, 0, width, height);

        this.on("pointerdown", this.onPointerDown);
        this.on("pointerup", this.onPointerUp);
        this.on("pointerout", this.onPointerUp);
        this.on("pointeroutside", this.onPointerUp);

        this.label = new PIXI.Text("Reveal All", {
            fill: 0xffffff,
            fontSize: 20,
            dropShadow: true,
            dropShadowColor: "#000000",
            dropShadowBlur: 2,
            dropShadowDistance: 2,
            dropShadowAngle: Math.PI / 4,
        });
        this.label.anchor.set(0.5, 0.5);
        this.label.position.set(width * 0.5, height * 0.5);
        this.addChild(this.label);
    }

    private onPointerDown(event: PIXI.interaction.InteractionEvent): void {
        this.alpha = 0.7;
    }

    private onPointerUp(event: PIXI.interaction.InteractionEvent): void {
        this.alpha = 1;
    }

    public set text(value: string) {
        this.label.text = value;
    }
}
