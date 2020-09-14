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

class RunCar {
  constructor(resources, carData, pathList, centor) {
    this.speed = carData.speed;
    this.pathList = pathList;
    this.centor = centor;

    this.pixi = new PIXI.Sprite(resources[carData.name].texture);
    this.pixi.anchor.x = 0.5;
    this.pixi.anchor.y = 1;
    this.pixi.width = carData.width * -1;
    this.pixi.height = carData.height;
    this.pixi.zIndex = 5; // 道路→4なのでそれ以上で設定

    this.rotate = 0; // ラジアン

    this.distID = 0; // 目的地PathListID
    this.status = -1;
    this.animationCounter = 0;
    this.x = 0;
    this.y = 0;
    this.posInit();

    this.draw();
  }
  posInit() {
    this.calcRotate(0);
    this.distID = 0;
    this.status = -1;
    this.x =
      this.pathList[0].PosX - (this.pixi.width * Math.cos(this.rotate)) / 2;
    this.y =
      this.pathList[0].PosY - (this.pixi.width * Math.sin(this.rotate)) / 2;
  }
  draw() {
    this.pixi.rotation = this.rotate;
    this.pixi.x = this.x + this.centor.x;
    this.pixi.y = this.y + this.centor.y;
  }
  update() {
    this.x += this.speed * Math.cos(this.rotate);
    this.y += this.speed * Math.sin(this.rotate);
    switch (this.status) {
      case -1:
        // 前後の出現処理
        this.animationCounter++;
        if (this.animationCounter * 2 * this.speed >= this.pixi.width) {
          this.status = 1;
          this.animationCounter = 0;
          this.distID++;
          if (this.distID >= this.pathList.length) {
            // 位置のイニシャライズ処理を書く
            this.posInit();
          }
          // HACK:次のステップも通り越した場合がヤバそう
        }
        break;
      default:
        // 通常時。distIDの地点を目指して進み、たどり着いたかの処理をする
        // HACK:ステップが刻まれていた場合、スピードが遅くなってしまうおそれがある。pathの作り方と相談すること
        console.log(this.distID);
        if (this.isOver(this.distID - 1)) {
          // たどり着いた（通り越した）場合
          this.x = this.pathList[this.distID].PosX;
          this.y = this.pathList[this.distID].PosY;
          this.calcRotate(this.distID);
          this.distID++;
          // ゴール
          if (this.distID >= this.pathList.length) this.status = -1;
        }
        break;
    }
    this.draw();
  }
  calcRotate(num) {
    if (num >= this.pathList.length - 1) return;
    // HACK:エラー処理があまあま
    let dx = this.pathList[num + 1].PosX - this.pathList[num].PosX;
    let dy = this.pathList[num + 1].PosY - this.pathList[num].PosY;
    this.rotate = Math.atan2(dy, dx);
  }
  isOver(num) {
    if (
      this.x >=
        Math.min(this.pathList[num].PosX, this.pathList[num + 1].PosX) &&
      this.x <=
        Math.max(this.pathList[num].PosX, this.pathList[num + 1].PosX) &&
      this.y >=
        Math.min(this.pathList[num].PosY, this.pathList[num + 1].PosY) &&
      this.y <= Math.max(this.pathList[num].PosY, this.pathList[num + 1].PosY)
    ) {
      return false;
    }
    return true;
  }
}

function rand(maxnum, minnum = 0) {
  return Math.floor(Math.random() * (maxnum - minnum) + minnum);
}
export { CircleBuilding, MainCircle, DrawPass, RunCar };
