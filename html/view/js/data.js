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
