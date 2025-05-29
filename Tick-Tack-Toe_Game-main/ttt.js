let boxes = document.querySelectorAll(".box");
let rstbtn = document.querySelector("#rst"); 
let newGameBtn = document.querySelector("#newbtn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");

let turnA = true;

const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
];

const resetGame = () => {
  turnA = true;
  enableBoxes();
  msgContainer.classList.add("hide");
}

boxes.forEach((box) => {
    box.addEventListener("click",() => {
      if(turnA){
        box.innerText = "O";
        box.classList.add("o-color");
        box.classList.remove("x-color");
        turnA = false;
      } else {
        box.innerText = "X";
        box.classList.add("x-color");
        box.classList.remove("o-color");
        turnA = true;
      }
      box.disabled = true;

      checkWinner();
    });
});

const disableBoxes = () => {
  for(let box of boxes){
    box.disabled = true;
  }
}

const enableBoxes = () => {
  for(let box of boxes){
    box.disabled = false;
    box.innerText = "";
  }
}

const showWinner = (winner) => {
  msg.innerText = `Congratulations,Winner is ${winner}`;
  msgContainer.classList.remove("hide");
  disableBoxes();
  if(!winner){
  }
}

const checkWinner = () => {
  let isDraw = true;

    for(let pattern of winPatterns){
        let pos1Val = boxes[pattern[0]].innerText;
        let pos2Val = boxes[pattern[1]].innerText;
        let pos3Val = boxes[pattern[2]].innerText;

        if(pos1Val != "" && pos2Val != "" && pos3Val != ""){
          if(pos1Val === pos2Val && pos2Val === pos3Val){
           // console.log("Winner",pos1Val);
            showWinner(pos1Val);
          }
        }
    }

    boxes.forEach((box) =>{
      if(box.innerText === ""){
        isDraw = false;
      }
    });
    if(isDraw){
      showDrawMsg();
    }
};

const showDrawMsg = () => {
  msg.innerText = "It's a Draw! Try Again!!";
  msgContainer.classList.remove("hide");
  disableBoxes();
}

newGameBtn.addEventListener("click",resetGame);
rst.addEventListener("click",resetGame);