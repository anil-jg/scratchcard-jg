import { TweenMax } from "gsap";
import { PRIZES } from "./prizes";

declare module "gsap" {
    export interface TweenConfig {
        [p: string]: any;
    }
}

export class Tile extends PIXI.Container {

    private static brush: PIXI.Sprite;
    private static rect: PIXI.Graphics;
    private static readonly brushRadius: number = 30;
    private static readonly maxCircles: number = 4;

    private id: number;
    private renderer: PIXI.SystemRenderer;
    private renderTexture: PIXI.RenderTexture;
    private prize: PIXI.Sprite;
    private label: PIXI.Text;
    private dragging: boolean;
    private points: PIXI.Point[];

    constructor(renderer: PIXI.SystemRenderer) {
        super();

        this.renderer = renderer;

        if (Tile.brush === undefined) {
            Tile.brush = PIXI.Sprite.fromImage("assets/images/brush2.png");
            Tile.brush.width = Tile.brushRadius * 2;
            Tile.brush.height = Tile.brushRadius * 2;
            Tile.brush.anchor.set(0.5, 0.5);
        }

        const cover = PIXI.Sprite.fromFrame("tile_bg_unscratched.png");
        this.addChild(cover);

        if (Tile.rect === undefined) {
            Tile.rect = new PIXI.Graphics();
            Tile.rect.beginFill(0xffffff);
            Tile.rect.drawRect(0, 0, cover.width, cover.height);
            Tile.rect.endFill();
        }

        const main: PIXI.Container = new PIXI.Container();
        this.addChild(main);

        const bg: PIXI.Sprite = PIXI.Sprite.fromFrame("tile_underlay.png");
        main.addChild(bg);

        const scratched: PIXI.Sprite = PIXI.Sprite.fromFrame("tile_bg_scratched_default.png");
        main.addChild(scratched);

        this.prize = new PIXI.Sprite();
        this.prize.anchor.set(0.5, 0.5);
        this.prize.scale.set(0.7, 0.7);
        this.prize.position.set(cover.width * 0.5, cover.height * 0.5);
        main.addChild(this.prize);

        this.label = new PIXI.Text("", {
            fill: 0xffffff,
            fontSize: 20,
            stroke: 0x000000,
            strokeThickness: 3,
        });
        this.label.anchor.set(0.5, 1);
        this.label.position.set(bg.width * 0.5, bg.height - 5);
        main.addChild(this.label);

        this.renderTexture = PIXI.RenderTexture.create(cover.width, cover.height);
        const renderTextureSprite: PIXI.Sprite = new PIXI.Sprite(this.renderTexture);
        this.addChild(renderTextureSprite);
        main.mask = renderTextureSprite;

        this.points = [];
        this.dragging = false;
        this.interactive = true;
        this.on("pointermove", this.onPointerMove);
        this.on("pointerover", this.onPointerOver);
        this.on("pointerdown", this.onPointerOver);
        this.on("pointerout", this.onPointerOut);
        this.on("pointeroutside", this.onPointerOut);
        this.on("pointerup", this.onPointerOut);
    }

    public setPrize(prize: number): void {
        this.points = [];
        this.dragging = false;
        this.interactive = true;
        this.prize.alpha = 1;
        this.prize.scale.set(0.7, 0.7);

        TweenMax.killTweensOf(this.prize.scale);

        this.id = prize;
        this.prize.texture = PIXI.Texture.fromFrame(PRIZES[this.id].img);
        this.label.text = (this.id > 0) ? "$" + PRIZES[this.id].value : "";

        this.renderer.render(new PIXI.Graphics(), this.renderTexture, true, null, false);
    }

    public reveal(): void {
        this.dragging = false;
        this.interactive = false;
        this.renderer.render(Tile.rect, this.renderTexture, false, null, false);

        this.emit("revealed", this);
    }

    public win(): void {
        TweenMax.to(this.prize.scale, 1, {x: 1, y: 1, repeat: -1, yoyo: true});
    }

    public fail(): void {
        this.prize.alpha = 0.5;
    }

    public get prizeId(): number {
        return this.id;
    }

    private onPointerMove(event: PIXI.interaction.InteractionEvent): void {
        if (this.dragging) {
            const point: PIXI.Point = event.data.getLocalPosition(this);
            Tile.brush.rotation = Math.random() * Math.PI;
            Tile.brush.position.copy(point);
            this.renderer.render(Tile.brush, this.renderTexture, false, null, false);

            if (point.x < Tile.brushRadius) {
                point.x = Tile.brushRadius;
            }
            if (point.y < Tile.brushRadius) {
                point.y = Tile.brushRadius;
            }
            if (point.x > this.width - Tile.brushRadius) {
                point.x = this.width - Tile.brushRadius;
            }
            if (point.y > this.height - Tile.brushRadius) {
                point.y = this.height - Tile.brushRadius;
            }

            if (this.points.length === 0) { 
                this.points.push(point);
            } else {
                const len: number = this.points.length;
                for (let i = 0; i < len; i++) {
                    if (this.pointInCircle(this.points[i], point, Tile.brushRadius)) {
                        return;
                    }
                }
                this.points.push(point);
                if (len >= Tile.maxCircles) {
                    this.reveal();
                }
            }
        }
    }

    private onPointerOver(event: PIXI.interaction.InteractionEvent): void {
        this.dragging = true;
    }

    private onPointerOut(event: PIXI.interaction.InteractionEvent): void {
        this.dragging = false;
    }

    private pointInCircle(pA: PIXI.Point, pB: PIXI.Point, radius: number): boolean {
        const dx: number = pA.x - pB.x;
        const dy: number = pA.y - pB.y;
        const distancesquared = dx * dx + dy * dy;
        return distancesquared <= radius * radius;
    }
}
