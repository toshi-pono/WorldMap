import { ObjView, MainCircle } from "./Setclass.js";
let socket;
let pingPongTimer = null;
let isLoad = true;
let app;

// データ
// TODO:jsonで読み込むようにする
// TODO:データをちゃんと整理する
const assetsUrl = "../assets/";
let textureList = [
  {
    name: "building1",
    url: assetsUrl + "building1.PNG",
    width: 66,
    height: 100,
  },
  {
    name: "building2",
    url: assetsUrl + "building2.PNG",
    width: 66,
    height: 100,
  },
  {
    name: "building3",
    url: assetsUrl + "building3.PNG",
    width: 66,
    height: 100,
  },
  {
    name: "building4",
    url: assetsUrl + "building4.PNG",
    width: 100,
    height: 100,
  },
  {
    name: "home1",
    url: assetsUrl + "home1.PNG",
    width: 70,
    height: 70,
  },
  {
    name: "home2",
    url: assetsUrl + "home2.PNG",
    width: 70,
    height: 70,
  },
  {
    name: "home3",
    url: assetsUrl + "home3.PNG",
    width: 70,
    height: 70,
  },
  {
    name: "tower1",
    url: assetsUrl + "tower1.PNG",
    width: 100,
    height: 200,
  },
  {
    name: "tree1",
    url: assetsUrl + "tree1.PNG",
    width: 70,
    height: 70,
  },
];

let flyTextureList = [
  {
    name: "fly1",
    url: assetsUrl + "fly1.PNG",
    width: 100,
    height: 75,
    speed: 30,
  },
  {
    name: "fly2",
    url: assetsUrl + "fly2.PNG",
    width: 100,
    height: 75,
    speed: 10,
  },
  {
    name: "fly3",
    url: assetsUrl + "fly3.PNG",
    width: 100,
    height: 75,
    speed: 8,
  },
  {
    name: "cloud",
    url: assetsUrl + "cloud.PNG",
    width: 100,
    height: 75,
    speed: 2,
  },
];

let carTextureList = [
  {
    name: "car1",
    url: assetsUrl + "buta.png",
    width: 70,
    height: 70,
    speed: 1,
  },
];

function handleTouchMove(event) {
  event.preventDefault();
}
//スクロール禁止
document.addEventListener("touchmove", handleTouchMove, { passive: false });

const SCREEN_SETTING = {
  width: 750,
  height: 1125,
};
const CENTOR = { x: SCREEN_SETTING.width / 2, y: SCREEN_SETTING.height / 2 };

// 読み込みからの処理
for (let i = 0; i < textureList.length; i++) {
  PIXI.loader.add(textureList[i].name, textureList[i].url);
}
for (let i = 0; i < flyTextureList.length; i++) {
  PIXI.loader.add(flyTextureList[i].name, flyTextureList[i].url);
}
for (let i = 0; i < carTextureList.length; i++) {
  PIXI.loader.add(carTextureList[i].name, carTextureList[i].url);
}

// 独自に使うtexture
PIXI.loader.add("reload", "../assets/reload.png");

PIXI.loader.load(function (loader, resources) {
  if (isLoad == true) {
    socket = new WebSocket("WS://" + window.location.host + "/api/");
    socket.onopen = function () {
      console.log("Connection OK");
      // MEMO:必要ならここに番号を伝える処理を書く
      checkConnection();
    };
    main(resources);
  }
});

// 描画
function main(resources) {
  app = new PIXI.Application({
    width: SCREEN_SETTING.width,
    height: SCREEN_SETTING.height,
    backgroundColor: 0x000000,
  });
  let el = document.getElementById("app");
  el.appendChild(app.view);

  // circle?
  let circle = new MainCircle({ x: SCREEN_SETTING.width / 2, y: 220 }, 210);
  circle.pixi.interactive = true;
  circle.pixi.buttonMode = true;
  circle.pixi.on("pointertap", (e) => {
    // クリック処理
    console.log(e);
  });

  app.stage.addChild(circle.pixi);

  // changeChoose
  let reloadObj = new PIXI.Sprite(resources["reload"].texture);
  reloadObj.x = SCREEN_SETTING.width - 100;
  reloadObj.y = 1000;
  reloadObj.width = 70;
  reloadObj.height = 70;
  reloadObj.interactive = true;
  reloadObj.buttonMode = true;
  reloadObj.on("pointertap", () => {
    changeAllObj();
  });
  app.stage.addChild(reloadObj);

  // obj
  let chooseObjList = [];
  makeObj();
  function makeObj() {
    for (let i = 0; i < 3; i++) {
      if (i == 0) {
        let chooseObj = new ObjView(
          resources,
          75 + i * 225,
          800,
          flyTextureList,
          "flycircle"
        );
        app.stage.addChild(chooseObj.pixi);
        chooseObjList[i] = chooseObj;
      } else {
        // 周りのobj
        let chooseObj = new ObjView(
          resources,
          75 + i * 225,
          800,
          textureList,
          "circle"
        );
        app.stage.addChild(chooseObj.pixi);
        chooseObjList[i] = chooseObj;
      }
    }
    for (let i = 0; i < chooseObjList.length; i++) {
      chooseObjList[i].pixi
        .on("pointerdown", () => {
          chooseObjList[i].pixi.on("pointermove", (e) => {
            console.log(e.data.getLocalPosition(app.stage));
            chooseObjList[i].pixi.x =
              e.data.getLocalPosition(app.stage).x -
              chooseObjList[i].pixi.width / 2;
            chooseObjList[i].pixi.y = e.data.global.y;
            if (chooseObjList[i].pixi.y < 220) {
              // 送信！
              socket.send(
                JSON.stringify({
                  Job: "view",
                  EarthData: {
                    DataType: "add",
                    ObjType: chooseObjList[i].objType,
                    ObjID: chooseObjList[i].id,
                  },
                })
              );
              chooseObjList[i].pixi.off("pointermove");
              chooseObjList[i].changeSprite();
              chooseObjList[i].pos();
            }
          });
        })
        .on("pointerup", () => {
          chooseObjList[i].pixi.off("pointermove");
          chooseObjList[i].pos();
        });
    }
  }
  function changeAllObj() {
    for (let i = 0; i < chooseObjList.length; i++) {
      chooseObjList[i].changeSprite();
      chooseObjList[i].pos();
    }
  }

  // 受信処理
  socket.onmessage = function (e) {
    console.log(e.data);
    let data = JSON.parse(e.data);
    if (data.Job == "pong") {
      console.log("pong");
      if (pingPongTimer) {
        clearTimeout(pingPongTimer);
      }
      return checkConnection();
    }
    if (data.Job == "successSet") {
      console.log("success");
    }
  };
}

window.onload = function () {
  document.getElementById("button3").onclick = function () {
    socket.send(
      JSON.stringify({
        Job: "view",
        EarthData: {
          DataType: "add",
          ObjType: "path",
          Path: [
            { PosX: -200, PosY: -200 },
            { PosX: 0, PosY: 0 },
            { PosX: 200, PosY: 0 },
          ],
        },
      })
    );
  };
};

function checkConnection() {
  setTimeout(() => {
    socket.send(
      JSON.stringify({
        Job: "ping",
        EarthData: {
          DataType: "",
          ObjType: "",
        },
      })
    );
    pingPongTimer = setTimeout(() => {
      console.log("再接続を試みます");
      pingPongTimer = null;
      socket.reconnect();
    }, 1000);
  }, 30000);
}

function rand(maxnum, minnum = 0) {
  return Math.floor(Math.random() * (maxnum - minnum) + minnum);
}
