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
let socket;
let pingPongTimer = null;

// データ
const assetsUrl = "../assets/";
console.log(assetsUrl);
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
    name: "home1",
    url: assetsUrl + "home1.PNG",
    width: 70,
    height: 70,
  },
  {
    name: "tower1",
    url: assetsUrl + "tower1.PNG",
    width: 100,
    height: 200,
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
];

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
      checkConnection();
    };
    main(resources);
  }
});

// HACK
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

  // 情報が届いて更新する処理
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
    if (data.Job == "view") {
      update(data);
    }
  };
  function update(data) {
    switch (data.EarthData.DataType) {
      case "hoge":
        console.log("ok");
        break;
      case "add":
        if (data.EarthData.ObjType == "circle") {
          let obj = new CircleBuilding(
            resources,
            textureList[rand(4)],
            MAIN_RADIUS - 5,
            rand(360),
            CENTOR,
            0,
            0
          );
          circleObjList.push(obj);
          mainContainer.addChild(obj.pixi);
        } else if (data.EarthData.ObjType == "flycircle") {
          let num = rand(2);
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

class CircleBuilding {
  constructor(resources, textureData, radius, angle, centor, speed, type) {
    this.pixi = new PIXI.Sprite(resources[textureData.name].texture);
    this.pixi.anchor.x = 0.5;
    this.pixi.anchor.y = 1;
    this.pixi.width = textureData.width;
    this.pixi.height = textureData.height;
    this.pixi.zIndex = 5;
    if (type == 1) {
      this.pixi.zIndex = 6;
    } else if (type == 2) {
      this.pixi.zIndex = 4;
    }
    this.centor = centor;
    this.radius = radius;
    this.angle = angle;
    let rnd = rand(2) * 2 - 1;
    if (rnd > 0) {
      this.pixi.width = -textureData.width;
    }
    this.speed = speed * rnd + (rand(10, -10) * speed) / 30;
    this.draw();
  }
  update() {
    this.angle += this.speed / 60;
    if (this.angle > 360) this.angle -= 360;
    if (this.angle < 0) this.angle += 360;
    this.draw();
  }
  draw() {
    this.pixi.angle = this.angle;
    this.pixi.x =
      this.centor.x + this.radius * Math.sin((this.angle * Math.PI) / 180);
    this.pixi.y =
      this.centor.y - this.radius * Math.cos((this.angle * Math.PI) / 180);
  }
}

class MainCircle {
  constructor(centor, radius) {
    this.pixi = new PIXI.Graphics()
      .beginFill(0xfffde6)
      .drawEllipse(0, 0, radius, radius)
      .endFill();
    this.pixi.x = centor.x;
    this.pixi.y = centor.y;
    this.pixi.zIndex = 10;
  }
}

function rand(maxnum, minnum = 0) {
  return Math.floor(Math.random() * (maxnum - minnum) + minnum);
}
