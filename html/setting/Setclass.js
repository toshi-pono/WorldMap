// HACK:クラス設計ミスった気がする
const OBJ_WIDTH = 150;

class ObjView {
  constructor(resources, x, y, objList, objType) {
    this.objList = objList;
    this.objType = objType;
    this.id = rand(this.objList.length);
    this.resources = resources;
    this.defalutX = x;
    this.defalutY = y;

    this.pixi = new PIXI.Sprite(
      this.resources[this.objList[this.id].name].texture
    );
    this.setspriteSize();
    this.pixi.anchor.x = 0;
    this.pixi.anchor.y = 0.5;
    this.pixi.interactive = true;
    this.pixi.buttonMode = true;
    this.pos();
  }
  setspriteSize() {
    this.pixi.width = OBJ_WIDTH;
    this.pixi.height =
      (this.objList[this.id].height * OBJ_WIDTH) / this.objList[this.id].width;
  }
  changeSprite() {
    this.id = rand(this.objList.length);
    this.pixi.texture = this.resources[this.objList[this.id].name].texture;
    this.setspriteSize();
  }
  pos() {
    this.pixi.x = this.defalutX;
    this.pixi.y = this.defalutY;
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

export { ObjView, MainCircle };

function rand(maxnum, minnum = 0) {
  return Math.floor(Math.random() * (maxnum - minnum) + minnum);
}
