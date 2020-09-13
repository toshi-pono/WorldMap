let socket;
let pingPongTimer = null;

window.onload = function () {
  socket = new WebSocket("ws://" + window.location.host + "/api/");
  socket.onopen = function () {
    console.log("Connection OK");
    checkConnection();
  };
  document.getElementById("button").onclick = function () {
    socket.send(
      JSON.stringify({
        Job: "view",
        EarthData: {
          DataType: "add",
          ObjType: "circle",
        },
      })
    );
  };
  document.getElementById("button2").onclick = function () {
    socket.send(
      JSON.stringify({
        Job: "view",
        EarthData: {
          DataType: "add",
          ObjType: "flycircle",
        },
      })
    );
  };
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
