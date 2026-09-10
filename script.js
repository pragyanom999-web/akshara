document.addEventListener("DOMContentLoaded", () => {
    loadContentData();
    setupNavigation();
});

async function loadContentData() {
    try {
        const response = await fetch('content.json');
        const data = await response.json();

        // 1. Populate Student Profile Data with LocalStorage & Automatic Points
        loadStudentProfile(data);

        // 2. Populate Continue Learning Card (Awards +10 points when clicked/studied)
        if(data.continue_learning) {
            document.getElementById("continueSub").innerText = data.continue_learning.subject;
            document.getElementById("continueTitle").innerText = data.continue_learning.title;
            document.getElementById("progressFill").style.width = data.continue_learning.progress_percent + "%";
            document.getElementById("progressText").innerText = `${data.continue_learning.completed_lessons} / ${data.continue_learning.total_lessons} Lessons Completed`;

            const handleLessonClick = () => {
                addPoints(10); // Automatically add 10 points for studying a lesson
                window.open(data.continue_learning.drive_link, '_blank');
            };

            document.getElementById("continueCard").onclick = handleLessonClick;
            document.getElementById("continueViewAll").onclick = (e) => {
                e.preventDefault();
                handleLessonClick();
            };
        }

        // 3. Populate Subjects Grid
        const subjectsGrid = document.getElementById("subjectsGrid");
        subjectsGrid.innerHTML = "";

        if(data.subjects) {
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
                card.onclick = () => {
                    addPoints(15); // +15 points for exploring a subject chapter
                    window.open(sub.drive_link, '_blank');
                };
                subjectsGrid.appendChild(card);
            });
        }

        // 4. Quick Option Clicks Mapping (Awards +50 points automatically when opening Practice Tests!)
        document.querySelectorAll(".quick-card").forEach(card => {
            const key = card.getAttribute("data-key");
            card.onclick = () => {
                if(data.quick_options && data.quick_options[key]) {
                    if(key === "practice_tests") {
                        addPoints(50); // Automatically reward 50 points for attending practice exam
                    }
                    window.open(data.quick_options[key], '_blank');
                } else {
                    alert("Link not configured in content.json");
                }
            };
        });

        // 5. Bottom Navigation links handling
        document.querySelectorAll(".bottom-nav .nav-item").forEach(item => {
            const navKey = item.getAttribute("data-nav");
            item.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll(".bottom-nav .nav-item").forEach(n => n.classList.remove("active"));
                item.classList.add("active");

                if(navKey === 'home') {
                    showHomeView();
                } else {
                    if(data.navigation_links && data.navigation_links[navKey]) {
                        window.open(data.navigation_links[navKey], '_blank');
                    } else {
                        alert(`Opening ${navKey} module.`);
                    }
                }
            };
        });

        document.getElementById("searchBtn").onclick = () => {
            const query = prompt("Search study materials or chapters:");
            if(query) {
                alert(`Searching for: "${query}".`);
            }
        };

        document.getElementById("notifBtn").onclick = () => {
            alert("No new notifications at this time.");
        };

        document.getElementById("exploreCoursesBtn").onclick = () => {
            window.scrollTo({ top: 400, behavior: 'smooth' });
        };

    } catch (error) {
        console.error("Error loading content.json:", error);
    }
}

// Automatic Points Increaser Function
function addPoints(amount) {
    let currentPoints = parseInt(localStorage.getItem("akshara_student_points")) || 1250;
    currentPoints += amount;
    localStorage.setItem("akshara_student_points", currentPoints);
    
    // Update display instantly if profile stat element exists
    const statPointsElem = document.getElementById("statPoints");
    if(statPointsElem) {
        statPointsElem.innerText = currentPoints;
    }
}

function loadStudentProfile(jsonData) {
    const savedName = localStorage.getItem("akshara_student_name");
    const savedGrade = localStorage.getItem("akshara_student_grade");
    const savedPoints = localStorage.getItem("akshara_student_points");

    const profileName = savedName || (jsonData.student_profile ? jsonData.student_profile.name : "Student Name");
    const profileGrade = savedGrade || (jsonData.student_profile ? jsonData.student_profile.grade : "Class 10");
    const board = jsonData.student_profile ? jsonData.student_profile.board : "SEBA";
    const totalPoints = savedPoints || (jsonData.student_profile ? jsonData.student_profile.total_points : 1250);

    // Save initial default points if not set yet
    if(!savedPoints && jsonData.student_profile) {
        localStorage.setItem("akshara_student_points", jsonData.student_profile.total_points);
    }

    document.getElementById("profileName").innerText = profileName;
    document.getElementById("profileMeta").innerText = `${profileGrade} • ${board}`;
    document.getElementById("statPoints").innerText = totalPoints;
    
    if(jsonData.student_profile) {
        document.getElementById("statCourses").innerText = jsonData.student_profile.courses_enrolled;
        document.getElementById("statCerts").innerText = jsonData.student_profile.certificates_earned;
    }

    document.getElementById("editProfileBtn").onclick = () => {
        const inputName = prompt("Enter your full name:", profileName);
        if (inputName !== null && inputName.trim() !== "") {
            const inputGrade = prompt("Enter your class/grade (e.g., Class 9 or Class 10):", profileGrade);
            
            localStorage.setItem("akshara_student_name", inputName.trim());
            if (inputGrade) {
                localStorage.setItem("akshara_student_grade", inputGrade.trim());
            }

            document.getElementById("profileName").innerText = inputName.trim();
            document.getElementById("profileMeta").innerText = `${inputGrade || profileGrade} • ${board}`;
            alert("Profile updated successfully on this device!");
        }
    };
}

function setupNavigation() {
    const profileToggleBtn = document.getElementById("profileToggleBtn");
    const brandHome = document.getElementById("brandHome");
    const homeContainer = document.getElementById("homeViewContainer");
    const profileView = document.getElementById("profileView");

    profileToggleBtn.onclick = () => {
        const isProfileVisible = profileView.style.display === "block";
        if(!isProfileVisible) {
            homeContainer.style.display = "none";
            profileView.style.display = "block";
        } else {
            homeContainer.style.display = "block";
            profileView.style.display = "none";
        }
    };

    brandHome.onclick = () => {
        showHomeView();
        document.querySelectorAll(".bottom-nav .nav-item").forEach(n => n.classList.remove("active"));
        document.querySelector('.bottom-nav .nav-item[data-nav="home"]').classList.add("active");
    };

    document.getElementById("clearCacheBtn").onclick = () => {
        if('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        localStorage.clear();
        alert("App cache cleared and local profile reset!");
        location.reload();
    };

    document.getElementById("appVersionBtn").onclick = () => {
        alert("Akshara PWA is running on version v1.0.0 (SEBA Class 9 & 10 curriculum support active).");
    };
}

function showHomeView() {
    document.getElementById("homeViewContainer").style.display = "block";
    document.getElementById("profileView").style.display = "none";
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
