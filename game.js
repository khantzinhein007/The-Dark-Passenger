const output = document.getElementById('output');
const choicesDiv = document.getElementById('choices');
const killSound = document.getElementById('kill-sound');
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
    "Hard": { cash: 100, slides: 1, plastic: 1, suspicionRate: 1.5, façadeDrain: 1.5, killsToWin: 10, intro: "Doakes is close. Precision’s my shield." },
    "Nightmare": { cash: 50, slides: 0, plastic: 1, suspicionRate: 2, façadeDrain: 2, killsToWin: 15, intro: "Every move’s a risk. I’m the shadow." },
    "Bay Harbor": { cash: 150, slides: 0, plastic: 2, suspicionRate: 2.5, façadeDrain: 0.5, survivalTurns: 10, intro: "They’re onto me. Survive or sink." },
    "Legend": { cash: 100, slides: 1, plastic: 1, suspicionRate: 3, façadeDrain: 3, killsToWin: 20, intro: "The Dark Passenger writes history." }
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
    "Everglades": { suspicionMod: 0.7, cashMod: 0.8, façadeDrain: 0.5, metroPresence: 0.05 },
    "South Beach": { suspicionMod: 1.5, cashMod: 2, façadeDrain: 1, metroPresence: 0.2 },
    "Port of Miami": { suspicionMod: 1, cashMod: 1.2, façadeDrain: 1, metroPresence: 0.12 },
    "Little Havana": { suspicionMod: 0.9, cashMod: 1, façadeDrain: 0.9, metroPresence: 0.08 },
    "Keys": { suspicionMod: 0.8, cashMod: 0.9, façadeDrain: 1, metroPresence: 0.07, highRiskOnly: true }
};
const weatherEffects = {
    "Rain": { suspicionMod: 0.8, façadeMod: 0.9, urgeMod: 1.1 },
    "Hurricane": { instantKill: true, suspicionMod: 1.3, urgeMod: 1.2 },
    "Clear": { façadeMod: 1.2, suspicionMod: 1.1, urgeMod: 1 }
};

const blackMarket = {
    "Kill Slides": { cost: 100, action: () => tools.slides++ },
    "Plastic Wrap": { cost: 50, action: () => tools.plastic++ },
    "Sedative": { cost: 150, action: () => tools.sedative++ },
    "Shovel": { cost: 80, action: () => tools.shovel++ },
    "Flashlight": { cost: 100, action: () => tools.flashlight++ },
    "Machete": { cost: 200, action: () => tools.machete++ },
    "Lockpick": { cost: 120, action: () => tools.lockpick++ },
    "Tape": { cost: 60, action: () => tools.tape++ },
    "Garrote": { cost: 150, action: () => tools.garrote++ },
    "Syringe": { cost: 180, action: () => tools.syringe++ },
    "Disguise Kit": { cost: 250, action: () => tools.disguise = { type: prompt("Choose: Cop, Worker, Tourist") || "Tourist", turns: 3 } },
    "Fake Badge": { cost: 400, action: () => tools.badge = 1 },
    "Pills": { cost: 150, action: () => { sanity = Math.min(100, sanity + 30); urges -= 20; } },
    "New Plates": { cost: 300, action: () => suspicion = Math.max(0, suspicion - 30) },
    "Lookout": { cost: 400, action: () => accomplice = { type: "Lookout", turns: 5 } },
    "Cleaner": { cost: 600, action: () => accomplice = { type: "Cleaner", turns: 3 } },
    "Distraction": { cost: 500, action: () => accomplice = { type: "Distraction", turns: 4 } },
    "Sell Slide": { profit: () => Math.floor(Math.random() * 201) + 100, action: () => slides--, condition: () => slides > 0 }
};

function displayText(text, delay = 0) {
    return new Promise(resolve => setTimeout(() => { output.innerHTML += `${text}<br>`; output.scrollTop = output.scrollHeight; resolve(); }, delay));
}

function clearChoices() { choicesDiv.innerHTML = ''; }

function addChoiceButton(text, callback) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = callback;
    choicesDiv.appendChild(button);
}

function addKillFlash(targetName) {
    const flash = document.createElement('div');
    flash.className = 'kill-flash';
    if (targetName === "Drug Dealer") flash.classList.add('criminal');
    if (targetName === "Gang Leader") flash.classList.add('high-profile');
    document.getElementById('game-container').appendChild(flash);
    if (modSettings.killEffects && killSound) { killSound.muted = false; killSound.play().catch(() => {}); }
    setTimeout(() => flash.remove(), 500);
}

async function selectDifficulty() {
    output.innerHTML = '';
    await displayText("The Dark Passenger stirs. Who’s next?");
    if (!methodChosen) {
        await displayText("First, choose your method:", 1000);
        const methods = [
            { name: "Ritualist", action: () => { gameState.method = "Ritualist"; methodChosen = true; selectDifficulty(); } },
            { name: "Hunter", action: () => { gameState.method = "Hunter"; methodChosen = true; selectDifficulty(); } },
            { name: "Phantom", action: () => { gameState.method = "Phantom"; methodChosen = true; selectDifficulty(); } }
        ];
        methods.forEach(m => addChoiceButton(m.name, () => { m.action(); clearChoices(); }));
    } else {
        await displayText("<br>Choose your mask:", 1000);
        for (let diff in difficulties) if (diff !== "Legend" || urges >= 3) addChoiceButton(diff, () => startGame(diff));
    }
}

async function showModMenu() {
    clearChoices();
    await displayText("<br>Mod Menu - Twist the Code:");
    addChoiceButton(`Infinite Cash: ${modSettings.infiniteCash ? 'ON' : 'OFF'}`, () => { modSettings.infiniteCash = !modSettings.infiniteCash; if (!modSettings.infiniteCash) cash = Math.max(cash, 0); showModMenu(); });
    addChoiceButton(`No Suspicion: ${modSettings.noSuspicion ? 'ON' : 'OFF'}`, () => { modSettings.noSuspicion = !modSettings.noSuspicion; if (modSettings.noSuspicion) suspicion = 0; showModMenu(); });
    addChoiceButton(`Max Tools: ${modSettings.maxTools ? 'ON' : 'OFF'}`, () => { modSettings.maxTools = !modSettings.maxTools; if (modSettings.maxTools) tools = { slides: 99, plastic: 99, boat: true, sedative: 99, shovel: 99, flashlight: 99, machete: 99, lockpick: 99, tape: 99, garrote: 99, syringe: 99, disguise: { type: "Tourist", turns: 3 }, badge: 1 }; showModMenu(); });
    addChoiceButton(`Stealth Mode: ${modSettings.stealthMode ? 'ON' : 'OFF'}`, () => { modSettings.stealthMode = !modSettings.stealthMode; showModMenu(); });
    addChoiceButton(`Add Close Call (${closeCalls})`, () => { closeCalls++; modSettings.extraLives = closeCalls; showModMenu(); });
    addChoiceButton(`Dark Passenger: ${modSettings.darkPassenger ? 'ON' : 'OFF'}`, () => { modSettings.darkPassenger = !modSettings.darkPassenger; showModMenu(); });
    addChoiceButton(`Kill Effects: ${modSettings.killEffects ? 'ON' : 'OFF'}`, () => { modSettings.killEffects = !modSettings.killEffects; showModMenu(); });
    addChoiceButton("Reset Stats", () => { 
        score = 0; suspicion = 0; façade = 100; cash = difficulty.cash; sanity = 100; media = 0; streak = 0; slides = 0; urges = 0; 
        tools = { slides: difficulty.slides, plastic: difficulty.plastic, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0 }; 
        neutralizedTargets = []; showModMenu(); 
    });
    addChoiceButton("Change Difficulty", showDifficultyChange);
    addChoiceButton("Back", () => { if (gameState.inGame && gameState.currentTarget) showScene(gameState.currentTarget); else selectDifficulty(); });
}

async function showDifficultyChange() {
    clearChoices();
    await displayText("<br>Shift the Hunt:");
    for (let diff in difficulties) if (diff !== "Legend" || urges >= 3) addChoiceButton(diff, () => { difficulty = difficulties[diff]; cash = difficulty.cash; tools.slides = difficulty.slides; tools.plastic = difficulty.plastic; showModMenu(); });
    addChoiceButton("Back to Mods", showModMenu);
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
    if (selectedDifficulty === "Bay Harbor") await displayText("Survive 10 nights. Don’t let Metro win.", 1000);
    else await displayText(`Cleanse ${difficulty.killsToWin} stains from Miami.`, 1000);
    showScene(null);
}

function getRandomItem(array) { return array[Math.floor(Math.random() * array.length)]; }

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
    await displayText(`<br>The Code finds: ${gameState.currentTarget.name} - ${gameState.currentTarget.profile} (${gameState.currentTarget.trait})`);
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

    await displayText(`<br>${difficulty.survivalTurns ? `Night ${score + 1}/${difficulty.survivalTurns}` : `Cleanse ${score + 1}`} - ${currentLocation} - ${isNight ? "Night" : "Day"} - ${weather}`);
    await displayText(`<span class="stat-bar">${difficulty.survivalTurns ? `Nights: ${score}/${difficulty.survivalTurns}` : `Kills: ${score}/${difficulty.killsToWin}`} | Suspicion: ${suspicion}% | Façade: ${façade}% | Cash: $${cash} | Cover: ${cover}% | Sanity: ${sanity}% | Media: ${media}% | Urges: ${urges}% | Streak: ${streak} | Escapes: ${escapes} | Slides: ${slides}</span>`);
    await displayText(`Tools: Slides=${tools.slides}, Plastic=${tools.plastic}, Boat=${tools.boat ? 'Y' : 'N'}, Sedative=${tools.sedative}, Shovel=${tools.shovel}, Flashlight=${tools.flashlight}, Machete=${tools.machete}, Lockpick=${tools.lockpick}, Tape=${tools.tape}, Garrote=${tools.garrote}, Syringe=${tools.syringe}, Disguise=${tools.disguise ? tools.disguise.type : 'None'}, Badge=${tools.badge}`);
    if (accomplice) await displayText(`Accomplice: ${accomplice.type} (${accomplice.turns} turns left)`);
    if (suspicion > 75) await displayText(`<span class="warning">Metro’s sniffing around!</span>`);
    if (cover < 25) await displayText(`<span class="warning">Cover’s thin—Doakes is watching!</span>`);
    if (sanity < 25) await displayText(`<span class="warning">The Passenger’s too loud!</span>`);
    if (media > 75) await displayText(`<span class="warning">News screams ‘Bay Harbor Butcher’!</span>`);
    if (urges > 75) await displayText(`<span class="warning">The need’s clawing at me!</span>`);
    await displayText(`<br>Target: ${gameState.currentTarget.name} - ${gameState.currentTarget.profile} (${gameState.currentTarget.trait})`);
    await displayText("<br>Act or fade:");
    if (tools.slides > 0) addChoiceButton("1. Prepare Ritual", () => handleChoice(1, gameState.currentTarget));
    if (tools.plastic > 0) addChoiceButton("2. Wrap in Plastic", () => handleChoice(2, gameState.currentTarget));
    if (tools.sedative > 0) addChoiceButton("3. Sedate", () => handleChoice(3, gameState.currentTarget));
    addChoiceButton("4. Blend In", () => handleChoice(4, gameState.currentTarget));
    if (tools.boat) addChoiceButton(`5. Dispose at Sea ($${gameState.currentTarget.worth})`, () => handleChoice(5, gameState.currentTarget));
    if (tools.machete > 0) addChoiceButton("6. Slash with Machete", () => handleChoice(6, gameState.currentTarget));
    if (tools.garrote > 0) addChoiceButton("7. Strangle with Garrote", () => handleChoice(7, gameState.currentTarget));
    if (tools.syringe > 0) addChoiceButton("8. Inject Lethally", () => handleChoice(8, gameState.currentTarget));
    if (tools.shovel > 0) addChoiceButton("Bury Evidence", () => handleChoice(9, gameState.currentTarget));
    addChoiceButton("Forge Cover", () => handleChoice(10, gameState.currentTarget));
    addChoiceButton("Analyze Target", () => handleChoice(11, gameState.currentTarget));
    if (suspicion > 75 && escapes > 0) addChoiceButton("Plan Escape", () => handleChoice(12, gameState.currentTarget));
    addChoiceButton("Study Slides", () => handleChoice(13, gameState.currentTarget));
    addChoiceButton("Plant Evidence", () => handleChoice(14, gameState.currentTarget));
    if (tools.lockpick > 0) addChoiceButton("Break into Hideout", () => handleChoice(15, gameState.currentTarget));
    if (tools.tape > 0) addChoiceButton("Bind Target", () => handleChoice(16, gameState.currentTarget));
    addChoiceButton("Scout Perimeter", () => handleChoice(17, gameState.currentTarget));
    addChoiceButton("Fake Metro Call", () => handleChoice(18, gameState.currentTarget));
    if (gameState.inGame) addChoiceButton("Mod Menu", showModMenu);
    addChoiceButton("Black Market", () => showBlackMarket(gameState.currentTarget));

    if (Math.random() < 0.05) await handleFlashback();
    if (Math.random() < 0.15 && modSettings.darkPassenger) await handleDarkPassenger();
    if (Math.random() < locations[currentLocation].metroPresence) await handleMetroPursuit();
}

async function showBlackMarket(target) {
    clearChoices();
    await displayText("<br>Black Market - Miami’s underbelly:");
    for (let item in blackMarket) {
        const { cost, profit, condition } = blackMarket[item];
        const price = cost ? Math.floor(cost * (0.8 + Math.random() * 0.4)) : (profit ? profit() : 0);
        if (condition && condition()) addChoiceButton(`${item} (+$${price})`, () => handleBlackMarket(item, target, price));
        else if (!condition && (!tools[item] || !accomplice || item === "Pills" || item === "New Plates")) addChoiceButton(`${item} (-$${price})`, () => handleBlackMarket(item, target, price));
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
        if (Math.random() > 0.8) { await displayText("Word spreads."); suspicion += (modSettings.stealthMode ? 5 : 10) * difficulty.suspicionRate; urges += 10; }
    } else if (cash >= price || modSettings.infiniteCash) {
        if (!modSettings.infiniteCash) cash -= price;
        action();
        await displayText(`Acquired ${item} for $${price}.`);
    } else await displayText("Not enough cash.");
    showBlackMarket(target);
}

async function handleChoice(choice, target) {
    clearChoices();
    let suspicionMultiplier = (modSettings.noSuspicion ? 0 : (modSettings.stealthMode ? 0.5 : 1)) * locations[currentLocation].suspicionMod * (weatherEffects[weather].suspicionMod || 1) * (cover < 25 ? 2 : 1) * (media > 75 ? 1.5 : 1);
    let façadeMultiplier = locations[currentLocation].façadeDrain * (weatherEffects[weather].façadeMod || 1) * (sanity < 25 ? 2 : 1);
    let cashMultiplier = locations[currentLocation].cashMod;
    let urgeMultiplier = (weatherEffects[weather].urgeMod || 1) * (urges > 75 ? 1.5 : 1);
    const isNight = turn % 2 === 0;
    let resisted = façade < target.trustThreshold && Math.random() < target.resistChance;

    if (choice === 1 && tools.slides > 0) {
        tools.slides--; façade -= 5 * façadeMultiplier; cash += 50 * cashMultiplier; suspicion += Math.floor(Math.random() * 5 * difficulty.suspicionRate * suspicionMultiplier); urges += 5 * urgeMultiplier;
        if (resisted) { await displayText("He smells a trap!"); suspicion += 15; urges += 10; } else await displayText("The ritual’s set. He’s mine.");
    } else if (choice === 2 && tools.plastic > 0) {
        tools.plastic--; addKillFlash(target.name);
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier * (gameState.method === "Ritualist" ? 1.5 : 1); 
        suspicion += (target.risk ? 30 : 15) * difficulty.suspicionRate * suspicionMultiplier * (gameState.method === "Ritualist" ? 0.9 : 1);
        sanity -= 10; media += target.risk ? 15 : 5; cover -= 10; urges += 15 * urgeMultiplier;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide for the collection."); }
        if (target.trait === "Sloppy") suspicion -= 5;
        neutralizedTargets.push(target.name);
        await displayText(`Wrapped and ended. $${target.worth} from ${target.name}.`);
    } else if (choice === 3 && tools.sedative > 0) {
        tools.sedative--; façade -= 8 * façadeMultiplier; suspicion += Math.floor(Math.random() * 10 * difficulty.suspicionRate * suspicionMultiplier); urges += 10 * urgeMultiplier;
        if (resisted && target.name !== "Witness") { await displayText("He shakes it off!"); suspicion += 10; } else { 
            score += 1; cash += target.worth * cashMultiplier; sanity -= 5; media += 5; cover -= 5; 
            neutralizedTargets.push(target.name);
            await displayText(`Sedated and gone. $${target.worth} taken.`); 
        }
    } else if (choice === 4) {
        façade += (isNight ? 10 : 20) * (weather === "Clear" ? 1.2 : 1) * (gameState.method === "Phantom" ? 1.5 : 1); 
        suspicion += Math.floor(Math.random() * 5 * difficulty.suspicionRate * suspicionMultiplier * (isNight ? 0.5 : 1));
        cash += gameState.method === "Phantom" ? 20 : 0;
        urges -= 5;
        await displayText("I’m just another face. Safe.");
    } else if (choice === 5 && tools.boat) {
        addKillFlash(target.name);
        score += 1; façade -= 15 * façadeMultiplier; cash += target.worth * cashMultiplier; suspicion += (target.risk ? 40 : 20) * difficulty.suspicionRate * suspicionMultiplier * (weather === "Hurricane" || tools.flashlight > 0 ? 0 : 1);
        sanity -= 15; media += target.risk ? 20 : 10; cover -= 15; urges += 20 * urgeMultiplier;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        if (tools.flashlight > 0 && isNight) { tools.flashlight--; await displayText("Flashlight aids the drop."); suspicion -= 5; }
        if (target.trait === "Suspicious") suspicion += 10;
        neutralizedTargets.push(target.name);
        await displayText(`${target.name} sinks to the depths. $${target.worth} gained.`);
    } else if (choice === 6 && tools.machete > 0) {
        tools.machete--; addKillFlash(target.name);
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 35 : 20) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= 12; media += target.risk ? 18 : 8; cover -= 12; urges += 18 * urgeMultiplier;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        neutralizedTargets.push(target.name);
        await displayText(`Hacked apart. $${target.worth} from ${target.name}.`);
    } else if (choice === 7 && tools.garrote > 0) {
        tools.garrote--; addKillFlash(target.name);
        score += 1; façade -= 8 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 30 : 15) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= 10; media += target.risk ? 15 : 5; cover -= 10; urges += 15 * urgeMultiplier;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        neutralizedTargets.push(target.name);
        await displayText(`Choked out. $${target.worth} from ${target.name}.`);
    } else if (choice === 8 && tools.syringe > 0) {
        tools.syringe--; addKillFlash(target.name);
        score += 1; façade -= 12 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 40 : 25) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= 15; media += target.risk ? 20 : 10; cover -= 15; urges += 20 * urgeMultiplier;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        neutralizedTargets.push(target.name);
        await displayText(`Injected and done. $${target.worth} from ${target.name}.`);
    } else if (choice === 9 && tools.shovel > 0) {
        tools.shovel--; suspicion = Math.max(0, suspicion - (gameState.method === "Hunter" ? 40 : 20)); façade -= 5 * façadeMultiplier; cover += 20; urges += 5 * urgeMultiplier;
        if (accomplice && accomplice.type === "Cleaner") suspicion = 0;
        await displayText("Buried deep. No trace.");
    } else if (choice === 10) {
        cover += 20; cash -= 50; suspicion += 5 * difficulty.suspicionRate * suspicionMultiplier; urges -= 10;
        await displayText("Cover crafted. Cost me $50.");
    } else if (choice === 11 && façade > 50) {
        façade -= 10; urges += 5 * urgeMultiplier;
        await displayText(`Forensics reveal: ${target.trait} - ${target.trait === "Armed" ? "Riskier" : target.trait === "Connected" ? "Evidence" : "Nothing"}`);
        if (target.trait === "Armed") suspicion += 10;
        else if (target.trait === "Connected") { slides++; suspicion += 10; }
        else if (target.trait === "Desperate") cash += 100 * cashMultiplier;
    } else if (choice === 12 && escapes > 0) {
        escapes--; suspicion = 0; cash -= 300; urges += 20 * urgeMultiplier;
        await displayText("Escape planned. $300 spent."); showScene(null); return;
    } else if (choice === 13 && slides > 0) {
        façade += 10; suspicion += 5 * difficulty.suspicionRate * suspicionMultiplier; sanity -= 5; urges += 5 * urgeMultiplier;
        await displayText("Slides calm me. A moment’s peace.");
    } else if (choice === 14) {
        media += 20; suspicion += 10 * difficulty.suspicionRate * suspicionMultiplier; urges += 10 * urgeMultiplier;
        await displayText("Evidence planted. Metro’s distracted.");
    } else if (choice === 15 && tools.lockpick > 0) {
        tools.lockpick--; suspicion += 10 * difficulty.suspicionRate * suspicionMultiplier; cash += 100 * cashMultiplier; urges += 15 * urgeMultiplier;
        if (Math.random() < 0.3) { await displayText("Alarm trips!"); suspicion += 20; } else await displayText("Hideout breached. $100 taken.");
    } else if (choice === 16 && tools.tape > 0) {
        tools.tape--; façade -= 10 * façadeMultiplier; suspicion += 5 * difficulty.suspicionRate * suspicionMultiplier; urges += 10 * urgeMultiplier;
        if (!resisted) { 
            score += 1; cash += target.worth * cashMultiplier; sanity -= 10; media += 10; cover -= 10; 
            neutralizedTargets.push(target.name);
            await displayText(`Bound and ended. $${target.worth} gained.`); 
        } else await displayText("He slips free!");
    } else if (choice === 17) {
        suspicion -= 5; façade -= 5 * façadeMultiplier; urges -= 10;
        await displayText("Perimeter secure. I’m in control.");
    } else if (choice === 18) {
        façade += 15 * (gameState.method === "Phantom" ? 1.5 : 1); suspicion += 10 * difficulty.suspicionRate * suspicionMultiplier; urges += 10 * urgeMultiplier;
        if (Math.random() < 0.4) { await displayText("Metro buys it—distraction works."); } else { await displayText("They’re not fooled."); suspicion += 10; }
    } else await displayText("No tools, no move.");

    applyModifiers();
    if ([2, 3, 5, 6, 7, 8, 16].includes(choice) && !resisted) {
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
    if (accomplice) {
        accomplice.turns--;
        if (accomplice.type === "Lookout") suspicion = Math.max(0, suspicion - 20);
        if (accomplice.type === "Distraction") façade += 30;
        if (accomplice.turns <= 0 || Math.random() < 0.1) { await displayText(`${accomplice.type} turns on me!`); suspicion += 50; urges += 20; accomplice = null; }
    }
    if (tools.disguise) {
        tools.disguise.turns--;
        if (tools.disguise.turns <= 0) tools.disguise = null;
        else {
            if (tools.disguise.type === "Cop" && gameState.currentTarget.name === "Corrupt Cop") { façade += 20; suspicion -= 10; }
            if (tools.disguise.type === "Worker") suspicion *= 0.5;
            if (tools.disguise.type === "Tourist") cash += 50;
        }
    }
    if (slides >= 5) { suspicion += 20; sanity -= 5; }
    if (streak >= 3) { cash += 100; await displayText("Streak bonus: +$100"); }
    if (streak >= 5) { closeCalls++; await displayText("Streak bonus: +1 Close Call"); }
    if (streak >= 7) { suspicion = 0; await displayText("Streak bonus: Suspicion reset"); streak = 0; }
    if (urges > 90 && Math.random() < 0.3) { await displayText("Urges surge—I falter!"); façade -= 10; suspicion += 10; }
    façade = Math.max(0, Math.min(100, façade));
    sanity = Math.max(0, Math.min(100, sanity));
    cover = Math.max(0, Math.min(100, cover));
    media = Math.max(0, Math.min(100, media));
    urges = Math.max(0, Math.min(100, urges));
}

async function checkGameState(killed = false) {
    if (suspicion >= 100) {
        if (closeCalls > 0) {
            await displayText("<br>Metro’s on me—too close! A narrow dodge."); closeCalls--; suspicion = 50; urges += 20; showScene(null);
        } else if (tools.badge > 0) {
            await displayText("<br>Badge buys time. Metro backs off."); tools.badge--; suspicion = 30; urges -= 10; showScene(null);
        } else await handleCourtroom();
    } else if (façade <= 0 && !difficulty.survivalTurns) {
        if (closeCalls > 0) {
            await displayText("<br>Façade cracks—I’m exposed! A close call saves me."); closeCalls--; façade = 50; urges += 10; showScene(null);
        } else {
            await displayText("<br>Façade’s gone. They see me."); await displayText("<span class='warning'>Unmasked!</span>"); playAgain();
        }
    } else if (sanity <= 0) {
        await displayText("<br>The Passenger takes over. I’m lost."); await displayText("<span class='warning'>Broken!</span>"); playAgain();
    } else if (urges >= 100) {
        await displayText("<br>The need consumes me—I slip!"); await displayText("<span class='warning'>Caught in Chaos!</span>"); playAgain();
    } else if (score >= (difficulty.survivalTurns || difficulty.killsToWin)) {
        await displayText(difficulty.survivalTurns ? "<br>I’ve outrun them." : "<br>The Code’s complete.");
        await displayText(`Faded with $${cash}.`, 500); await displayText("<span class='stat-bar'>You Win!</span>"); playAgain();
    } else {
        if (Math.random() > 0.9) { await displayText("Forensic gig pays: +$50."); cash += 50; }
        showScene(killed ? null : gameState.currentTarget);
    }
}

async function handleMetroPursuit() {
    clearChoices();
    await displayText("<br>Sirens cut the night—Metro’s near!");
    urges += 15;
    addChoiceButton("Flee", async () => { façade -= 20; suspicion -= 10; urges += 10; await displayText("I slip away."); showScene(null); });
    addChoiceButton("Hide", async () => { if (tools.shovel > 0 || tools.boat) { if (Math.random() < 0.7) { await displayText("I’m gone."); suspicion -= 20; urges -= 5; } else { await displayText("They see me!"); suspicion += 20; urges += 10; } } else await displayText("No escape!"); showScene(null); });
    addChoiceButton("Talk It Out", async () => { if (façade > 50 && Math.random() < 0.5) { await displayText("Forensic charm works."); suspicion = 0; urges -= 10; } else { await displayText("Doakes doesn’t buy it."); suspicion += 30; urges += 15; } showScene(null); });
}

async function handleFlashback() {
    clearChoices();
    await displayText("<br>Memory strikes—Little Havana, 2006.");
    await displayText("Two targets: Drug Dealer and Smuggler.");
    urges += 10;
    addChoiceButton("Take Both", async () => {
        suspicion += 60; cash += 410; score += 2; sanity -= 20; media += 30; cover -= 20; urges += 20; slides += Math.random() < 0.5 ? 1 : 0;
        neutralizedTargets.push("Drug Dealer", "Smuggler");
        await displayText("Both cleansed. $410 gained."); urges++; if (urges >= 3) await displayText("Legend Mode Unlocked!");
        showScene(null);
    });
    addChoiceButton("Pass", () => showScene(gameState.currentTarget));
}

async function handleDarkPassenger() {
    const thoughts = [
        { text: "They deserve it.", façade: 10, suspicion: 5, urges: -5 },
        { text: "I’m the perfect monster.", score: 1, suspicion: 20, urges: 10 },
        { text: "What if Deb finds out?", façade: -20, suspicion: -10, urges: 15 }
    ];
    const thought = getRandomItem(thoughts);
    await displayText(`<br>Passenger whispers: "${thought.text}"`);
    façade += thought.façade || 0; suspicion += thought.suspicion || 0; score += thought.score || 0; urges += thought.urges || 0;
}

async function handleCourtroom() {
    clearChoices();
    await displayText("<br>Metro hauls me in. Trial looms.");
    urges += 20;
    addChoiceButton("Charm Jury", async () => {
        if (façade > 70 && Math.random() < 0.6) { await displayText("Jury buys it. I’m free."); suspicion = 30; urges -= 15; showScene(null); } else { await displayText("Guilty. <span class='warning'>Caught!</span>"); playAgain(); }
    });
    addChoiceButton("Bribe", async () => {
        if (cash >= 500) { cash -= 500; if (Math.random() < 0.8) { await displayText("Cash works. I slip out."); suspicion = 30; urges -= 10; showScene(null); } else { await displayText("Bribe fails. <span class='warning'>Caught!</span>"); playAgain(); } } else await displayText("No funds."); playAgain();
    });
    addChoiceButton("Flee", async () => {
        if (Math.random() < 0.5) { await displayText("I break free—on the run."); suspicion = 50; urges += 20; tools = { slides: 0, plastic: 0, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0 }; showScene(null); } else { await displayText("Caught again. <span class='warning'>Done!</span>"); playAgain(); }
    });
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