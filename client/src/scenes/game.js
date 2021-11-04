import Card from "../helpers/card";
import Zone from "../helpers/zone";
import io from "socket.io-client";
import Dealer from "../helpers/dealer";

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
    scene.isPlayerA = false;
    scene.opponentCards = [];

    scene.socket = io("http://localhost:3000");
    scene.socket.on("connect", function () {
      console.log("Connected!");
    });
    //SOCKET COMMUNICATIONS (EMITS)
    scene.socket.on("isPlayerA", function () {
      //IF this socket is the first to join, we'll change our PlayerA Boolean:
      scene.isPlayerA = true;
    });

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

    scene.dealer = new Dealer(scene);

    scene.socket.on("dealCards", function () {
      scene.dealer.dealCards();
      scene.dealText.disableInteractive();
    });

    scene.dealText.on("pointerdown", function () {
      scene.socket.emit("dealCards");
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
    scene.input.on("drop", function (pointer, gameObject, dropZone) {
      dropZone.data.values.cards++;
      gameObject.x = dropZone.x - 350 + dropZone.data.values.cards * 50;
      gameObject.y = dropZone.y;
      gameObject.disableInteractive();
      //When a card is dropped in our client, the socket will emit an event called "cardPlayed",
      //passing the details of the game object and the client's isPlayerA boolean
      //(which could be true or false, depending on whether the client was the first to connect to the server).
      scene.socket.emit("cardPlayed", gameObject, scene.isPlayerA);
    });
    scene.socket.on('cardPlayed', function (gameObject, isPlayerA) {
      //check to see if THIS socket is the one that played
      //if not, we need to update the screen:
      if (isPlayerA !== scene.isPlayerA) {
          let sprite = gameObject.textureKey;
          //remove one of the opponent cards:
          scene.opponentCards.shift().destroy();
          //update dropzone values:
          scene.dropZone.data.values.cards++;
          //add the card played
          let card = new Card(scene);
          card.render(((scene.dropZone.x - 350) + (scene.dropZone.data.values.cards * 50)), (scene.dropZone.y), sprite).disableInteractive();
      }
  })
}

  update() {} 
}

