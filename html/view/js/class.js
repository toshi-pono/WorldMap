// TODO:クラスがごちゃごちゃなので整理する
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

class DrawPass {
  constructor(pathList, centor, type) {
    // typeはあとで考える（道路とか線路とか）
    this.pixi = new PIXI.Graphics().lineStyle(20, 0x8fc825);
    this.pixi._lineStyle.join = "round";
    console.log(this.pixi);
    this.pixi.moveTo(centor.x + pathList[0].PosX, centor.y + pathList[0].PosY);
    console.log(centor.x + pathList[0].PosX, centor.y + pathList[0].PosY);
    for (let i = 1; i < pathList.length; i++) {
      this.pixi.lineTo(
        centor.x + pathList[i].PosX,
        centor.y + pathList[i].PosY
      );
    }
    this.pixi.zIndex = 4;
  }
}

function rand(maxnum, minnum = 0) {
  return Math.floor(Math.random() * (maxnum - minnum) + minnum);
}
export { CircleBuilding, MainCircle, DrawPass };
