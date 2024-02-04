const musicSound = new Audio("moveSound.mp3");
const outSound = new Audio("outSound.mp3");
const winSound = new Audio("winSound.mp3");
let loader = document.getElementById('loader');
let Correct_point = 0;
let arr = [];
var url = new URL(window.location.href);
var urlParams = new URLSearchParams(window.location.search);
let paramUserID = urlParams.get("Email");
let ParamOrgID = urlParams.get("OrgID");
let M2OstAssesmentID = urlParams.get("M2ostAssessmentId");
let id_game = urlParams.get("idgame");
let gameAssesmentId = urlParams.get("gameassid");
let startPage=document.getElementById('start-page');
let startPageButton=document.getElementById('startButton');
let IdAssement_Ans;
let QuizeListResponse;
let UID = [];

//Declared get Id User
async function getIdUser() {
  try {
    const url = `https://www.playtolearn.in/Mini_games/api/UserDetail?OrgId=${ParamOrgID}&Email=${paramUserID}`;
    const response = await fetch(url, { method: "GET" });
    const encryptedData = await response.json();
    const IdUser = JSON.parse(encryptedData);
    UID.push(IdUser);
    console.log(encryptedData);
    console.log(UID[0].Id_User);
    getDetails();
    return encryptedData;
  } catch (error) {
    console.error("Fetch error:", error.message);
    throw error;
  }
}
//Declared getDetails
async function getDetails() {
  try {
    const url = `https://www.playtolearn.in/Mini_games/api/GetAssessmentDataList?OrgID=${ParamOrgID}&UID=${UID[0]?.Id_User}&M2ostAssessmentId=${M2OstAssesmentID}&idgame=${id_game}&gameassid=${gameAssesmentId}`;
    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok, status code: ${response.status}`
      );
    }

    const encryptedData = await response.json();
    QuizeListResponse = JSON.parse(encryptedData);
    console.log("ResponseData", QuizeListResponse);
  



 
  
 
    loader.style.display = 'none';
  
    document.getElementById('container').style.display = "block";

    return encryptedData;
  } catch (error) {
    throw error;
  }
}
//Declared Initializepage
function initializePage() {
  try {
    loader.style.display = 'flex';
    document.getElementById('container').style.display = "block";
    getIdUser();  
  } catch (error) {
    console.error("Error during initialization:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", initializePage);
function startGame(){
  startPage.style.display='none';
  startPageButton.style.display='none';
  musicSound.play();
  addQuiz();
}

//Declared SaveAssement
async function saveAssessment(data) {
  const postData = data;
  const baseUrl = "https://www.playtolearn.in/";
  const endpoint = "Mini_games/api/assessmentdetailuserlog";
  const url = baseUrl + endpoint;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  const responseData = await response.json();

  return responseData;
}
//Declared SaveAssementMasterlog
async function saveAssessmentMasterLog(data) {
  const postData = data;
  const baseUrl = "https://www.playtolearn.in/";
  const endpoint = "Mini_games/api/gameusermasterlog";
  const url = baseUrl + endpoint;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  const responseData = await response.json();

  return responseData;
}
//Declared Shuffle
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

let questionIndex = 0;
let timer;
let rank = 0;
let scores = 10;
let AssementData = [];
let assessmentObject = [];
//Declared Checkquiz Completion
function checkQuizCompletion() {
  //Check length of An Question
  if (questionIndex < QuizeListResponse.length) {
     addQuiz();
  } else {
    document.getElementById('container').style.display = 'none';
    //Merge two Array
    const mergedData = AssementData.map((game, index) => ({
      ...game,
      ...assessmentObject[index],
    }));

    let assessmentData = [];
    let assementDataForMasterLog = [];

    var sum = 0;
    for (let i = 0; i < mergedData.length; i++) {
      sum = parseInt(mergedData[i].point) + sum;
     
      let model = {
        ID_ORGANIZATION: ParamOrgID,
        id_user: UID[0].Id_User,
        Id_Assessment: mergedData[i].Id_Assessment,
        Id_Game: mergedData[i].Id_Game,
        attempt_no: mergedData[i].allow_attempt,
        id_question: mergedData[i].Id_Assessment_question,
        is_right: mergedData[i].Given_ans,
        score: mergedData[i].point,
        Id_Assessment_question_ans: mergedData[i].IdAssement_Ans,
        Time: 45,
        M2ostAssessmentId: M2OstAssesmentID
      };

      let modelForGameMasterLog = {
        ID_ORGANIZATION: ParamOrgID,
        id_user:UID[0].Id_User,
        Id_Room: mergedData[0].Id_Assessment,
        Id_Game: mergedData[0].Id_Game,
        attempt_no: mergedData[0].allow_attempt,
        score: sum,
      };

      assessmentData.push(model);
      assementDataForMasterLog.push(modelForGameMasterLog);
    }
    //Get postData for postData
    saveAssessment(assessmentData);
  
    saveAssessmentMasterLog(assementDataForMasterLog[assementDataForMasterLog.length - 1]);
    showGameOverPopup(sum);
    
  }

}
//Declared StartTimer
let timerInterval; // Variable to store the interval ID

function startTimer(condition, time) {
  let timeSet = time || 10;
  let settimeDiv = document.getElementById("timer-sec");

  function updateTimer() {
    settimeDiv.innerHTML = `<div id="timer"> 
      ${Array.from(
        { length: timeSet },
        (_, i) => `
          <div class="timer-box">
            <div class="circle"></div>
            <div class="x"></div>
          </div>
        `
      ).join("")}
    </div>`;

    if (timeSet == 0) {
      // Clear the interval before calling stopTimer to ensure accurate timing
      clearInterval(timerInterval);
      stopTimer();
      let optionContainer = document.getElementById("option-container");
      optionContainer.innerHTML = "";
      // checkQuizCompletion();
      option(0);
      questionIndex--;
      // addQuiz();
    }
    timeSet--;
  }

  function stopTimer() {
    questionIndex++;
    let settimeDiv = document.getElementById("timer-sec");
    settimeDiv.innerHTML = "";
        clearInterval(timerInterval);

  }

  if (condition === true) {
    updateTimer(); // Start displaying the timer

    timerInterval = setInterval(() => {
      updateTimer(); // Update the timer display
    }, 6000);
  } else if (condition === false) {
    stopTimer();
  }}

let selectedIndex = 0;
let is_right_ans;
let point;

//Declared Option
function option(key) {
  let selectedOption=key-1;
   //Logic for Applying Option Click
   AssementData.push(QuizeListResponse[selectedIndex]);
   console.log('AssesmentData',AssementData);
   if(key!=0){
    is_right_ans=QuizeListResponse[selectedIndex].optionList[key-1].Right_Ans;
    

    if (is_right_ans==1) {
      let optionButton = document.getElementById('optionValue'+selectedOption);
      is_right='1';
      Correct_point += 10;
      point=10;
      IdAssement_Ans=QuizeListResponse[selectedIndex].optionList[key-1].Id_Assessment_question_ans;
      document.getElementById("score").innerHTML = Correct_point;
      console.log("you win", Correct_point);
      optionButton.classList.add("correct-answer");
      selectedIndex++;
   
      winSound.play();
    } 
    else{
      Correct_point += 0;
      let optionButton = document.getElementById('optionValue'+selectedOption);
      IdAssement_Ans=QuizeListResponse[selectedIndex].optionList[key-1].Id_Assessment_question_ans;
      point=0;
      is_right='2';
      optionButton.classList.add("wrong-answer");
      outSound.play(); 
      selectedIndex++;
  
    }
   
   }
  else{
    Correct_point += 0;
    point=0;
    IdAssement_Ans=null;
    is_right='2';
    key=null;
    selectedIndex++;
   
 

  }
  
    assessmentObject.push({'Given_ans':is_right,'user_Ans':key,'IdAssement_Ans':IdAssement_Ans ,'point':point})
    
  
    startTimer(false);
    // console.log('questionIndex',questionIndex)
  
    setTimeout(() => {
      // questionIndex + 1;

      let optionContainer = document.getElementById("option-container");
      optionContainer.innerHTML = "";
      checkQuizCompletion();
 
    
      //  addQuiz();
    });
  
  }
//Declared Add Quiz Function
function addQuiz() {
 
  let element = document.getElementById("quiz");
  element.style.display = "flex";
  console.log('Index',questionIndex)
  document.getElementById("ques").innerHTML = ` ${
    QuizeListResponse[questionIndex]?.Assessment_Question
  }`;
  
  let optionContainer = document.getElementById("option-container");
  optionContainer.innerHTML = "";

  QuizeListResponse[questionIndex]?.optionList.forEach((el, index) => {
    optionContainer.innerHTML += `<button  class="option" id="optionValue${index}" style="border-radius:20px;" onclick="option('${index+1}')">
          <span class="label">${el.Answer_Description}</span></button>`;
  });

  startTimer(true);  
}
//Gameover Popup Declared
function showGameOverPopup() {
  document.getElementById('gameOverPopup').style.display = 'block';
}