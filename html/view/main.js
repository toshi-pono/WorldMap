// 定数の宣言
const SCREEN_SETTING = {
  width: 1400,
  height: 800,
};

// 変数の宣言
let app;

// 読み込みからの処理
window.onload = function () {
  main();
};

function main() {
  app = new PIXI.Application({
    width: SCREEN_SETTING.width,
    height: SCREEN_SETTING.height,
    backgroundColor: 0x1099bb,
  });
  let el = document.getElementById("app");
  el.appendChild(app.view);
}

function addObject() {}
