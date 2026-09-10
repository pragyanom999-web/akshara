document.addEventListener("DOMContentLoaded", () => {
    loadContentData();
    setupNavigation();
});

async function loadContentData() {
    try {
        const response = await fetch('content.json');
        const data = await response.json();

        // 1. Populate Student Profile Data
        if(data.student_profile) {
            document.getElementById("profileName").innerText = data.student_profile.name;
            document.getElementById("profileMeta").innerText = `${data.student_profile.grade} • ${data.student_profile.board}`;
            document.getElementById("statPoints").innerText = data.student_profile.total_points;
            document.getElementById("statCourses").innerText = data.student_profile.courses_enrolled;
            document.getElementById("statCerts").innerText = data.student_profile.certificates_earned;
        }

        // 2. Populate Continue Learning Card
        if(data.continue_learning) {
            document.getElementById("continueSub").innerText = data.continue_learning.subject;
            document.getElementById("continueTitle").innerText = data.continue_learning.title;
            document.getElementById("progressFill").style.width = data.continue_learning.progress_percent + "%";
            document.getElementById("progressText").innerText = `${data.continue_learning.completed_lessons} / ${data.continue_learning.total_lessons} Lessons Completed`;

            document.getElementById("continueCard").onclick = () => {
                window.open(data.continue_learning.drive_link, '_blank');
            };
            document.getElementById("continueViewAll").onclick = (e) => {
                e.preventDefault();
                window.open(data.continue_learning.drive_link, '_blank');
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
                    window.open(sub.drive_link, '_blank');
                };
                subjectsGrid.appendChild(card);
            });
        }

        // 4. Quick Option Clicks Mapping
        document.querySelectorAll(".quick-card").forEach(card => {
            const key = card.getAttribute("data-key");
            card.onclick = () => {
                if(data.quick_options && data.quick_options[key]) {
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
                
                // Highlight active nav icon
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

        // Top Search & Notification Buttons
        document.getElementById("searchBtn").onclick = () => {
            const query = prompt("Search study materials or chapters:");
            if(query) {
                alert(`Searching for: "${query}". You can link your search index or folders in content.json.`);
            }
        };

        document.getElementById("notifBtn").onclick = () => {
            alert("No new notifications at this time.");
        };

        // Explore Courses Banner Button
        document.getElementById("exploreCoursesBtn").onclick = () => {
            window.scrollTo({ top: 400, behavior: 'smooth' });
        };

    } catch (error) {
        console.error("Error loading content.json:", error);
    }
}

function setupNavigation() {
    const profileToggleBtn = document.getElementById("profileToggleBtn");
    const brandHome = document.getElementById("brandHome");
    const homeContainer = document.getElementById("homeViewContainer");
    const profileView = document.getElementById("profileView");

    // Toggle Profile View on clicking profile picture icon
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

    // Return to Home view when clicking brand logo title
    brandHome.onclick = () => {
        showHomeView();
        document.querySelectorAll(".bottom-nav .nav-item").forEach(n => n.classList.remove("active"));
        document.querySelector('.bottom-nav .nav-item[data-nav="home"]').classList.add("active");
    };

    // Settings actions in Profile view
    document.getElementById("clearCacheBtn").onclick = () => {
        if('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        localStorage.clear();
        alert("App cache cleared successfully!");
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
