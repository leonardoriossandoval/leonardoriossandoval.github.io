document.addEventListener("DOMContentLoaded", () => {
    const totalDegreeCredits = 240;

    const subjects = document.querySelectorAll(".study-node");

    const getCreditsFromSubject = (subject) => {
        const text = subject.textContent.toLowerCase();
        const match = text.match(/(\d+)\s*cr[eè]dits/);

        if (!match) {
            return 0;
        }

        return Number(match[1]);
    };

    let approvedCredits = 0;
    let currentCredits = 0;
    let pendingCredits = 0;

    subjects.forEach((subject) => {
        const credits = getCreditsFromSubject(subject);

        if (subject.classList.contains("done")) {
            approvedCredits += credits;
        }

        if (subject.classList.contains("current")) {
            currentCredits += credits;
        }

        if (subject.classList.contains("pending")) {
            pendingCredits += credits;
        }
    });

    const approvedPercent = Math.round((approvedCredits / totalDegreeCredits) * 100);
    const currentPercent = Math.round((currentCredits / totalDegreeCredits) * 100);

    document.getElementById("approvedCredits").textContent = approvedCredits;
    document.getElementById("currentCredits").textContent = currentCredits;
    document.getElementById("pendingCredits").textContent = pendingCredits;
    document.getElementById("degreeProgress").textContent = `${approvedPercent}%`;

    document.getElementById("approvedProgressBar").style.width = `${approvedPercent}%`;
    document.getElementById("currentProgressBar").style.width = `${currentPercent}%`;
});