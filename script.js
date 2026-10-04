/*
    VERSEQUEST
    Bible Study Level-Up System
    Professional Version - Daily Progression
*/

const STORAGE_KEYS = {
    game: "verseQuestGame",
    theme: "verseQuestDarkMode"
};

const defaultGame = {
    xp: 0,
    versesRead: 0,
    streak: 0,
    lastRead: null,
    favorites: [],
    reflections: {},
    completedDates: [],
    lastCompletionDate: null
};

const verses = [
    {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        version: "KJV"
    },
    {
        reference: "Psalm 23:1",
        text: "The LORD is my shepherd; I shall not want.",
        version: "KJV"
    },
    {
        reference: "Philippians 4:13",
        text: "I can do all things through Christ which strengtheneth me.",
        version: "KJV"
    },
    {
        reference: "Proverbs 3:5",
        text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
        version: "KJV"
    },
    {
        reference: "Joshua 1:9",
        text: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
        version: "KJV"
    },
    {
        reference: "Psalm 119:105",
        text: "Thy word is a lamp unto my feet, and a light unto my path.",
        version: "KJV"
    },
    {
        reference: "Jeremiah 29:11",
        text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
        version: "KJV"
    }
];

function loadGameData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.game);
        if (!saved) return { ...defaultGame };

        const parsed = JSON.parse(saved);
        return {
            ...defaultGame,
            ...parsed,
            favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
            reflections: parsed.reflections && typeof parsed.reflections === "object" ? parsed.reflections : {},
            completedDates: Array.isArray(parsed.completedDates) ? parsed.completedDates : []
        };
    } catch (error) {
        console.warn("Failed to load saved game:", error);
        return { ...defaultGame };
    }
}

let game = loadGameData();

function getDayNumber() {
    const start = new Date("2026-01-01");
    const today = new Date();
    const difference = Math.floor((today - start) / 86400000);
    return Math.abs(difference);
}

function getTodayVerse() {
    return verses[getDayNumber() % verses.length];
}

function getLevel() {
    return Math.floor(game.xp / 100) + 1;
}

function getLevelName(level) {
    if (level >= 20) return "Bible Master";
    if (level >= 15) return "Scripture Scholar";
    if (level >= 10) return "Faith Leader";
    if (level >= 7) return "Dedicated Student";
    if (level >= 5) return "Growing Disciple";
    if (level >= 3) return "Faith Explorer";
    return "New Reader";
}

function getDateKey(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
}

function saveGame() {
    localStorage.setItem(STORAGE_KEYS.game, JSON.stringify(game));
}

function updateUI() {
    const level = getLevel();
    const levelXP = game.xp % 100;
    const progress = Math.min(levelXP, 100);

    const elements = {
        levelNumber: document.getElementById("levelNumber"),
        levelName: document.getElementById("levelName"),
        totalXP: document.getElementById("totalXP"),
        versesRead: document.getElementById("versesRead"),
        streak: document.getElementById("streak"),
        achievementCount: document.getElementById("achievementCount"),
        xpBadge: document.getElementById("xpBadge"),
        currentLevelText: document.getElementById("currentLevelText"),
        nextLevelText: document.getElementById("nextLevelText"),
        xpProgress: document.getElementById("xpProgress"),
        bigLevel: document.getElementById("bigLevel"),
        bigLevelName: document.getElementById("bigLevelName"),
        bigXPProgress: document.getElementById("bigXPProgress"),
        bigXPText: document.getElementById("bigXPText"),
        progressXP: document.getElementById("progressXP"),
        progressVerses: document.getElementById("progressVerses"),
        progressStreak: document.getElementById("progressStreak")
    };

    Object.entries(elements).forEach(([key, element]) => {
        if (!element) return;

        switch (key) {
            case "levelNumber":
            case "bigLevel":
                element.textContent = level;
                break;
            case "levelName":
            case "bigLevelName":
                element.textContent = getLevelName(level);
                break;
            case "totalXP":
                element.textContent = `${game.xp} XP`;
                break;
            case "versesRead":
            case "progressVerses":
                element.textContent = game.versesRead;
                break;
            case "streak":
            case "progressStreak":
                element.textContent = game.streak;
                break;
            case "achievementCount":
                element.textContent = getUnlockedAchievements();
                break;
            case "xpBadge":
                element.textContent = `${game.xp} XP`;
                break;
            case "currentLevelText":
                element.textContent = `Level ${level}`;
                break;
            case "nextLevelText":
                element.textContent = `${levelXP} / 100 XP`;
                break;
            case "xpProgress":
            case "bigXPProgress":
                element.style.width = `${progress}%`;
                break;
            case "bigXPText":
                element.textContent = `${levelXP} / 100 XP`;
                break;
            case "progressXP":
                element.textContent = game.xp;
                break;
        }
    });

    updateAchievements();
    updateFavoriteButton();
    updateStudyButtonState();
}

function updateStudyButtonState() {
    const button = document.getElementById("completeButton");
    if (!button) return;

    const today = getDateKey();
    const completed = game.completedDates.includes(today);

    button.disabled = completed;
    button.classList.toggle("completed", completed);
    button.textContent = completed ? "✓ Study Completed Today" : "✓ Complete Today's Study";
}

function showCompletionModal() {
    const today = getDateKey();
    const tomorrow = getDateKey(1);
    const tomorrowVerse = verses[getDayNumber() % verses.length];
    const nextDayVerse = verses[(getDayNumber() + 1) % verses.length];

    const modal = document.getElementById("successModal");
    const title = document.getElementById("modalTitle");
    const icon = document.getElementById("modalIcon");
    const message = document.getElementById("modalMessage");
    const stats = document.getElementById("modalStats");
    const level = getLevel();

    const oldLevel = Math.floor((game.xp - 25) / 100) + 1;
    const leveledUp = level > oldLevel;

    if (leveledUp) {
        title.textContent = "🎉 Level Up!";
        icon.textContent = "🚀";
        message.textContent = `You've reached Level ${level}! ${getLevelName(level)}`;
    } else {
        title.textContent = "📖 Great Job!";
        icon.textContent = "✨";
        message.textContent = "You've completed today's study!";
    }

    stats.innerHTML = `
        <div class="stat-item">
            <strong>+25</strong>
            <small>XP Earned</small>
        </div>
        <div class="stat-item">
            <strong>${game.streak}</strong>
            <small>Day Streak</small>
        </div>
    `;

    modal.classList.add("show");
}

function completeStudy() {
    const today = getDateKey();

    if (game.completedDates.includes(today)) {
        console.log("Study already completed today");
        return;
    }

    const oldLevel = getLevel();

    game.xp += 25;
    game.versesRead += 1;
    updateStreak();
    game.completedDates.push(today);
    game.lastCompletionDate = today;
    saveGame();

    updateUI();
    showCompletionModal();
}

function updateStreak() {
    const today = getDateKey();

    if (!game.lastRead) {
        game.streak = 1;
    } else {
        const yesterday = getDateKey(-1);

        if (game.lastRead === yesterday) {
            game.streak += 1;
        } else if (game.lastRead !== today) {
            game.streak = 1;
        }
    }

    game.lastRead = today;
}

function loadVerse() {
    const verse = getTodayVerse();

    const elements = {
        verseReference: document.getElementById("verseReference"),
        verseText: document.getElementById("verseText"),
        verseDate: document.getElementById("verseDate"),
        verseVersion: document.getElementById("verseVersion"),
        reflection: document.getElementById("reflection")
    };

    const today = getDateKey();

    if (elements.verseReference) elements.verseReference.textContent = verse.reference;
    if (elements.verseText) elements.verseText.textContent = verse.text;
    if (elements.verseDate) elements.verseDate.textContent = new Date().toLocaleDateString();
    if (elements.verseVersion) elements.verseVersion.textContent = verse.version;
    if (elements.reflection) elements.reflection.value = game.reflections[today] || "";

    updateStudyButtonState();
}

function toggleFavorite() {
    const verse = getTodayVerse();
    const exists = game.favorites.some(item => item.reference === verse.reference);

    if (exists) {
        game.favorites = game.favorites.filter(item => item.reference !== verse.reference);
    } else {
        game.favorites.push(verse);
    }

    saveGame();
    updateFavoriteButton();
    renderFavorites();
}

function updateFavoriteButton() {
    const verse = getTodayVerse();
    const exists = game.favorites.some(item => item.reference === verse.reference);
    const button = document.getElementById("favoriteButton");

    if (!button) return;

    button.classList.toggle("favorite", exists);
    button.textContent = exists ? "♥" : "♡";
}

function renderFavorites() {
    const container = document.getElementById("favoritesList");
    if (!container) return;

    container.innerHTML = "";

    if (game.favorites.length === 0) {
        container.innerHTML = `
            <div class="favorite-item">
                <h3>No favorites yet</h3>
                <p>Tap the ♡ button on a verse to save it here.</p>
            </div>
        `;
        return;
    }

    game.favorites.forEach(verse => {
        const item = document.createElement("div");
        item.className = "favorite-item";
        item.innerHTML = `
            <h3>${verse.reference}</h3>
            <p>"${verse.text}"</p>
        `;
        container.appendChild(item);
    });
}

const achievements = [
    {
        icon: "🌱",
        title: "First Step",
        description: "Read your first verse.",
        check: () => game.versesRead >= 1
    },
    {
        icon: "🔥",
        title: "7-Day Streak",
        description: "Study for 7 days in a row.",
        check: () => game.streak >= 7
    },
    {
        icon: "📖",
        title: "Bookworm",
        description: "Read 10 verses.",
        check: () => game.versesRead >= 10
    },
    {
        icon: "⭐",
        title: "XP Hunter",
        description: "Earn 100 XP.",
        check: () => game.xp >= 100
    },
    {
        icon: "🏆",
        title: "Faith Builder",
        description: "Reach Level 5.",
        check: () => getLevel() >= 5
    },
    {
        icon: "👑",
        title: "Bible Master",
        description: "Reach Level 20.",
        check: () => getLevel() >= 20
    }
];

function updateAchievements() {
    const container = document.getElementById("achievementGrid");
    if (!container) return;

    container.innerHTML = "";

    achievements.forEach(achievement => {
        const unlocked = achievement.check();
        const card = document.createElement("div");
        card.className = `achievement${unlocked ? " unlocked" : ""}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <p style="margin-top:10px;font-weight:700;">${unlocked ? "✓ Unlocked" : "🔒 Locked"}</p>
        `;
        container.appendChild(card);
    });
}

function getUnlockedAchievements() {
    return achievements.filter(achievement => achievement.check()).length;
}

function applyTheme() {
    const isDark = localStorage.getItem(STORAGE_KEYS.theme) === "true";
    document.body.classList.toggle("dark", isDark);
    const themeButton = document.getElementById("themeButton");
    if (themeButton) {
        themeButton.textContent = isDark ? "☀️" : "🌙";
    }
}

function setupNavigation() {
    document.querySelectorAll(".nav-btn").forEach(button => {
        button.addEventListener("click", () => {
            const target = button.dataset.section;

            document.querySelectorAll(".section").forEach(section => {
                section.classList.remove("active-section");
            });

            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add("active-section");
            }

            document.querySelectorAll(".nav-btn").forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

function setupThemeToggle() {
    const themeButton = document.getElementById("themeButton");
    if (!themeButton) return;

    themeButton.addEventListener("click", () => {
        const dark = document.body.classList.toggle("dark");
        localStorage.setItem(STORAGE_KEYS.theme, dark ? "true" : "false");
        themeButton.textContent = dark ? "☀️" : "🌙";
    });
}

function setupModal() {
    const modal = document.getElementById("successModal");
    const closeButton = document.getElementById("closeModal");
    const continueButton = document.getElementById("continueButton");

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            modal.classList.remove("show");
        });
    }

    if (continueButton) {
        continueButton.addEventListener("click", () => {
            modal.classList.remove("show");
            loadVerse();
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
        }
    });
}

function setupEventHandlers() {
    const completeButton = document.getElementById("completeButton");
    if (completeButton) {
        completeButton.addEventListener("click", completeStudy);
    }

    const favoriteButton = document.getElementById("favoriteButton");
    if (favoriteButton) {
        favoriteButton.addEventListener("click", toggleFavorite);
    }

    const saveReflectionButton = document.getElementById("saveReflection");
    if (saveReflectionButton) {
        saveReflectionButton.addEventListener("click", () => {
            const today = getDateKey();
            const reflection = document.getElementById("reflection");
            if (reflection) {
                game.reflections[today] = reflection.value;
                saveGame();

                const message = document.getElementById("savedMessage");
                if (message) {
                    message.textContent = "Saved ✓";
                    setTimeout(() => {
                        message.textContent = "";
                    }, 2000);
                }
            }
        });
    }
}

function initializeApp() {
    applyTheme();
    setupNavigation();
    setupThemeToggle();
    setupModal();
    setupEventHandlers();
    loadVerse();
    updateUI();
    renderFavorites();
}

document.addEventListener("DOMContentLoaded", initializeApp);

window.addEventListener("beforeunload", () => {
    saveGame();
});
