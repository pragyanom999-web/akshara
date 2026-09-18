document.addEventListener("DOMContentLoaded", () => {
    loadContentData();
    setupNavigation();
});

async function loadContentData() {
    try {
        const response = await fetch('content.json');
        const data = await response.json();

        loadStudentProfile(data);
        checkUpdatesBadge(data);

        if(data.continue_learning) {
            document.getElementById("continueSub").innerText = data.continue_learning.subject;
            document.getElementById("continueTitle").innerText = data.continue_learning.title;
            document.getElementById("progressFill").style.width = data.continue_learning.progress_percent + "%";
            document.getElementById("progressText").innerText = `${data.continue_learning.completed_lessons} / ${data.continue_learning.total_lessons} Lessons Completed`;

            const handleLessonClick = () => {
                addPointsAndMilestones(10, 1, 0); // +10 pts, +1 course unlock milestone
                window.open(data.continue_learning.drive_link, '_blank');
            };

            document.getElementById("continueCard").onclick = handleLessonClick;
            document.getElementById("continueViewAll").onclick = (e) => {
                e.preventDefault();
                handleLessonClick();
            };
        }

        const subjectsGrid = document.getElementById("subjectsGrid");
        subjectsGrid.innerHTML = "";

        if(data.subjects) {
            data.subjects.forEach(sub => {
                const card = document.createElement("div");
                card.className = "subject-card";
                const displaySubtitle = sub.subtitle ? `<span style="color:#ea580c; font-weight:600; font-size:10px; display:block; margin-top:2px;">${sub.subtitle}</span>` : `<span>${sub.chapters} Chapters</span>`;

                card.innerHTML = `
                    <div class="subject-left">
                        <div class="subject-icon" style="background: ${getSubjectBg(sub.color)}; color: ${getSubjectColor(sub.color)}">
                            <i class="fa-solid ${sub.icon}"></i>
                        </div>
                        <div class="subject-info">
                            <h5>${sub.name}</h5>
                            ${displaySubtitle}
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right"></i>
                `;
                card.onclick = () => {
                    addPointsAndMilestones(15, 1, 0); // +15 pts for exploring subject
                    window.open(sub.drive_link, '_blank');
                };
                subjectsGrid.appendChild(card);
            });
        }

        document.querySelectorAll(".quick-card").forEach(card => {
            const key = card.getAttribute("data-key");
            card.onclick = () => {
                if(data.quick_options && data.quick_options[key]) {
                    if(key === "practice_tests") {
                        // Automatically award points and milestones for attending Opal online test
                        let testScorePoints = 75; // Automated base performance points for attending test
                        addPointsAndMilestones(testScorePoints, 0, 1); // +75 pts, +1 certificate milestone unlock
                        alert("Practice test attended! Points and certificate unlocked automatically.");
                    }
                    window.open(data.quick_options[key], '_blank');
                } else {
                    alert("Link not configured in content.json");
                }
            };
        });

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

        // Notifications Button
        document.getElementById("notifBtn").onclick = () => {
            showUpdatesModal(data.app_updates);
            localStorage.setItem("akshara_last_read_update", data.app_updates[0].version);
            document.getElementById("notifBadge").style.display = "none";
        };

        document.getElementById("searchBtn").onclick = () => {
            const query = prompt("Search study materials or chapters:");
            if(query) {
                alert(`Searching for: "${query}".`);
            }
        };

        document.getElementById("exploreCoursesBtn").onclick = () => {
            window.scrollTo({ top: 400, behavior: 'smooth' });
        };

    } catch (error) {
        console.error("Error loading content.json:", error);
    }
}

// Automated Points & Milestone Counter
function addPointsAndMilestones(pointsToAdd, courseIncrement, certIncrement) {
    let currentPoints = parseInt(localStorage.getItem("akshara_student_points")) || 0;
    let currentCourses = parseInt(localStorage.getItem("akshara_student_courses")) || 0;
    let currentCerts = parseInt(localStorage.getItem("akshara_student_certs")) || 0;

    currentPoints += pointsToAdd;
    currentCourses += courseIncrement;
    currentCerts += certIncrement;

    localStorage.setItem("akshara_student_points", currentPoints);
    localStorage.setItem("akshara_student_courses", currentCourses);
    localStorage.setItem("akshara_student_certs", currentCerts);

    // Refresh stats UI instantly
    if(document.getElementById("statPoints")) document.getElementById("statPoints").innerText = currentPoints;
    if(document.getElementById("statCourses")) document.getElementById("statCourses").innerText = currentCourses;
    if(document.getElementById("statCerts")) document.getElementById("statCerts").innerText = currentCerts;
}

function loadStudentProfile(jsonData) {
    const savedName = localStorage.getItem("akshara_student_name");
    const savedGrade = localStorage.getItem("akshara_student_grade");
    const savedPoints = localStorage.getItem("akshara_student_points");
    const savedCourses = localStorage.getItem("akshara_student_courses");
    const savedCerts = localStorage.getItem("akshara_student_certs");
    const savedPhoto = localStorage.getItem("akshara_student_photo");

    const profileName = savedName || (jsonData.student_profile ? jsonData.student_profile.name : "Student Name");
    const profileGrade = savedGrade || (jsonData.student_profile ? jsonData.student_profile.grade : "Class 10");
    const board = jsonData.student_profile ? jsonData.student_profile.board : "SEBA";
    
    // Default stats to 0 at start as requested
    const totalPoints = savedPoints !== null ? savedPoints : 0;
    const enrolledCourses = savedCourses !== null ? savedCourses : 0;
    const certsEarned = savedCerts !== null ? savedCerts : 0;

    document.getElementById("profileName").innerText = profileName;
    document.getElementById("profileMeta").innerText = `${profileGrade} • ${board}`;
    document.getElementById("statPoints").innerText = totalPoints;
    document.getElementById("statCourses").innerText = enrolledCourses;
    document.getElementById("statCerts").innerText = certsEarned;

    // Handle local photograph display
    const imgPreview = document.getElementById("profileImagePreview");
    const defaultIcon = document.getElementById("defaultUserIcon");
    const removeBtn = document.getElementById("removePhotoBtn");

    if (savedPhoto) {
        imgPreview.src = savedPhoto;
        imgPreview.style.display = "block";
        defaultIcon.style.display = "none";
        removeBtn.style.display = "inline-flex";
    } else {
        imgPreview.style.display = "none";
        defaultIcon.style.display = "block";
        removeBtn.style.display = "none";
    }

    // Photo Upload Listener
    const photoInput = document.getElementById("uploadPhotoInput");
    photoInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                const base64Image = uploadEvent.target.result;
                localStorage.setItem("akshara_student_photo", base64Image);
                imgPreview.src = base64Image;
                imgPreview.style.display = "block";
                defaultIcon.style.display = "none";
                removeBtn.style.display = "inline-flex";
                alert("Profile photograph updated successfully from local storage!");
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove Photo Listener
    removeBtn.onclick = () => {
        localStorage.removeItem("akshara_student_photo");
        imgPreview.style.display = "none";
        defaultIcon.style.display = "block";
        removeBtn.style.display = "none";
    };

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
            alert("Profile updated successfully!");
        }
    };
}

function checkUpdatesBadge(jsonData) {
    if(jsonData.app_updates && jsonData.app_updates.length > 0) {
        const lastRead = localStorage.getItem("akshara_last_read_update");
        if(lastRead !== jsonData.app_updates[0].version) {
            document.getElementById("notifBadge").style.display = "block";
        }
    }
}

function showUpdatesModal(updates) {
    if(!updates || updates.length === 0) {
        alert("No recent updates.");
        return;
    }
    let updateText = "🔔 LATEST APP UPDATES:\n\n";
    updates.forEach(u => {
        updateText += `• [${u.version}] (${u.date})\n${u.message}\n\n`;
    });
    alert(updateText);
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
        if(confirm("Are you sure you want to clear cache and reset local profile settings?")) {
            if('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                });
            }
            localStorage.clear();
            alert("Cache cleared successfully!");
            location.reload();
        }
    };

    document.getElementById("appVersionBtn").onclick = () => {
        alert("Akshara PWA is running on version v1.1.0 (SEBA Class 9 & 10 curriculum support active).");
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
