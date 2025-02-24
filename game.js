const output = document.getElementById('output');
const choicesDiv = document.getElementById('choices');
let score = 0, suspicion = 0, façade = 100, cash = 200, closeCalls = 0, cover = 50, sanity = 100, media = 0, streak = 0, escapes = 2, slides = 0, urges = 0, metroHeat = 0, debSuspicion = 0;
let tools = { slides: 1, plastic: 2, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0, hammer: 0 };
let difficulty = null, turn = 0, currentLocation = "Miami Suburbs", weather = "Clear", accomplice = null, endgameTurns = 0;
let modSettings = { infiniteCash: false, noSuspicion: false, maxTools: false, stealthMode: false, extraLives: 0, darkPassenger: true, killEffects: true };
let gameState = { currentTarget: null, inGame: false, method: null, wonOnce: false, endgameActive: false };
let methodChosen = false;
let neutralizedTargets = [];

const difficulties = {
    "Easy": { cash: 500, slides: 2, plastic: 3, suspicionRate: 0.5, façadeDrain: 0.5, killsToWin: 5, intro: "Miami’s filth trusts me. The Code guides." },
    "Normal": { cash: 200, slides: 1, plastic: 2, suspicionRate: 1, façadeDrain: 1, killsToWin: 7, intro: "Metro’s watching. I’m still invisible." },
    "Hard": { cash: 100, slides: 1, plastic: 1, suspicionRate: 1.5, façadeDrain: 1.5, killsToWin: 10, intro: "Doakes is close. Precision’s my shield." }
};

// ... (previous code unchanged up to targets definition)

const targets = [
    // Original Targets
    { name: "Drug Dealer", profile: "Cocky, armed, street corner", worth: 200, trait: null, resistChance: 0.3, trustThreshold: 60, isRival: false },
    { name: "Human Trafficker", profile: "Sly, paranoid, warehouse", worth: 250, trait: null, resistChance: 0.4, trustThreshold: 50, isRival: false },
    { name: "Serial Rapist", profile: "Arrogant, prowling bars", worth: 180, trait: null, resistChance: 0.35, trustThreshold: 55, isRival: false },
    { name: "Corrupt Cop", profile: "Greedy, badge as shield", worth: 300, risk: true, trait: null, resistChance: 0.5, trustThreshold: 40, isRival: false },
    { name: "Hitman", profile: "Cold, precise, hired gun", worth: 220, trait: null, resistChance: 0.45, trustThreshold: 45, isRival: false },
    { name: "Child Predator", profile: "Nervous, hiding in plain sight", worth: 190, trait: null, resistChance: 0.25, trustThreshold: 65, isRival: false },
    { name: "Gang Leader", profile: "Ruthless, crew nearby", worth: 400, risk: true, trait: null, resistChance: 0.3, trustThreshold: 60, isRival: false },
    { name: "Black Market Doc", profile: "Shady, surgical hands", worth: 230, trait: null, resistChance: 0.2, trustThreshold: 70, isRival: false },
    { name: "Witness", profile: "Scared, knows my face", worth: 350, risk: true, trait: null, resistChance: 0.4, trustThreshold: 50, isRival: false },
    { name: "Smuggler", profile: "Greasy, boat docked", worth: 210, trait: null, resistChance: 0.3, trustThreshold: 60, isRival: false },
    { name: "Arsonist", profile: "Twitchy, smells of gasoline", worth: 170, trait: null, resistChance: 0.35, trustThreshold: 55, isRival: false },
    { name: "Cult Enforcer", profile: "Fanatic, blade in hand", worth: 240, trait: null, resistChance: 0.25, trustThreshold: 65, isRival: false },
    // Original Rival Killer
    { name: "Trinity", profile: "Methodical, family man facade", worth: 600, trait: null, resistChance: 0.6, trustThreshold: 70, isRival: true },
    // Original Innocent
    { name: "Lost Tourist", profile: "Clueless, camera in hand", worth: 500, trait: null, resistChance: 0.1, trustThreshold: 80, isRival: false, isInnocent: true },
    // New Criminal Targets
    { name: "Loan Shark", profile: "Ruthless, preys on the desperate", worth: 260, trait: null, resistChance: 0.35, trustThreshold: 55, isRival: false },
    { name: "Poacher", profile: "Cruel, hunts in the Everglades", worth: 190, trait: null, resistChance: 0.3, trustThreshold: 60, isRival: false },
    { name: "Extortionist", profile: "Slick, squeezes small businesses", worth: 220, trait: null, resistChance: 0.4, trustThreshold: 50, isRival: false },
    { name: "Organ Harvester", profile: "Cold, operates in backrooms", worth: 280, risk: true, trait: null, resistChance: 0.45, trustThreshold: 45, isRival: false },
    { name: "Cult Leader", profile: "Charismatic, commands fanatics", worth: 370, risk: true, trait: null, resistChance: 0.5, trustThreshold: 40, isRival: false },
    { name: "Arms Dealer", profile: "Shady, supplies the streets", worth: 240, trait: null, resistChance: 0.35, trustThreshold: 55, isRival: false },
    { name: "Serial Burglar", profile: "Sneaky, leaves bodies behind", worth: 200, trait: null, resistChance: 0.25, trustThreshold: 65, isRival: false },
    { name: "Stalker", profile: "Obsessive, hunts his prey", worth: 180, trait: null, resistChance: 0.3, trustThreshold: 60, isRival: false },
    // New Rival Killers
    { name: "Ice Truck Killer", profile: "Chilling, leaves frozen clues", worth: 650, trait: null, resistChance: 0.65, trustThreshold: 75, isRival: true },
    { name: "Skinner", profile: "Brutal, peels his victims", worth: 620, trait: null, resistChance: 0.6, trustThreshold: 70, isRival: true },
    // New Innocent Targets
    { name: "Street Vendor", profile: "Friendly, sells late-night tacos", worth: 450, trait: null, resistChance: 0.15, trustThreshold: 75, isRival: false, isInnocent: true },
    { name: "Night Nurse", profile: "Kind, works the graveyard shift", worth: 480, trait: null, resistChance: 0.1, trustThreshold: 80, isRival: false, isInnocent: true }
];

// ... (rest of the code unchanged from the previous version)


const targetTraits = ["Armed", "Connected", "Sloppy", "Suspicious", "Desperate"];
const locations = {
    "Miami Suburbs": { suspicionMod: 1, cashMod: 1, façadeDrain: 1, metroPresence: 0.1 },
    "Downtown Miami": { suspicionMod: 1.2, cashMod: 1.5, façadeDrain: 1, metroPresence: 0.15 },
    "Everglades": { suspicionMod: 0.7, cashMod: 0.8, façadeDrain: 0.5, metroPresence: 0.05 }
};

const weatherEffects = { // Idea #6: Miami Weather Events
    "Rain": { suspicionMod: 0.9, façadeMod: 0.8, urgeMod: 1.1 },
    "Hurricane": { instantKill: true, suspicionMod: 1.4, urgeMod: 1.2 },
    "Heatwave": { suspicionMod: 1.1, façadeMod: 1, urgeMod: 1.2, cashMod: 1.2 },
    "Clear": { suspicionMod: 1, façadeMod: 1, urgeMod: 1 }
};

const blackMarket = { // Expanded with Ideas #4, #5, #6
    "Plastic Wrap": { cost: 50, action: () => tools.plastic++ },
    "Sedative": { cost: 150, action: () => tools.sedative++ },
    "Shovel": { cost: 80, action: () => tools.shovel++ },
    "Machete": { cost: 200, action: () => tools.machete++ },
    "Ritual Kit": { cost: 150, action: () => tools.ritualKit = (tools.ritualKit || 0) + 1 }, // Idea #4
    "Gang Bribe": { cost: 200, action: () => { accomplice = { type: "Gang", turns: 3 }; } }, // Idea #5
    "Disguise Kit": { cost: 250, action: () => { tools.disguise = { type: prompt("Choose: Cop, Worker, Tourist") || "Tourist", turns: 3 }; } }, // Idea #6
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
        if (gameState.wonOnce) addChoiceButton("Bay Harbor Butcher", startBayHarborMode); // Idea #10
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
        if (modSettings.maxTools) tools = { slides: 99, plastic: 99, boat: true, sedative: 99, shovel: 99, flashlight: 99, machete: 99, lockpick: 99, tape: 99, garrote: 99, syringe: 99, disguise: { type: "Tourist", turns: 3 }, badge: 1, hammer: 1, ritualKit: 99 }; 
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
        } else if (!condition) {
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
    score = 0; suspicion = 0; façade = 100; cash = difficulty.cash; closeCalls = 0; cover = 50; sanity = 100; media = 0; streak = 0; escapes = 2; slides = 0; urges = 0; metroHeat = 0; debSuspicion = 0;
    tools = { slides: difficulty.slides, plastic: 2, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0, hammer: 0, ritualKit: 0 };
    turn = 0; currentLocation = "Miami Suburbs"; accomplice = null; neutralizedTargets = []; endgameTurns = 0;
    gameState.inGame = true; gameState.endgameActive = false;
    output.innerHTML = '';
    await displayText("I’m Dexter Morgan—blood-splatter analyst, hunter of monsters.");
    await displayText(difficulty.intro, 1000);
    await displayText(`Cleanse ${difficulty.killsToWin} stains from Miami.`, 1000);
    showScene(null);
}

// Idea #10: Bay Harbor Butcher Mode
async function startBayHarborMode() {
    score = 0; suspicion = 50; façade = 100; cash = 150; closeCalls = 0; cover = 50; sanity = 100; media = 0; streak = 0; escapes = 2; slides = 0; urges = 0; metroHeat = 50; debSuspicion = 0;
    tools = { slides: 0, plastic: 2, boat: true, sedative: 0, shovel: 0, flashlight: 0, machete: 0, lockpick: 0, tape: 0, garrote: 0, syringe: 0, disguise: null, badge: 0, hammer: 0, ritualKit: 0 };
    turn = 0; currentLocation = "Miami Suburbs"; accomplice = null; neutralizedTargets = []; endgameTurns = 10;
    gameState.inGame = true; gameState.endgameActive = true;
    output.innerHTML = '';
    await displayText("<span class='endgame-text'>Bay Harbor Butcher: They’re hunting me. Survive 10 nights.</span>");
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
    const validTargets = availableTargets.filter(t => !locations[currentLocation].highRiskOnly || t.risk || t.isRival || t.isInnocent);
    if (validTargets.length === 0) {
        await displayText("No suitable targets here. Time to move.");
        await moveLocation();
        return;
    }
    // Idea #2: Code Challenges (10% chance for innocent), Idea #3: Rival Killers (5% chance)
    const roll = Math.random();
    let targetType = (roll < 0.05 && !gameState.endgameActive) ? "rival" : (roll < 0.15 && !gameState.endgameActive) ? "innocent" : "normal";
    gameState.currentTarget = targetType === "rival" ? { ...targets.find(t => t.name === "Trinity"), trait: getRandomItem(targetTraits) } :
                             targetType === "innocent" ? { ...targets.find(t => t.name === "Lost Tourist"), trait: getRandomItem(targetTraits) } :
                             { ...getRandomItem(validTargets), trait: getRandomItem(targetTraits) };
    const className = gameState.currentTarget.isRival ? "rival-target" : gameState.currentTarget.isInnocent ? "innocent-target" : "bloody-target";
    await displayText(`<br><span class="${className}">The Code finds: ${gameState.currentTarget.name} - ${gameState.currentTarget.profile} (${gameState.currentTarget.trait})</span>`);
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
    weather = Math.random() < 0.3 ? getRandomItem(["Rain", "Hurricane", "Heatwave", "Clear"]) : "Clear"; // Idea #6
    const isNight = turn % 2 === 0; // Idea #2: Nightly Phases
    if (turn % 5 === 0 && currentLocation !== "Keys") await moveLocation();

    await displayText(`<br>${gameState.endgameActive ? `Night ${turn}/${endgameTurns}` : `Cleanse ${score + 1}`} - ${currentLocation} - ${isNight ? "Night" : "Day"} - ${weather}`);
    await displayText(`<span class="stat-bar">Kills: ${score}/${difficulty?.killsToWin || 0} | Suspicion: ${suspicion}% | Façade: ${façade}% | Cash: $${cash} | Cover: ${cover}% | Sanity: ${sanity}% | Urges: ${urges}% | Metro Heat: ${metroHeat}% | Deb’s Suspicion: ${debSuspicion}% | Streak: ${streak} | Escapes: ${escapes} | Slides: ${slides}</span>`);
    await displayText(`Tools: Slides=${tools.slides}, Plastic=${tools.plastic}, Boat=${tools.boat ? 'Y' : 'N'}, Sedative=${tools.sedative}, Shovel=${tools.shovel}, Machete=${tools.machete}, Hammer=${tools.hammer}, RitualKit=${tools.ritualKit || 0}${tools.disguise ? `, Disguise=${tools.disguise.type} (${tools.disguise.turns})` : ''}`);
    if (suspicion > 75) await displayText(`<span class="warning">Metro’s sniffing around!</span>`);
    if (debSuspicion > 75) await displayText(`<span class="warning">Deb’s asking questions!</span>`);
    await displayText("<br>Act or fade:");

    // Choices based on Day/Night (Idea #2)
    if (isNight || tools.sedative > 0) {
        if (tools.plastic > 0) addChoiceButton("Wrap in Plastic", () => handleChoice(2, gameState.currentTarget));
        if (tools.boat) addChoiceButton(`Dispose at Sea ($${gameState.currentTarget.worth})`, () => handleChoice(5, gameState.currentTarget));
        if (tools.sedative > 0) addChoiceButton("Sedate", () => handleChoice(3, gameState.currentTarget));
        if (tools.machete > 0) addChoiceButton("Slash with Machete", () => handleChoice(6, gameState.currentTarget));
        if (tools.hammer > 0) addChoiceButton("Crush with Hammer", () => handleChoice(10, gameState.currentTarget));
    }
    addChoiceButton("Blend In", () => handleChoice(4, gameState.currentTarget));
    if (isNight) addChoiceButton("Hunt in Shadows", () => handleChoice(11, gameState.currentTarget));
    if (!isNight) addChoiceButton("Work Overtime", () => handleChoice(12, gameState.currentTarget));
    if (tools.shovel > 0) addChoiceButton("Bury Evidence", () => handleChoice(9, gameState.currentTarget));
    if (tools.slides > 0) addChoiceButton("Tamper with Evidence", () => handleChoice(13, gameState.currentTarget)); // Idea #1
    if (tools.slides >= 3 && tools.ritualKit > 0) addChoiceButton("Perform Ritual", () => handleChoice(14, gameState.currentTarget)); // Idea #4
    if (gameState.currentTarget.isInnocent) addChoiceButton("Let Go", () => handleChoice(15, gameState.currentTarget)); // Idea #2
    addChoiceButton("Contact Informant", () => handleChoice(16, gameState.currentTarget)); // Idea #5
    if (tools.disguise) addChoiceButton("Adjust Disguise", () => handleChoice(17, gameState.currentTarget)); // Idea #6
    if (escapes > 0 && (suspicion > 75 || gameState.endgameActive)) addChoiceButton("Plan Escape", () => handleChoice(18, gameState.currentTarget)); // Idea #10
    if (gameState.inGame) addChoiceButton("Mod Menu", showModMenu);
    addChoiceButton("Black Market", () => showBlackMarket(gameState.currentTarget));

    // Random Events
    if (Math.random() < 0.1) await handleDarkPassenger(); // Idea #3
    if (Math.random() < 0.1) await handleFlashback(); // Idea #7
    if (Math.random() < 0.15) await handlePersonaEvent(); // Idea #8
    if (Math.random() < locations[currentLocation].metroPresence || metroHeat > 50) await handleMetroPursuit(); // Idea #1
    if (debSuspicion > 75) await handleDebSuspicion(); // Idea #9
}

async function handleChoice(choice, target) {
    clearChoices();
    const isNight = turn % 2 === 0;
    let suspicionMultiplier = (modSettings.noSuspicion ? 0 : (modSettings.stealthMode ? 0.5 : 1)) * locations[currentLocation].suspicionMod * (weatherEffects[weather].suspicionMod || 1) * (cover < 25 ? 2 : 1) * (media > 75 ? 1.5 : 1) * (isNight ? 2 : 0.5);
    let façadeMultiplier = locations[currentLocation].façadeDrain * (weatherEffects[weather].façadeMod || 1) * (sanity < 25 ? 2 : 1) * (isNight ? 0.5 : 2);
    let cashMultiplier = locations[currentLocation].cashMod * (weatherEffects[weather].cashMod || 1);
    let urgeMultiplier = (weatherEffects[weather].urgeMod || 1) * (urges > 75 ? 1.5 : 1);
    let resisted = façade < target.trustThreshold && Math.random() < target.resistChance;

    if (choice === 2 && tools.plastic > 0) { // Wrap in Plastic
        tools.plastic--;
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier * (gameState.method === "Ritualist" ? 1.5 : 1); 
        suspicion += (target.risk ? 30 : 15) * difficulty.suspicionRate * suspicionMultiplier * (gameState.method === "Ritualist" ? 0.9 : 1);
        sanity -= target.isInnocent ? 30 : 10; media += target.risk ? 15 : 5; cover -= 10; urges += 15 * urgeMultiplier; metroHeat += target.isRival ? 20 : 10; debSuspicion += 5;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < (isNight ? 0.75 : 0.5)) { slides++; await displayText("A slide for the collection."); }
        if (target.isRival) { tools.hammer = 1; await displayText("Trinity’s hammer—mine now."); } // Idea #3
        neutralizedTargets.push(target.name);
        await displayText(`Wrapped and ended. $${target.worth} from ${target.name}.`);
    } else if (choice === 3 && tools.sedative > 0) { // Sedate
        tools.sedative--; façade -= 8 * façadeMultiplier; suspicion += Math.floor(Math.random() * 10 * difficulty.suspicionRate * suspicionMultiplier); urges += 10 * urgeMultiplier; metroHeat += 5; debSuspicion += 3;
        if (resisted && target.name !== "Witness") { 
            await displayText("He shakes it off!"); 
            suspicion += 10; 
            if (target.isRival) { media += 30; suspicion += 20; await displayText("Trinity escapes!"); target = null; } // Idea #3
        } else { 
            score += 1; cash += target.worth * cashMultiplier; sanity -= target.isInnocent ? 30 : 5; media += 5; cover -= 5; urges += 10; metroHeat += 5; debSuspicion += 5;
            if (façade > 80) streak++; else streak = 0;
            if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
            if (target.isRival) { tools.hammer = 1; await displayText("Trinity’s hammer—mine now."); } // Idea #3
            neutralizedTargets.push(target.name);
            await displayText(`Sedated and gone. $${target.worth} taken.`); 
        }
    } else if (choice === 4) { // Blend In
        façade += (isNight ? 10 : 20) * (gameState.method === "Phantom" ? 1.5 : 1); 
        suspicion += Math.floor(Math.random() * 5 * difficulty.suspicionRate * suspicionMultiplier);
        urges -= 5;
        await displayText("I’m just another face. Safe.");
    } else if (choice === 5 && tools.boat) { // Dispose at Sea
        score += 1; façade -= 15 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 40 : 20) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= target.isInnocent ? 30 : 15; media += target.risk ? 20 : 10; cover -= 15; urges += 20 * urgeMultiplier; metroHeat += target.isRival ? 25 : 15; debSuspicion += 5;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        if (target.isRival) { tools.hammer = 1; await displayText("Trinity’s hammer—mine now."); } // Idea #3
        neutralizedTargets.push(target.name);
        await displayText(`${target.name} sinks to the depths. $${target.worth} gained.`);
    } else if (choice === 6 && tools.machete > 0) { // Slash with Machete
        tools.machete--;
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 35 : 20) * difficulty.suspicionRate * suspicionMultiplier;
        sanity -= target.isInnocent ? 30 : 12; media += target.risk ? 18 : 8; cover -= 12; urges += 18 * urgeMultiplier; metroHeat += target.isRival ? 20 : 10; debSuspicion += 5;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        if (target.isRival) { tools.hammer = 1; await displayText("Trinity’s hammer—mine now."); } // Idea #3
        neutralizedTargets.push(target.name);
        await displayText(`Hacked apart. $${target.worth} from ${target.name}.`);
    } else if (choice === 9 && tools.shovel > 0) { // Bury Evidence
        tools.shovel--; suspicion = Math.max(0, suspicion - 20); façade -= 5 * façadeMultiplier; cover += 20; urges += 5 * urgeMultiplier; metroHeat -= 10;
        await displayText("Buried deep. No trace.");
    } else if (choice === 10 && tools.hammer > 0) { // Crush with Hammer (Idea #3 reward)
        tools.hammer--;
        score += 1; façade -= 10 * façadeMultiplier; cash += target.worth * cashMultiplier; 
        suspicion += (target.risk ? 35 : 20) * difficulty.suspicionRate * suspicionMultiplier + 10;
        sanity -= target.isInnocent ? 30 : 12; media += target.risk ? 18 : 8; cover -= 12; urges += 18 * urgeMultiplier; metroHeat += target.isRival ? 20 : 10; debSuspicion += 5;
        if (façade > 80) streak++; else streak = 0;
        if (Math.random() < 0.5) { slides++; await displayText("A slide claimed."); }
        neutralizedTargets.push(target.name);
        await displayText(`Crushed with hammer. $${target.worth} from ${target.name}.`);
    } else if (choice === 11 && isNight) { // Hunt in Shadows (Idea #2)
        await displayText("Shadows cloak my hunt.");
        tools.nextKillBonus = true; // Boosts next kill’s slide chance
    } else if (choice === 12 && !isNight) { // Work Overtime (Idea #2)
        cash += 50; urges += 10;
        await displayText("Overtime pays off. $50 earned.");
    } else if (choice === 13 && tools.slides > 0) { // Tamper with Evidence (Idea #1)
        tools.slides--; façade -= 10 * façadeMultiplier; suspicion -= 20; media -= 15; cover += 10;
        if (cover < 50 && Math.random() < 0.2) {
            await displayText("Masuka spots the tampering!");
            suspicion += 30; metroHeat += 20;
        } else {
            await displayText("Blood patterns misdirect Batista.");
        }
    } else if (choice === 14 && tools.slides >= 3 && tools.ritualKit > 0) { // Perform Ritual (Idea #4)
        tools.slides -= 3; tools.ritualKit--;
        if (Math.random() < (tools.ritualKit > 0 ? 0.05 : 0.1)) {
            await displayText("<span class='ritual-text'>Ritual backfires!</span>");
            sanity -= 15; urges += 25;
        } else {
            const ritualChoice = Math.random() < 0.5 ? "Cleanse" : "Invoke";
            if (ritualChoice === "Cleanse") {
                sanity += 30; urges -= 20;
                await displayText("<span class='ritual-text'>Mind cleansed by the blood.</span>");
            } else {
                tools.nextKillBonus = true; // Doubles cash and slides
                suspicion += 40;
                await displayText("<span class='ritual-text'>Passenger invoked—bloodlust rises.</span>");
            }
        }
    } else if (choice === 15 && target.isInnocent) { // Let Go (Idea #2)
        façade += 10; urges += 15;
        await displayText("I let them go. The Code holds.");
        target = null;
    } else if (choice === 16) { // Contact Informant (Idea #5)
        if (cash >= 100 || modSettings.infiniteCash) {
            if (!modSettings.infiniteCash) cash -= 100;
            cash += Math.floor(cashMultiplier * 50);
            await displayText(`Informant reveals: ${target.trait}`);
            if (Math.random() < 0.15) {
                await displayText("Informant talks!");
                suspicion += 20; metroHeat += 10;
            }
        } else {
            await displayText("Not enough cash for the informant.");
        }
    } else if (choice === 17 && tools.disguise) { // Adjust Disguise (Idea #6)
        façade += 15; suspicion -= 10;
        await displayText("Disguise tightened—perfect fit.");
    } else if (choice === 18 && escapes > 0) { // Plan Escape (Idea #10)
        escapes--; suspicion = 0; cash -= 300; urges += 20;
        await displayText("Escape planned. $300 gone.");
        showScene(null); return;
    }

    applyModifiers();
    if ([2, 3, 5, 6, 10].includes(choice) && !resisted) {
        await checkGameState(true);
    } else {
        await checkGameState(false);
    }
}

async function applyModifiers() { // Includes Idea #9: Kill Streak Bonuses and Idea #6: Disguises
    if (modSettings.noSuspicion) suspicion = 0;
    else suspicion = Math.min(100, Math.max(0, suspicion));
    if (modSettings.infiniteCash) cash = Infinity;
    if (modSettings.maxTools) tools = { slides: 99, plastic: 99, boat: true, sedative: 99, shovel: 99, flashlight: 99, machete: 99, lockpick: 99, tape: 99, garrote: 99, syringe: 99, disguise: { type: "Tourist", turns: 3 }, badge: 1, hammer: 1, ritualKit: 99 };
    if (accomplice) {
        accomplice.turns--;
        if (accomplice.type === "Gang") suspicion = Math.max(0, suspicion - 15); // Idea #5
        if (accomplice.turns <= 0) { await displayText("Gang cuts ties."); accomplice = null; }
    }
    if (tools.disguise) { // Idea #6
        tools.disguise.turns--;
        if (tools.disguise.type === "Cop") suspicion -= 20;
        if (tools.disguise.type === "Worker") cash += 50;
        if (tools.disguise.type === "Tourist") façade += 20;
        if (tools.disguise.turns <= 0) { await displayText("Disguise wears off."); tools.disguise = null; }
    }
    if (streak >= 3) { cash += 100; await displayText("Smooth Operator: +$100"); } // Idea #9
    if (streak >= 5) { closeCalls++; await displayText("Untouchable: +1 Close Call"); }
    if (streak >= 7) { suspicion = 0; façade += 30; streak = 0; await displayText("Legend’s Grace: Suspicion reset, Façade +30"); }
    façade = Math.max(0, Math.min(100, façade));
    sanity = Math.max(0, Math.min(100, sanity));
    cover = Math.max(0, Math.min(100, cover));
    media = Math.max(0, Math.min(100, media));
    urges = Math.max(0, Math.min(100, urges));
    metroHeat = Math.max(0, Math.min(100, metroHeat));
    debSuspicion = Math.max(0, Math.min(100, debSuspicion));
}

async function checkGameState(killed = false) {
    if (suspicion >= 100) {
        if (closeCalls > 0) {
            await displayText("<br>Metro closes in—A narrow dodge!");
            closeCalls--; suspicion = 50; urges += 20; showScene(null);
        } else {
            await displayText("<br>Metro’s on me—too close!");
            await displayText("<span class='warning'>Caught!</span>");
            playAgain();
        }
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
    } else if (score >= difficulty?.killsToWin && !gameState.endgameActive) { // Idea #10
        await handleEndgame();
    } else if (gameState.endgameActive && turn >= endgameTurns) {
        await displayText("<span class='endgame-text'>I’ve slipped their grasp. A legend fades.</span>");
        await displayText("Unlocked: Butcher’s Badge (Suspicion gain -25%)");
        tools.badge = 1; gameState.wonOnce = true;
        playAgain();
    } else {
        showScene(killed ? null : gameState.currentTarget);
    }
}

async function handleMetroPursuit() { // Idea #1: Miami Metro Investigations
    clearChoices();
    metroHeat += 10;
    if (metroHeat >= 75) await displayText("<span class='metro-alert'>Deb’s onto you!</span>");
    else if (metroHeat >= 50) await displayText("<span class='metro-alert'>Batista finds a clue!</span>");
    else await displayText("<span class='metro-alert'>Doakes is tailing you!</span>");
    urges += 10;
    addChoiceButton("Hide", async () => { 
        if (tools.shovel > 0 || tools.boat) { 
            if (Math.random() < 0.7) { await displayText("I vanish."); suspicion -= 20; metroHeat -= 15; } 
            else { await displayText("They spot me!"); suspicion += 20; metroHeat += 10; } 
        } else await displayText("No cover!"); 
        showScene(gameState.currentTarget); 
    });
    addChoiceButton("Talk It Out", async () => { 
        if (façade > 50 && Math.random() < 0.5) { await displayText("Smooth talk works."); suspicion = 0; metroHeat -= 20; } 
        else { await displayText("They don’t buy it."); suspicion += 30; urges += 15; } 
        showScene(gameState.currentTarget); 
    });
}

async function handleDarkPassenger() { // Idea #3: Dark Passenger Voices
    const thoughts = [
        { text: "You’re a god among men.", score: 1, suspicion: 20 },
        { text: "Cut deeper this time.", cashBoost: true, suspicion: 30 },
        { text: "They’ll never catch me.", façade: 20, urges: -10 }
    ];
    const thought = getRandomItem(thoughts);
    await displayText(`<span class="dark-voice">"${thought.text}"</span>`);
    score += thought.score || 0; suspicion += thought.suspicion || 0; façade += thought.façade || 0; urges += thought.urges || 0;
    if (thought.cashBoost) tools.nextKillBonus = true;
}

async function handleFlashback() { // Idea #7: Psychological Flashbacks
    const flashbacks = [
        { text: "Harry’s Lesson", façade: 20, urges: -15 },
        { text: "Brian’s Laugh", sanity: -20, suspicionReduction: true },
        { text: "Mom’s Death", urges: 30, cash: 100 }
    ];
    const flashback = getRandomItem(flashbacks);
    await displayText(`<span class="dark-voice">"${flashback.text}"</span>`);
    façade += flashback.façade || 0; sanity += flashback.sanity || 0; urges += flashback.urges || 0; cash += flashback.cash || 0;
    if (flashback.suspicionReduction) suspicion = Math.max(0, suspicion - 50);
}

async function handlePersonaEvent() { // Idea #8: Public Persona Events
    const events = [
        { text: "Deb’s Dinner Invite", accept: { façade: 15, cash: -20 }, decline: { urges: 10 } },
        { text: "Masuka’s Party", accept: { façade: 20, suspicion: 10 }, decline: { sanity: -5 } }
    ];
    const event = getRandomItem(events);
    await displayText(`<span class="persona-event">${event.text}</span>`);
    addChoiceButton("Accept", async () => {
        façade += event.accept.façade || 0; cash += event.accept.cash || 0; suspicion += event.accept.suspicion || 0;
        await displayText("I play along—for now.");
        showScene(gameState.currentTarget);
    });
    addChoiceButton("Decline", async () => {
        urges += event.decline.urges || 0; sanity += event.decline.sanity || 0;
        await displayText("I stay in the shadows.");
        showScene(gameState.currentTarget);
    });
}

async function handleDebSuspicion() { // Idea #9: Deb’s Suspicion
    clearChoices();
    await displayText("<span class='metro-alert'>Deb asks too many questions.</span>");
    addChoiceButton("Lie", async () => { façade -= 20; debSuspicion -= 15; await displayText("She buys it—for now."); showScene(gameState.currentTarget); });
    addChoiceButton("Distract", async () => { 
        if (cash >= 50) { cash -= 50; debSuspicion -= 25; await displayText("A distraction works."); } 
        else await displayText("No cash to sway her."); 
        showScene(gameState.currentTarget); 
    });
    addChoiceButton("Confess", async () => { 
        if (sanity > 80) { await displayText("She can’t believe it—I’m safe."); debSuspicion = 0; } 
        else { await displayText("<span class='warning'>She knows. It’s over.</span>"); playAgain(); } 
    });
}

async function handleEndgame() { // Idea #10: Endgame Scenarios
    gameState.endgameActive = true;
    endgameTurns = 3;
    suspicion = 70;
    const scenarios = ["Metro Raid", "FBI Hunt"];
    const scenario = getRandomItem(scenarios);
    await displayText(`<span class='endgame-text'>${scenario} begins!</span>`);
    if (scenario === "FBI Hunt") await displayText("Escape or keep Suspicion below 50!");
    showScene(null);
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