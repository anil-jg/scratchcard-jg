import * as PIXI from "pixi.js";
import * as PIXISound from "pixi-sound";

import { AnimatedCoins } from "./animatedcoins";
import { SimpleButton } from "./button";
import { Tile } from "./tile";

import { PRIZES } from "./prizes";

export class Game extends PIXI.Application {

    private tiles: Tile[];
    private btnPlay: SimpleButton;
    private currentPrize: number;
    private coins: AnimatedCoins;

    constructor() {
        super(450, 530, {backgroundColor: 0xffffff, legacy: true});
        document.body.appendChild(this.view);

        // set stage
        this.stage = this.stage;

        // preload the assets
        this.preload();
    }

    private preload(): void {
        PIXI.loader.add("assets/images/bg.jpg");
        PIXI.loader.add("assets/images/brush.png");
        PIXI.loader.add("assets/images/coin.json");
        PIXISound.sound.add('afterplay', 'assets/sounds/aftergame.mp3');

        if (window.devicePixelRatio < 2) {
            PIXI.loader.add("assets/images/tiles.json");
        } else {
            PIXI.loader.add("assets/images/tiles@2x.json");
        }

        PIXI.loader.load(this.setup.bind(this));
    }

    private setup(loader: PIXI.loaders.Loader, resources: any): void {
        const bg: PIXI.Sprite = PIXI.Sprite.fromImage("assets/images/bg.jpg");
        // this.stage.addChild(bg);

        // add tiles
        this.tiles = [];
        let col: number;
        let row: number;
        let tile: Tile;
        for (let i = 0; i < 9; i++) {
            col = i % 3;
            row = Math.floor(i / 3);
            tile = new Tile(this.renderer);
            tile.position.set(3 + 150 * col, 3 + 150 * row);
            tile.on("revealed", this.onTileRevealed, this);
            this.tiles.push(tile);
            this.stage.addChild(tile);
        }

        // add button
        this.btnPlay = new SimpleButton(300, 50, 0x261c0e);
        this.btnPlay.position.set(80, 470);
        this.btnPlay.on("pointerdown", this.onPointerDown, this);
        this.stage.addChild(this.btnPlay);

        // text message
        this.textMessage = new PIXI.Text('Congrats You Won !!!',{fontFamily : 'Arial', fontSize: 30, fill : 0xFFD700, align : 'center'});
        this.textMessage.position.x = 100;
        this.textMessage.position.y = 300;
        this.textMessage.alpha = 0;
        this.stage.addChild(this.textMessage);
        // add animated coins
        this.coins = new AnimatedCoins(480);
        this.stage.addChild(this.coins);

        // resize
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));

        // set new values to the tiles
        this.newGame();
    }

    private newGame(): void {
        const len: number = PRIZES.length;
        const values: number[] = [];

        // this.textMessage.alpha = 0;
        if(PIXISound.sound){
            PIXISound.sound.stop("afterplay");    
        }
        this.textMessage.alpha = 0;
        // fill the value array with zeros
        for (let i = 0; i < len; i++) {
            values.push(0);
        }

        // puase the coins
        this.coins.pause();

        // define the prizes
        let index: number = 0;
        let limit: number = 3;
        let random: number;
        this.currentPrize = - 1;
        while (index < len - 1) {
            random = Math.floor(Math.random() * PRIZES.length);
            if (values[random] < limit) { // max and only one
                this.tiles[index].setPrize(random);
                index++;

                values[random]++;
                if (values[random] === 3) {
                    this.currentPrize = random;
                    limit = 2; // change the limit
                }
            }
        }
    }

    private revealAll(): void {
        for (const tile of this.tiles) {
            tile.reveal();
        }
    }

    private resize(): void {
        // get the min ratio
        const ratio = Math.min(window.innerWidth / 450, window.innerHeight / 530);

        // scale stage
        this.stage.scale.set(ratio, ratio);

        // resize render
        this.renderer.resize(450 * ratio, 530 * ratio);
    }

    private onPointerDown(event: PIXI.interaction.InteractionEvent): void {
        this.btnPlay.text = "Reveal All";
        if (this.isThereTileRemaining) {
            this.revealAll();
        } else {
            this.newGame();
        }
    }

    private onTileRevealed(tile: Tile): void {
        if (!this.isThereTileRemaining) {
            this.btnPlay.text = "Play Again";
            this.showResult();
        }
    }

    private showResult(): void {
        // this.stage.addChild(this.textMessage);
        var won = false;
        var winningSet = false;
        this.textMessage.alpha = 1;
        var winCount = 0;
        console.log(this.currentPrize);
        if (this.currentPrize > -1) {
            for (const tile of this.tiles) {
                console.log(tile.prizeId);
                if (tile.prizeId === this.currentPrize) {
                    winCount++;
                    tile.win();
                    this.coins.play();
                } else {
                    // if(!winningSet){
                    //     winningSet = true;
                    //     won = false;    
                    // }
                    tile.fail();
                }
            }
            if(winCount==3){
                PIXISound.sound.play("afterplay")
                this.textMessage.text = "Congrats You Won !!!";
            }
            else
            {
                this.textMessage.text = "Better luck next time !";   
            }
        }
        else
        {
            this.textMessage.text = "Better luck next time !";   
        }
    }

    private get isThereTileRemaining(): boolean {
        return this.tiles.filter((x) => x.interactive).length > 0;
    }
}

window.onload = () => {
    const game = new Game();
};
