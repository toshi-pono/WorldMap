import { CircleBuilding, MainCircle, DrawPass } from "./class.js";
// 定数の宣言
const SCREEN_SETTING = {
  width: 1400,
  height: 875,
};
const CENTOR = { x: SCREEN_SETTING.width / 2, y: SCREEN_SETTING.height / 2 };
const MAIN_RADIUS = 150;
const EX_RADIUS = MAIN_RADIUS * 1.9;

// 変数の宣言
let app;
let isLoad = false;
let circleObjList = new Array();
let lineObjList = new Array();
let socket;
let pingPongTimer = null;

// 読み込みからの処理
for (let i = 0; i < textureList.length; i++) {
  PIXI.loader.add(textureList[i].name, textureList[i].url);
}
for (let i = 0; i < flyTextureList.length; i++) {
  PIXI.loader.add(flyTextureList[i].name, flyTextureList[i].url);
}

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

// HACK:まずそう
window.onload = function () {
  isLoad = true;
};

function main(resources) {
  app = new PIXI.Application({
    width: SCREEN_SETTING.width,
    height: SCREEN_SETTING.height,
    backgroundColor: 0x000000,
  });
  let el = document.getElementById("app");
  el.appendChild(app.view);

  // mainContainer
  let mainContainer = new PIXI.Container();
  mainContainer.x = 0;
  mainContainer.y = 0;
  mainContainer.sortableChildren = true;
  app.stage.addChild(mainContainer);
  // createCircle
  mainContainer.addChild(new MainCircle(CENTOR, MAIN_RADIUS).pixi);

  // overCircle
  let circleContainer = new PIXI.Container();
  mainContainer.x = 0;
  mainContainer.y = 0;
  circleContainer.sortableChildren = true;
  app.stage.addChild(circleContainer);
  // addMask
  let maskObj = new MainCircle(CENTOR, MAIN_RADIUS).pixi;
  app.stage.addChild(maskObj);
  circleContainer.mask = maskObj;

  // 情報が届いて更新する処理
  socket.onmessage = function (e) {
    console.log(e.data);
    let data = JSON.parse(e.data);
    if (data.Job == "pong") {
      pingPong();
    }
    if (data.Job == "view") {
      update(data);
    }
  };
  function pingPong() {
    console.log("pong");
    if (pingPongTimer) {
      clearTimeout(pingPongTimer);
    }
    return checkConnection();
  }
  function update(data) {
    switch (data.EarthData.DataType) {
      case "hoge":
        console.log("ok");
        break;
      case "add":
        // TODO:ここをすっきり書き換える
        {
          if (data.EarthData.ObjType == "circle") {
            let obj = new CircleBuilding(
              resources,
              textureList[rand(textureList.length)],
              MAIN_RADIUS - 5,
              rand(360),
              CENTOR,
              0,
              0
            );
            circleObjList.push(obj);
            mainContainer.addChild(obj.pixi);
          } else if (data.EarthData.ObjType == "flycircle") {
            let num = rand(flyTextureList.length);
            let obj = new CircleBuilding(
              resources,
              flyTextureList[num],
              EX_RADIUS + rand(50, -50),
              rand(360),
              CENTOR,
              flyTextureList[num].speed,
              2
            );
            circleObjList.push(obj);
            mainContainer.addChild(obj.pixi);
          } else if (data.EarthData.ObjType == "path") {
            let obj = new DrawPass(data.EarthData.Path, CENTOR, 0);
            console.log(obj);
            lineObjList.push({ obj: obj, path: data.EarthData.Path });
            circleContainer.addChild(obj.pixi);
          }
        }
        break;
      case "remove":
        break;
      default:
        break;
    }
  }
  animate();
}

function animate() {
  // アニメーション
  let listSize = circleObjList.length;
  for (let i = 0; i < listSize; i++) {
    circleObjList[i].update();
  }
  window.requestAnimationFrame(animate);
}

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
