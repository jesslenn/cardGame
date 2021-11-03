import Card from "../helpers/card";
import Zone from "../helpers/zone";

export default class Game extends Phaser.Scene {
  constructor() {
    super({
      key: "Game",
    });
  }
  preload() {
    this.load.image("cardBack", "src/assets/CardBack.png");
    this.load.image("card1", "src/assets/Card-1.png");
    this.load.image("card2", "src/assets/Card-2.png");
  }
  create() {
    let scene = this;

    //Drop Zone:
    scene.zone = new Zone(scene);
    scene.dropZone = scene.zone.renderZone();
    scene.outline = scene.zone.renderOutline(scene.dropZone);

    scene.dealText = scene.add
      .text(75, 350, ["DEAL CARDS"])
      .setFontSize(18)
      .setFontFamily("Trebuchet MS")
      .setColor("#00ffff")
      .setInteractive();

    scene.dealCards = () => {
      //let's deal 5 cards, not just one:
      for (let i = 0; i < 5; i++) {
        let playerCard = new Card(scene); //we are creating a new card on this scene!
        playerCard.render(475 + i * 100, 650, "card1");
        //Calls the render function we built in our Card constructor & lays the cards out i * 100 so they are not on top of eachother.
      }
    };

    scene.dealText.on("pointerdown", function () {
      scene.dealCards();
    });
    scene.dealText.on("pointerover", function () {
      scene.dealText.setColor("#ff69b4");
    });
    scene.dealText.on("pointerout", function () {
      scene.dealText.setColor("#00ffff");
    });

    scene.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    //GAME FUNCTIONALITY:
    //This function pulls the card in hand to the top and tints it:
    scene.input.on("dragstart", function (pointer, gameObject) {
      gameObject.setTint(0xff69b4);
      scene.children.bringToTop(gameObject);
    });

    //This function sends it back to start if you don't drop it in the dropbox:
    scene.input.on("dragend", function (pointer, gameObject, dropped) {
      gameObject.setTint(); // de-tint!
      if (!dropped) {
        gameObject.x = gameObject.input.dragStartX;
        gameObject.y = gameObject.input.dragStartY;
      }
    });
    //This handles the drop IN the designated box!
    scene.input.on("drop", function (pointer, gameObject, dropZone) {
      dropZone.data.values.cards++;
      gameObject.x = dropZone.x - 350 + dropZone.data.values.cards * 50;
      gameObject.y = dropZone.y;
      gameObject.disableInteractive();
    });
  }

  update() {}
}
