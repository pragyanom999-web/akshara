document.addEventListener("DOMContentLoaded", () => {
    loadContentData();
});

async function loadContentData() {
    try {
        const response = await fetch('content.json');
        const data = await response.json();

        // Populate Continue Learning Card
        document.getElementById("continueSub").innerText = data.continue_learning.subject;
        document.getElementById("continueTitle").innerText = data.continue_learning.title;
        document.getElementById("progressFill").style.width = data.continue_learning.progress_percent + "%";
        document.getElementById("progressText").innerText = `${data.continue_learning.completed_lessons} / ${data.continue_learning.total_lessons} Lessons Completed`;

        document.getElementById("continueCard").addEventListener("click", () => {
            window.open(data.continue_learning.drive_link, '_blank');
        });

        // Populate Subjects Grid
        const subjectsGrid = document.getElementById("subjectsGrid");
        subjectsGrid.innerHTML = "";

        data.subjects.forEach(sub => {
            const card = document.createElement("div");
            card.className = "subject-card";
            card.innerHTML = `
                <div class="subject-left">
                    <div class="subject-icon" style="background: ${getSubjectBg(sub.color)}; color: ${getSubjectColor(sub.color)}">
                        <i class="fa-solid ${sub.icon}"></i>
                    </div>
                    <div class="subject-info">
                        <h5>${sub.name}</h5>
                        <span>${sub.chapters} Chapters</span>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            `;
            card.addEventListener("click", () => {
                window.open(sub.drive_link, '_blank');
            });
            subjectsGrid.appendChild(card);
        });

        // Quick Option clicks handling
        document.querySelectorAll(".quick-card").forEach(card => {
            const key = card.getAttribute("data-key");
            card.addEventListener("click", () => {
                const link = data.quick_options[key];
                if (link && link !== "#analytics") {
                    window.open(link, '_blank');
                } else {
                    alert("Opening Analytics/Performance Dashboard");
                }
            });
        });

        document.getElementById("exploreCoursesBtn").addEventListener("click", () => {
            window.scrollTo({ top: 500, behavior: 'smooth' });
        });

    } catch (error) {
        console.error("Error loading content.json:", error);
    }
}

function getSubjectColor(color) {
    const map = {
        blue: "#2563eb",
        orange: "#ea580c",
        green: "#16a34a",
        purple: "#7c3aed",
        amber: "#d97706"
    };
    return map[color] || "#2563eb";
}

function getSubjectBg(color) {
    const map = {
        blue: "#eff6ff",
        orange: "#fff7ed",
        green: "#f0fdf4",
        purple: "#f5f3ff",
        amber: "#fffbeb"
    };
    return map[color] || "#eff6ff";
}
