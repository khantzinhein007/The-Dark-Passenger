const output = document.getElementById('output');
const choicesDiv = document.getElementById('choices');
let score = 0, suspicion = 0, façade = 100, cash = 200, closeCalls = 0, cover = 50, sanity = 100, media = 0, streak = 0, escapes = 2, slides = 0, urges = 0;
let tools = { slides: 1, plastic: 2, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0 };
let difficulty = null, turn = 0, currentLocation = "Miami Suburbs", weather = "Clear", accomplice = null;
let modSettings = { infiniteCash: false, noSuspicion: false, maxTools: false, stealthMode: false, extraLives: 0, darkPassenger: true, killEffects: true };
let gameState = { currentTarget: null, inGame: false, method: null };
let methodChosen = false;
let neutralizedTargets = [];

const difficulties = {
    "Easy": { cash: 500, slides: 2, plastic: 3, suspicionRate: 0.5, façadeDrain: 0.5, killsToWin: 5, intro: "Miami’s filth trusts me. The Code guides." },
    "Normal": { cash: 200, slides: 1, plastic: 2, suspicionRate: 1, façadeDrain: 1, killsToWin: 7, intro: "Metro’s watching. I’m still invisible." },
    "Hard": { cash: 100, slides: 1, plastic: 1, suspicionRate: 1.5, façadeDrain: 1.5, killsToWin: 10, intro: "Doakes is close. Precision’s my shield." }
};

const targets = [
    { name: "Drug Dealer", profile: "Cocky, armed, street corner", worth: 200, trait: null, resistChance: 0.3, trustThreshold: 60 },
    { name: "Human Trafficker", profile: "Sly, paranoid, warehouse", worth: 250, trait: null, resistChance: 0.4, trustThreshold: 50 },
    { name: "Serial Rapist", profile: "Arrogant, prowling bars", worth: 180, trait: null, resistChance: 0.35, trustThreshold: 55 },
    { name: "Corrupt Cop", profile: "Greedy, badge as shield", worth: 300, risk: true, trait: null, resistChance: 0.5, trustThreshold: 40 },
    { name: "Hitman", profile: "Cold, precise, hired gun", worth: 220, trait: null, resistChance: 0.45, trustThreshold: 45 },
    { name: "Child Predator", profile: "Nervous, hiding in plain sight", worth: 190, trait: null, resistChance: 0.25, trustThreshold: 65 },
    { name: "Gang Leader", profile: "Ruthless, crew nearby", worth: 400, risk: true, trait: null, resistChance: 0.3, trustThreshold: 60 },
    { name: "Black Market Doc", profile: "Shady, surgical hands", worth: 230, trait: null, resistChance: 0.2, trustThreshold: 70 },
    { name: "Witness", profile: "Scared, knows my face", worth: 350, risk: true, trait: null, resistChance: 0.4, trustThreshold: 50 },
    { name: "Smuggler", profile: "Greasy, boat docked", worth: 210, trait: null, resistChance: 0.3, trustThreshold: 60 },
    { name: "Arsonist", profile: "Twitchy, smells of gasoline", worth: 170, trait: null, resistChance: 0.35, trustThreshold: 55 },
    { name: "Cult Enforcer", profile: "Fanatic, blade in hand", worth: 240, trait: null, resistChance: 0.25, trustThreshold: 65 }
];

const targetTraits = ["Armed", "Connected", "Sloppy", "Suspicious", "Desperate"];
const locations = {
    "Miami Suburbs": { suspicionMod: 1, cashMod: 1, façadeDrain: 1, metroPresence: 0.1 },
    "Downtown Miami": { suspicionMod: 1.2, cashMod: 1.5, façadeDrain: 1, metroPresence: 0.15 },
    "Everglades": { suspicionMod: 0.7, cashMod: 0.8, façadeDrain: 0.5, metroPresence: 0.05 }
};

const blackMarket = {
    "Plastic Wrap": { cost: 50, action: () => tools.plastic++ },
    "Sedative": { cost: 150, action: () => tools.sedative++ },
    "Shovel": { cost: 80, action: () => tools.shovel++ },
    "Machete": { cost: 200, action: () => tools.machete++ },
    "Sell Slide": { profit: () => Math.floor(Math.random() * 201) + 100, action: () => slides--, condition: () => slides > 0 }
};

function displayText(text, delay = 0) {
    return new Promise(resolve => setTimeout(() => { 
        output.innerHTML += text + '<br>';
        output.scrollTop = output.scrollHeight; 
        resolve(); 
    }, delay));
}

function clearChoices() { 
    choicesDiv.innerHTML = ''; 
}

function addChoiceButton(text, callback) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = callback;
    choicesDiv.appendChild(button);
}

async function selectDifficulty() {
    output.innerHTML = '';
    await displayText("The Dark Passenger stirs. How deep do I hunt?");
    if (!methodChosen) {
        await displayText("First, choose your method:", 1000);
        const methods = [
            { name: "Ritualist", action: () => { gameState.method = "Ritualist"; methodChosen = true; selectDifficulty(); } },
            { name: "Hunter", action: () => { gameState.method = "Hunter"; methodChosen = true; selectDifficulty(); } },
            { name: "Phantom", action: () => { gameState.method = "Phantom"; methodChosen = true; selectDifficulty(); } }
        ];
        clearChoices();
        methods.forEach(m => addChoiceButton(m.name, m.action));
    } else {
        await displayText("<br>Choose your mask:", 1000);
        clearChoices();
        for (let diff in difficulties) addChoiceButton(diff, () => startGame(diff));
    }
}

async function showModMenu() {
    clearChoices();
    await displayText("<br>Mod Menu - Bend the Rules:");
    addChoiceButton(`Infinite Cash: ${modSettings.infiniteCash ? 'ON' : 'OFF'}`, () => { 
        modSettings.infiniteCash = !modSettings.infiniteCash; 
        if (!modSettings.infiniteCash) cash = Math.max(cash, 0); 
        showModMenu(); 
    });
    addChoiceButton(`No Suspicion: ${modSettings.noSuspicion ? 'ON' : 'OFF'}`, () => { 
        modSettings.noSuspicion = !modSettings.noSuspicion; 
        if (modSettings.noSuspicion) suspicion = 0; 
        showModMenu(); 
    });
    addChoiceButton(`Max Tools: ${modSettings.maxTools ? 'ON' : 'OFF'}`, () => { 
        modSettings.maxTools = !modSettings.maxTools; 
        if (modSettings.maxTools) tools = { slides: 99, plastic: 99, boat: true, sedative: 99, shovel: 99, flashlight: 99, machete: 99, lockpick: 99, tape: 99, garrote: 99, syringe: 99, disguise: { type: "Tourist", turns: 3 }, badge: 1 }; 
        showModMenu(); 
    });
    addChoiceButton("Back", () => showScene(gameState.currentTarget));
}

async function showBlackMarket(target) {
    clearChoices();
    await displayText("<br>Black Market - Miami’s shadows:");
    for (let item in blackMarket) {
        const { cost, profit, condition } = blackMarket[item];
        const price = cost ? cost : (profit ? profit() : 0);
        if (condition && condition()) {
            addChoiceButton(`${item} (+$${price})`, () => handleBlackMarket(item, target, price));
        } else if (!condition && (!tools[item] || item === "Plastic Wrap" || item === "Sedative" || item === "Shovel" || item === "Machete")) {
            addChoiceButton(`${item} (-$${price})`, () => handleBlackMarket(item, target, price));
        }
    }
    addChoiceButton("Back to Hunt", () => showScene(gameState.currentTarget));
}

async function handleBlackMarket(item, target, price) {
    clearChoices();
    const { action, condition } = blackMarket[item];
    if (condition && condition()) {
        cash += price;
        action();
        await displayText(`Sold ${item.replace("Sell ", "")} for $${price}.`);
        if (Math.random() > 0.8) { 
            await displayText("Word spreads."); 
            suspicion += 10 * difficulty.suspicionRate; 
            urges += 10; 
        }
    } else if (cash >= price || modSettings.infiniteCash) {
        if (!modSettings.infiniteCash) cash -= price;
        action();
        await displayText(`Acquired ${item} for $${price}.`);
    } else {
        await displayText("Not enough cash.");
    }
    showBlackMarket(target);
}

async function startGame(selectedDifficulty) {
    difficulty = difficulties[selectedDifficulty];
    score = 0; suspicion = 0; façade = 100; cash = difficulty.cash; closeCalls = 0; cover = 50; sanity = 100; media = 0; streak = 0; escapes = 2; slides = 0; urges = 0;
    tools = { slides: difficulty.slides, plastic: 2, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0 };
    turn = 0; currentLocation = "Miami Suburbs"; accomplice = null; neutralizedTargets = [];
    gameState.inGame = true;
    output.innerHTML = '';
    await displayText("I’m Dexter Morgan—blood-splatter analyst, hunter of monsters.");
    await displayText(difficulty.intro, 1000);
    await displayText(`Cleanse ${difficulty.killsToWin} stains from Miami.`, 1000);
    showScene(null);
}

function getRandomItem(array) { 
    return array[Math.floor(Math.random() * array.length)]; 
}

async function chooseTarget() {
    clearChoices();
    const availableTargets = targets.filter(t => !neutralizedTargets.includes(t.name));
    if (availableTargets.length === 0) {
        await displayText("No monsters left. Miami’s clean—for now.");
        playAgain();
        return;
    }
    const validTargets = availableTargets.filter(t => !locations[currentLocation].highRiskOnly || t.risk);
    if (validTargets.length === 0) {
        await displayText("No suitable targets here. Time to move.");
        await moveLocation();
        return;
    }
    gameState.currentTarget = { ...getRandomItem(validTargets), trait: getRandomItem(targetTraits) };
    await displayText(`<br><span class="bloody-target">The Code finds: ${gameState.currentTarget.name} - ${gameState.currentTarget.profile} (${gameState.currentTarget.trait})</span>`);
    showScene(gameState.currentTarget);
}

async function showScene(target = null) {
    clearChoices();
    turn++;
    if (!target) {
        await chooseTarget();
        return;
    }
    gameState.currentTarget = target;
    weather = Math.random() < 0.2 ? getRandomItem(["Rain", "Hurricane", "Clear"]) : "Clear";
    const isNight = turn % 2 === 0;
    if (turn % 5 === 0 && currentLocation !== "Keys") await moveLocation();

    await displayText(`<br>Cleanse ${score + 1} - ${currentLocation} - ${isNight ? "Night" : "Day"} - ${weather}`);
    await displayText(`<span class="stat-bar">Kills: ${score}/${difficulty.killsToWin} | Suspicion: ${suspicion}% | Façade: ${façade}% | Cash: $${cash} | Cover: ${cover}% | Sanity: ${sanity}% | Urges: ${urges}% | Streak: ${streak} | Escapes: ${escapes} | Slides: ${slides}</span>`);
    await displayText(`Tools: Slides=${tools.slides}, Plastic=${tools.plastic}, Boat=${tools.boat ? 'Y' : 'N'}, Sedative=${tools.sedative}, Shovel=${tools.shovel}, Machete=${tools.machete}`);
    if (suspicion > 75) await displayText(`<span class="warning">Metro’s sniffing around!</span>`);
    await displayText("<br>Act or fade:");
    if (tools.plastic > 0) addChoiceButton("Wrap in Plastic", () => handleChoice(2, gameState.currentTarget));
    addChoiceButton("Blend In", () => handleChoice(4, gameState.currentTarget));
    if (tools.boat) addChoiceButton(`Dispose at Sea ($${gameState.currentTarget.worth})`, () => handleChoice(5, gameState.currentTarget));
    if (tools.sedative > 0) addChoiceButton("Sedate", () => handleChoice(3, gameState.currentTarget));
    if (tools.shovel > 0) addChoiceButton("Bury Evidence", () => handleChoice(9, gameState.currentTarget));
    if (tools.machete > 0) addChoiceButton("Slash with Machete", () => handleChoice(6, gameState.currentTarget));
    if (gameState.inGame) addChoiceButton("Mod Menu", showModMenu);
    addChoiceButton("Black Market", () => showBlackMarket(gameState.currentTarget));
}

async function handleChoice(choice, target) {
    clearChoices();
    let suspicionMultiplier = (modSettings.noSuspicion ? 0 : (modSettings.stealthMode ? 0.5 : 1)) * locations[currentLocation].suspicionMod;
    let façadeMultiplier = locations[currentLocation].façadeDrain;
    let cashMultiplier = locations[currentLocation].cashMod;
    const isNight = turn % 2 === 0;
    let resisted = façade < target.trustThreshold && Math.random() < target.resistChance;

    if (choice === 2 && tools.plastic > 0) {
        tools.plastic--;
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier * (gameState.method === "Ritualist" ? 1.5 : 1); 
        suspicion += (target.risk ? 30 : 15) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= 10; media += target.risk ? 15 : 5; cover -= 10; urges += 15;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide for the collection."); }
        neutralizedTargets.push(target.name);
        await displayText(`Wrapped and ended. $${target.worth} from ${target.name}.`);
    } else if (choice === 3 && tools.sedative > 0) {
        tools.sedative--; façade -= 8 * façadeMultiplier; suspicion += Math.floor(Math.random() * 10 * difficulty.suspicionRate * suspicionMultiplier); urges += 10;
        if (resisted && target.name !== "Witness") { 
            await displayText("He shakes it off!"); 
            suspicion += 10; 
        } else { 
            score += 1; cash += target.worth * cashMultiplier; sanity -= 5; media += 5; cover -= 5; 
            neutralizedTargets.push(target.name);
            await displayText(`Sedated and gone. $${target.worth} taken.`); 
        }
    } else if (choice === 4) {
        façade += (isNight ? 10 : 20) * (gameState.method === "Phantom" ? 1.5 : 1); 
        suspicion += Math.floor(Math.random() * 5 * difficulty.suspicionRate * suspicionMultiplier * (isNight ? 0.5 : 1));
        urges -= 5;
        await displayText("I’m just another face. Safe.");
    } else if (choice === 5 && tools.boat) {
        score += 1; façade -= 15 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 40 : 20) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= 15; media += target.risk ? 20 : 10; cover -= 15; urges += 20;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        neutralizedTargets.push(target.name);
        await displayText(`${target.name} sinks to the depths. $${target.worth} gained.`);
    } else if (choice === 6 && tools.machete > 0) {
        tools.machete--;
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 35 : 20) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= 12; media += target.risk ? 18 : 8; cover -= 12; urges += 18;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        neutralizedTargets.push(target.name);
        await displayText(`Hacked apart. $${target.worth} from ${target.name}.`);
    } else if (choice === 9 && tools.shovel > 0) {
        tools.shovel--; suspicion = Math.max(0, suspicion - 20); façade -= 5 * façadeMultiplier; cover += 20; urges += 5;
        await displayText("Buried deep. No trace.");
    }

    applyModifiers();
    if ([2, 3, 5, 6].includes(choice) && !resisted) {
        await checkGameState(true);
    } else {
        await checkGameState(false);
    }
}

async function applyModifiers() {
    if (modSettings.noSuspicion) suspicion = 0;
    else suspicion = Math.min(100, Math.max(0, suspicion));
    if (modSettings.infiniteCash) cash = Infinity;
    if (modSettings.maxTools) tools = { slides: 99, plastic: 99, boat: true, sedative: 99, shovel: 99, flashlight: 99, machete: 99, lockpick: 99, tape: 99, garrote: 99, syringe: 99, disguise: { type: "Tourist", turns: 3 }, badge: 1 };
    façade = Math.max(0, Math.min(100, façade));
    sanity = Math.max(0, Math.min(100, sanity));
    cover = Math.max(0, Math.min(100, cover));
    media = Math.max(0, Math.min(100, media));
    urges = Math.max(0, Math.min(100, urges));
}

async function checkGameState(killed = false) {
    if (suspicion >= 100) {
        await displayText("<br>Metro’s on me—too close!");
        await displayText("<span class='warning'>Caught!</span>");
        playAgain();
    } else if (façade <= 0) {
        await displayText("<br>Façade’s gone. They see me.");
        await displayText("<span class='warning'>Unmasked!</span>");
        playAgain();
    } else if (sanity <= 0) {
        await displayText("<br>The Passenger takes over. I’m lost.");
        await displayText("<span class='warning'>Broken!</span>");
        playAgain();
    } else if (urges >= 100) {
        await displayText("<br>The need consumes me—I slip!");
        await displayText("<span class='warning'>Caught in Chaos!</span>");
        playAgain();
    } else if (score >= difficulty.killsToWin) {
        await displayText("<br>The Code’s complete.");
        await displayText(`Faded with $${cash}.`, 500);
        await displayText("<span class='stat-bar'>You Win!</span>");
        playAgain();
    } else {
        showScene(killed ? null : gameState.currentTarget);
    }
}

async function moveLocation() {
    clearChoices();
    await displayText("<br>Five kills here. Time to shift.");
    const nextLocations = Object.keys(locations).filter(l => l !== currentLocation);
    nextLocations.forEach(loc => addChoiceButton(`Move to ${loc}`, () => { currentLocation = loc; suspicion += 20; urges += 10; showScene(null); }));
    addChoiceButton("Stay ($200)", () => { cash -= 200; suspicion = 20; urges += 5; showScene(gameState.currentTarget); });
}

function playAgain() { 
    clearChoices(); 
    gameState.inGame = false; 
    methodChosen = false;
    addChoiceButton("New Hunt", selectDifficulty); 
    addChoiceButton("Fade Out", () => { output.innerHTML = "The Passenger rests. For now."; clearChoices(); }); 
}

selectDifficulty();