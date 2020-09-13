let socket;
window.onload = function () {
  socket = new WebSocket("ws://" + window.location.host + "/api/");
  socket.onopen = function () {
    console.log("Connection OK");
  };
  console.log(document.getElementById("button"));
  document.getElementById("button").onclick = function () {
    console.log("aaa");
    socket.send(
      JSON.stringify({
        DataType: "add",
        ObjType: "circle",
      })
    );
  };
};
