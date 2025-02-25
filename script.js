document.addEventListener("DOMContentLoaded", () => {
    const dialog = document.getElementById("machineDialog");
    const machineTitleText = document.getElementById("machineTitle");
    const closeButton = document.getElementById("closeDialog");

    const disMinutes = document.querySelector(".minute");
    const disSeconds = document.querySelector(".seconds");

    const inpMinutes = document.getElementById("inp-minute");
    const inpSeconds = document.getElementById("inp-seconds");

    const startButton = document.querySelector(".start");
    const cancelButton = document.querySelector(".cancel");
    const pauseResumeButton = document.querySelector(".pause-resume");
    const pauseResumeCancel = document.querySelector(".pause-resume-cancel");

    let activeMachine = null;
    let timers = {};
    let countdowns = {};
    let isPaused = {};

    document.querySelectorAll(".toggle-btn").forEach(button => {
        button.addEventListener("click", function() {
            this.style.backgroundColor = this.style.backgroundColor === "red" ? "green" : "red";
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".machine").forEach(machine => {
            let machineId = machine.getAttribute("data-id");
            let savedStatus = localStorage.getItem(machineId);
            if (savedStatus) {
                let activeButton = machine.querySelector(`.toggle-btn[data-status="${savedStatus}"]`);
                if (activeButton) {
                    activeButton.classList.add("active");
                }
            }
        });
    });

    if (localStorage.getItem("timers")) {
        timers = JSON.parse(localStorage.getItem("timers"));
        isPaused = JSON.parse(localStorage.getItem("isPaused") || "{}");
        Object.keys(timers).forEach(machineId => {
            if (timers[machineId].totalSeconds > 0 && !isPaused[machineId]) {
                startCountdown(machineId);
            }
        });
    }

    function openDialog(event) {
        let machineType = event.target.classList.contains("washer") ? "Washer" : "Dryer";
        let machineId = event.target.getAttribute("data-id");

        activeMachine = machineId;
        machineTitleText.textContent = `${machineType} #${machineId}`;

        if (timers[machineId]) {
            updateTimerDisplay(machineId);
        } else {
            resetTimer(machineId);
        }

        dialog.showModal();
    }

    function startTimer() {
        let minutes = parseInt(inpMinutes.value) || 0;
        let seconds = parseInt(inpSeconds.value) || 0;
        let totalSeconds = minutes * 60 + seconds;

        if (totalSeconds <= 0) {
            alert("Please enter a valid time.");
            return;
        }

        timers[activeMachine] = { totalSeconds };
        isPaused[activeMachine] = false;
        saveTimers();

        updateTimerDisplay(activeMachine);
        startCountdown(activeMachine);
        pauseResumeCancel.classList.remove("none");
        startButton.classList.add("none");
    }

    function startCountdown(machineId) {
        clearInterval(countdowns[machineId]);

        countdowns[machineId] = setInterval(() => {
            if (!isPaused[machineId] && timers[machineId].totalSeconds > 0) {
                timers[machineId].totalSeconds--;
                saveTimers();
            }

            updateTimerDisplay(machineId);

            if (timers[machineId].totalSeconds <= 0) {
                clearInterval(countdowns[machineId]);
                machineTitleText.textContent = "Time's up!";
                alert(`Time is up for ${machineId}!`);
                resetTimer(machineId);
            }
        }, 1000);
    }

    function pauseResumeTimer() {
        isPaused[activeMachine] = !isPaused[activeMachine];
        pauseResumeButton.textContent = isPaused[activeMachine] ? "Resume" : "Pause";

        if (isPaused[activeMachine]) {
            clearInterval(countdowns[activeMachine]);
        } else {
            startCountdown(activeMachine);
        }
        saveTimers();
    }

    function cancelTimer() {
        clearInterval(countdowns[activeMachine]);
        resetTimer(activeMachine);
        saveTimers();
    }

    function resetTimer(machineId) {
        clearInterval(countdowns[machineId]);
        timers[machineId] = { totalSeconds: 0 };
        isPaused[machineId] = false;
        updateTimerDisplay(machineId);
        pauseResumeCancel.classList.add("none");
        startButton.classList.remove("none");
        inpMinutes.value = "";
        inpSeconds.value = "";
        saveTimers();
    }

    function updateTimerDisplay(machineId) {
        if (!timers[machineId]) return;

        let totalSeconds = timers[machineId].totalSeconds || 0;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        if (activeMachine === machineId) {
            disMinutes.textContent = minutes < 10 ? "0" + minutes : minutes;
            disSeconds.textContent = seconds < 10 ? "0" + seconds : seconds;
        }
    }

    function saveTimers() {
        localStorage.setItem("timers", JSON.stringify(timers));
        localStorage.setItem("isPaused", JSON.stringify(isPaused));
    }

    document.querySelectorAll(".washer, .dryer").forEach(machine => {
        machine.addEventListener("click", openDialog);
    });

    startButton.addEventListener("click", startTimer);
    pauseResumeButton.addEventListener("click", pauseResumeTimer);
    cancelButton.addEventListener("click", cancelTimer);

    closeButton.addEventListener("click", () => {
        dialog.close();
    });

    Object.keys(timers).forEach(machineId => {
        updateTimerDisplay(machineId);
    });
});
