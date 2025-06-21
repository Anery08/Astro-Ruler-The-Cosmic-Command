// --- Game State Variables ---
let metrics = {
    morale: 50,
    integrity: 50,
    resources: 50,
    reputation: 50
};

let currentEventIndex = -1;
let eventHistory = []; // To keep track of past events and prevent immediate repeats
let lastPlayedMusic = null;
let sfxClick = new Audio('assets/sounds/click.mp3');
let sfxAlert = new Audio('assets/sounds/alert.mp3');
// Add more audio objects as needed:
// let sfxEventSpecific = new Audio('assets/sounds/event_specific.mp3');

// --- DOM Elements ---
const moraleBar = document.getElementById('morale-bar');
const integrityBar = document.getElementById('integrity-bar');
const resourceBar = document.getElementById('resource-bar');
const reputationBar = document.getElementById('reputation-bar');

const eventCard = document.getElementById('event-card');
const eventText = document.getElementById('event-text');
const choiceLeftButton = document.getElementById('choice-left');
const choiceRightButton = document.getElementById('choice-right');

const gameOverScreen = document.getElementById('game-over-screen');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');
const restartButton = document.getElementById('restart-button');

const backgroundMusic = document.getElementById('background-music');

// --- Game Configuration ---
const MIN_METRIC = 0;
const MAX_METRIC = 100;
const GAME_OVER_THRESHOLD = 5; // How close to 0 or 100 a metric needs to be to trigger game over
const MUSIC_VOLUME = 0.4;
const SFX_VOLUME = 0.8;

// --- Event Data (The Heart of the Game!) ---
// Structure:
// {
//     id: 'unique_event_id', // Optional, for specific chaining or tracking
//     text: 'Event description goes here.',
//     choices: {
//         left: {
//             text: 'Choice A text',
//             effects: { morale: 10, resources: -5 }, // Positive or negative changes
//             nextEvent: 'optional_next_event_id', // For narrative chains
//             condition: { metric: 'morale', operator: '>=', value: 30, failText: 'You lack the morale for this!' } // Optional condition
//         },
//         right: {
//             text: 'Choice B text',
//             effects: { integrity: -15, reputation: 5 },
//             nextEvent: null
//         }
//     },
//     specialCondition: {
//         type: 'random', // 'random', 'specificMetricRange', 'hasEventBeenPlayed'
//         details: {} // Specific details for the condition
//     },
//     tags: ['exploration', 'crew', 'diplomacy'], // For filtering or special logic
//     image: 'event_image.jpg', // Placeholder for future image integration
//     audio: 'event_specific_sound.mp3' // Placeholder for future audio integration
// }

// Game Events - Over 100 Unique Possibilities!
// I will start with a diverse set and then expand significantly.
// This is a *sample* to show the structure. I will generate a much larger list.

const gameEvents = [
    // --- Initial Events ---
    {
        id: 'start_mission',
        text: 'Welcome, Captain! The IEV Stardust Wanderer is ready. Our first objective: establish contact with the enigmatic Xylosian civilization. Their systems are primitive but rich in rare minerals. What are your orders?',
        choices: {
            left: {
                text: 'Attempt peaceful first contact.',
                effects: { morale: 5, reputation: 10, resources: -2 },
                nextEvent: 'xylosian_contact_success'
            },
            right: {
                text: 'Send a scout team to analyze their defenses and resources.',
                effects: { morale: -5, integrity: 5, reputation: -10, resources: 5 },
                nextEvent: 'xylosian_scout_report'
            }
        }
    },
    {
        id: 'xylosian_contact_success',
        text: 'The Xylosians greet us with open arms! They offer a trade agreement for unique alloys. What is your offer?',
        choices: {
            left: {
                text: 'Offer advanced replicator technology.',
                effects: { morale: 10, reputation: 15, resources: -10 }
            },
            right: {
                text: 'Demand a significant tribute for our technological superiority.',
                effects: { morale: -10, reputation: -20, resources: 20 }
            }
        },
        condition: {
            type: 'random_chance',
            chance: 0.7, // 70% chance of this event appearing if Xylosian contact is successful
            failText: 'Our initial probes indicate they are wary of outsiders.'
        }
    },
    {
        id: 'xylosian_scout_report',
        text: 'Our scout team reports weak defenses but a highly spiritual society. They also found a rare energy crystal deposit. What should be our next move?',
        choices: {
            left: {
                text: 'Extract the crystals by force.',
                effects: { morale: -15, integrity: -5, resources: 25, reputation: -30 }
            },
            right: {
                text: 'Attempt to negotiate for mining rights, offering our protection.',
                effects: { morale: 5, resources: -5, reputation: 10 }
            }
        }
    },

    // --- Crew Morale Events ---
    {
        text: 'A critical system malfunction has left the crew quarters without gravity for 24 hours. Morale is plummeting. How do you address it?',
        choices: {
            left: { text: 'Distribute extra ration packs and allow a day of rest.', effects: { morale: 15, resources: -5 } },
            right: { text: 'Order immediate repairs and strict adherence to duty.', effects: { morale: -10, integrity: 5 } }
        }
    },
    {
        text: 'A popular crew member is caught smuggling prohibited alien flora. What\'s their fate?',
        choices: {
            left: { text: 'Confiscate the flora and issue a warning.', effects: { morale: 5, reputation: -2 } },
            right: { text: 'Demote them and assign to waste processing.', effects: { morale: -5, integrity: -2 } }
        }
    },
    {
        text: 'The ship\'s synthetic chef has produced another batch of unappetizing nutrient paste. The mess hall is grumbling.',
        choices: {
            left: { text: 'Order the chef to be recalibrated with more diverse recipes.', effects: { morale: 10, resources: -3 } },
            right: { text: 'Remind the crew that sustenance is a privilege, not a gourmet experience.', effects: { morale: -8 } }
        }
    },
    {
        text: 'A group of engineers requests better access to recreational holodecks during downtime. Currently, usage is restricted.',
        choices: {
            left: { text: 'Grant wider access; crew welfare is paramount.', effects: { morale: 12, resources: -2 } },
            right: { text: 'Maintain current restrictions; focus on productivity.', effects: { morale: -7, integrity: 3 } }
        }
    },
    {
        text: 'During an anomaly scan, a crew member panicked and nearly compromised the mission. They are deeply remorseful.',
        choices: {
            left: { text: 'Offer counseling and re-training.', effects: { morale: 5, resources: -1 } },
            right: { text: 'Assign them to solitary maintenance duty.', effects: { morale: -5, integrity: -1 } }
        }
    },

    // --- Ship Integrity Events ---
    {
        text: 'Our long-range sensors detect an asteroid field directly in our path. Navigating it will be risky.',
        choices: {
            left: { text: 'Attempt to navigate slowly and carefully.', effects: { integrity: -10, resources: -5, morale: -2 } },
            right: { text: 'Engage emergency evasive maneuvers at full throttle.', effects: { integrity: -25, morale: -5, resources: -10 } }
        },
        condition: {
            type: 'specificMetricRange',
            metric: 'integrity',
            min: 20,
            max: 80,
            failText: 'Our ship cannot withstand such maneuvers!'
        }
    },
    {
        text: 'A mysterious energy signature is draining power from our shields. We need to act quickly!',
        choices: {
            left: { text: 'Reroute auxiliary power to boost shields, at the cost of life support.', effects: { integrity: 15, resources: -10, morale: -10 } },
            right: { text: 'Initiate an emergency FTL jump to escape the drain.', effects: { integrity: -5, resources: -20 } }
        }
    },
    {
        text: 'The primary warp core is showing minor fluctuations. A full diagnostic will take time and resources.',
        choices: {
            left: { text: 'Perform a full diagnostic and repair.', effects: { integrity: 10, resources: -10 } },
            right: { text: 'Monitor the fluctuations and continue the mission.', effects: { integrity: -15 } }
        }
    },
    {
        text: 'A critical component in the engine room has a hairline fracture. Ignoring it could lead to catastrophic failure.',
        choices: {
            left: { text: 'Initiate emergency repairs immediately, using rare materials.', effects: { integrity: 20, resources: -15 } },
            right: { text: 'Apply a temporary patch; we can fix it properly later.', effects: { integrity: -30 } }
        }
    },
    {
        text: 'We\'ve encountered a space anomaly that twists local spacetime. Our ship\'s hull is under immense stress.',
        choices: {
            left: { text: 'Activate structural integrity fields at maximum power.', effects: { integrity: 15, resources: -10 } },
            right: { text: 'Attempt to bypass the anomaly with risky maneuvers.', effects: { integrity: -25, morale: -5 } }
        }
    },

    // --- Resource Supply Events ---
    {
        text: 'We\'ve discovered a pristine gas giant with an abundance of rare atmospheric elements. Collecting them will require significant fuel.',
        choices: {
            left: { text: 'Initiate full collection protocols.', effects: { resources: 20, morale: 5, integrity: -5 } },
            right: { text: 'Collect only a small sample to conserve fuel.', effects: { resources: 5, integrity: -2 } }
        },
        condition: {
            type: 'specificMetricRange',
            metric: 'resources',
            min: 25,
            failText: 'We do not have enough fuel to even begin collection.'
        }
    },
    {
        text: 'Our life support systems are reporting lower-than-optimal oxygen levels. A crew member suggests rationing food to conserve energy.',
        choices: {
            left: { text: 'Implement strict food rationing.', effects: { morale: -10, resources: 10 } },
            right: { text: 'Increase oxygen production, draining more power from engines.', effects: { morale: 5, integrity: -5, resources: -5 } }
        }
    },
    {
        text: 'A merchant vessel hails us, offering a fantastic deal on supplies, but they require payment in rare minerals we possess.',
        choices: {
            left: { text: 'Accept the deal; our supplies are low.', effects: { resources: 25, reputation: 5, morale: 5 } },
            right: { text: 'Decline; we need those minerals for potential repairs.', effects: { resources: -5, integrity: 5 } }
        }
    },
    {
        text: 'We are running dangerously low on water. A derelict asteroid field might contain ice asteroids.',
        choices: {
            left: { text: 'Send out mining drones to search for ice.', effects: { resources: 15, integrity: -5, morale: -2 } },
            right: { text: 'Conserve water strictly, hoping for a better source soon.', effects: { resources: -10, morale: -10 } }
        }
    },
    {
        text: 'A sudden solar flare has disrupted our energy collectors, reducing our power output.',
        choices: {
            left: { text: 'Divert power from non-essential systems (e.g., recreational).', effects: { resources: 10, morale: -5 } },
            right: { text: 'Attempt to repair the collectors immediately, risking crew safety.', effects: { resources: 20, morale: -10, integrity: -5 } }
        }
    },

    // --- Galactic Reputation Events ---
    {
        text: 'A distress signal from a small, unarmed cargo ship. They are being pursued by unknown raiders.',
        choices: {
            left: { text: 'Engage the raiders and protect the cargo ship.', effects: { reputation: 20, integrity: -10, resources: -5 } },
            right: { text: 'Maintain stealth and observe. We cannot risk our mission.', effects: { reputation: -15, morale: -5 } }
        }
    },
    {
        text: 'We arrive at a neutral space station. Their customs officers demand a hefty "processing fee" to allow docking.',
        choices: {
            left: { text: 'Pay the fee; avoid unnecessary conflict.', effects: { reputation: 5, resources: -10 } },
            right: { text: 'Refuse and attempt to negotiate a lower price.', effects: { reputation: -10, morale: 2 } }
        }
    },
    {
        text: 'An ambassador from a powerful federation requests a diplomatic meeting on a sensitive inter-species dispute. They expect your support.',
        choices: {
            left: { text: 'Support the federation\'s stance.', effects: { reputation: 15, morale: -5 } },
            right: { text: 'Maintain neutrality, risking their displeasure.', effects: { reputation: -10, resources: -2 } }
        }
    },
    {
        text: 'Our sensors pick up a faint transmission: an ancient, uncontacted civilization sending out what appears to be a cry for help.',
        choices: {
            left: { text: 'Investigate and offer assistance.', effects: { reputation: 25, integrity: -10, resources: -5 } },
            right: { text: 'Ignore the signal; the Prime Directive forbids interference.', effects: { reputation: -5, morale: 5 } }
        }
    },
    {
        text: 'Word has spread of your past actions. A group of space pirates now considers you either a formidable foe or a potential ally.',
        choices: {
            left: { text: 'Send a message of defiance.', effects: { reputation: -10, integrity: -5, morale: 5 } },
            right: { text: 'Attempt to open diplomatic channels with them.', effects: { reputation: 10, resources: -10, morale: -5 } }
        }
    },

    // --- Complex / Chained Events (Example) ---
    {
        id: 'ancient_artifact_found',
        text: 'During a planetary survey, a strange, pulsating alien artifact is discovered. It radiates immense energy.',
        choices: {
            left: {
                text: 'Bring it aboard for study.',
                effects: { morale: 5, resources: -5 },
                nextEvent: 'artifact_study_result'
            },
            right: {
                text: 'Leave it untouched; too risky.',
                effects: { reputation: -5 }
            }
        }
    },
    {
        id: 'artifact_study_result',
        text: 'Our science team has analyzed the artifact. It\'s a power source, but unstable. It could power the ship indefinitely, or explode.',
        choices: {
            left: {
                text: 'Attempt to integrate it into the ship\'s power grid.',
                effects: { integrity: -30, resources: 50, morale: -10 },
                nextEvent: 'artifact_integration_outcome'
            },
            right: {
                text: 'Safely jettison the artifact into space.',
                effects: { reputation: -5, morale: 5 }
            }
        },
        condition: {
            type: 'hasEventBeenPlayed',
            eventID: 'ancient_artifact_found' // This event only appears if 'ancient_artifact_found' was played
        }
    },
    {
        id: 'artifact_integration_outcome',
        text: 'The artifact... it worked! For a moment. It provided immense power, then surged, causing damage. But the energy remains, fluctuating wildly.',
        choices: {
            left: {
                text: 'Try to stabilize the energy fluctuations.',
                effects: { integrity: 20, resources: 20, morale: -5 }
            },
            right: {
                text: 'Attempt to contain the energy in a separate module.',
                effects: { integrity: -15, reputation: -5, resources: 10 }
            }
        },
        condition: {
            type: 'hasEventBeenPlayed',
            eventID: 'artifact_study_result'
        }
    },

    // --- Random Encounters ---
    {
        text: 'A small, adorable alien creature has stowed away on board. It seems harmless, but is eating our emergency rations.',
        choices: {
            left: { text: 'Adopt it as a ship mascot.', effects: { morale: 10, resources: -5 } },
            right: { text: 'Eject it into space (humanely).', effects: { morale: -10, reputation: -2 } }
        }
    },
    {
        text: 'The ship\'s AI, "Orion," begins expressing philosophical doubts about its existence.',
        choices: {
            left: { text: 'Engage in a deep philosophical discussion.', effects: { morale: 5, resources: -1 } },
            right: { text: 'Reformat and reset Orion\'s core programming.', effects: { morale: -10, integrity: -5 } }
        }
    },
    {
        text: 'A mysterious signal leads you to a system with an uncharted planet. It appears to be a garden world, teeming with life.',
        choices: {
            left: { text: 'Land and explore for new resources/species.', effects: { resources: 10, morale: 5, integrity: -5 } },
            right: { text: 'Maintain course; stick to the mission parameters.', effects: { reputation: -2 } }
        }
    },
    {
        text: 'A space whale, enormous and majestic, drifts slowly past your viewscreen. It emits a low, resonant hum.',
        choices: {
            left: { text: 'Attempt to communicate with it.', effects: { morale: 10, reputation: 5 } },
            right: { text: 'Scan it for biological resources.', effects: { resources: 5, reputation: -10, morale: -5 } }
        },
        condition: {
            type: 'random_chance',
            chance: 0.5
        }
    },
    {
        text: 'A rogue black hole suddenly appears on long-range sensors, threatening to pull the ship off course.',
        choices: {
            left: { text: 'Engage maximum thrust to escape its pull.', effects: { resources: -15, integrity: -10 } },
            right: { text: 'Attempt to use its gravity well for a slingshot maneuver.', effects: { resources: -20, integrity: -20, reputation: 10 } }
        },
        condition: {
            type: 'specificMetricRange',
            metric: 'integrity',
            min: 30,
            failText: 'Our ship lacks the structural integrity to withstand the black hole\'s pull!'
        }
    },

    // --- Over 100 Unique Possibilities: I'll expand this list significantly below ---
    // (This is just a placeholder to indicate the massive expansion)
];

// --- More Events (Continuing the list to fulfill the >100 request) ---

// --- Crew Morale Events (Continued) ---
gameEvents.push(
    {
        text: 'The chief medical officer reports an outbreak of Space Flu among the junior crew. Contagion risk is high.',
        choices: {
            left: { text: 'Quarantine affected crew members strictly.', effects: { morale: -10, resources: -5 } },
            right: { text: 'Develop a vaccine, diverting medical resources.', effects: { morale: 15, resources: -10 } }
        }
    },
    {
        text: 'A senior officer is discovered to have a gambling addiction, losing significant credits and causing tension.',
        choices: {
            left: { text: 'Relieve them of duty and send them for rehabilitation.', effects: { morale: 5, reputation: -2 } },
            right: { text: 'Issue a severe warning and monitor their activities closely.', effects: { morale: -5 } }
        }
    },
    {
        text: 'The crew is getting restless from prolonged deep space travel. Recreational facilities are insufficient.',
        choices: {
            left: { text: 'Organize a ship-wide talent show and celebration.', effects: { morale: 15, resources: -3 } },
            right: { text: 'Order increased training drills to keep everyone focused.', effects: { morale: -10, integrity: 5 } }
        }
    },
    {
        text: 'A debate rages among the science team about the ethics of an experiment. It\'s causing division.',
        choices: {
            left: { text: 'Allow the experiment to proceed; scientific progress is key.', effects: { morale: -5, reputation: 5 } },
            right: { text: 'Order the experiment halted until ethical guidelines are clear.', effects: { morale: 10, reputation: -5 } }
        }
    },
    {
        text: 'A group of crew members is caught creating illegal synthetic alcohol in the cargo bay.',
        choices: {
            left: { text: 'Confiscate the stills and assign extra duties.', effects: { morale: -5 } },
            right: { text: 'Turn a blind eye; a little stress relief won\'t hurt.', effects: { morale: 8, resources: -1 } }
        }
    },
    {
        text: 'A crew member\'s pet, a small, furry space critter, has escaped and is causing minor mischief throughout the ship.',
        choices: {
            left: { text: 'Order a full search and capture of the creature.', effects: { morale: -3, integrity: -1 } },
            right: { text: 'Let it roam; it brings a little joy to the ship.', effects: { morale: 7, resources: -1 } }
        }
    },
    {
        text: 'A cultural festival is being celebrated by a significant portion of your crew. They request time off for observance.',
        choices: {
            left: { text: 'Grant time off; respect cultural traditions.', effects: { morale: 10 } },
            right: { text: 'Deny the request; mission comes first.', effects: { morale: -15 } }
        }
    },
    {
        text: 'Rumors are spreading about a ghost or spectral entity haunting deck 7. Crew members are nervous.',
        choices: {
            left: { text: 'Dispatch a security team to investigate and debunk the rumors.', effects: { morale: 5 } },
            right: { text: 'Declare deck 7 off-limits; avoid panic.', effects: { morale: -5, integrity: -2 } }
        }
    },
    {
        text: 'A heated argument breaks out in the mess hall over a trivial matter, threatening to escalate into a brawl.',
        choices: {
            left: { text: 'Intervene directly and mediate the dispute.', effects: { morale: 7 } },
            right: { text: 'Let them sort it out; internal conflicts build resilience.', effects: { morale: -8 } }
        }
    },
    {
        text: 'The ship\'s internal communications network goes down for several hours, isolating sections of the ship.',
        choices: {
            left: { text: 'Order immediate, priority repairs.', effects: { morale: -5, integrity: 5 } },
            right: { text: 'Wait for scheduled maintenance; minor inconvenience.', effects: { morale: -10 } }
        }
    },
    {
        text: 'A junior officer makes an impressive, innovative suggestion for resource efficiency.',
        choices: {
            left: { text: 'Implement their idea and commend them publicly.', effects: { morale: 10, resources: 5 } },
            right: { text: 'Acknowledge the idea but proceed with standard protocols.', effects: { morale: -2 } }
        }
    },
    {
        text: 'A highly skilled but eccentric engineer demands more personal freedom and less oversight.',
        choices: {
            left: { text: 'Grant them more autonomy, hoping for increased output.', effects: { morale: 7, integrity: -3 } },
            right: { text: 'Remind them of the chain of command.', effects: { morale: -5, integrity: 2 } }
        }
    },
    {
        text: 'The crew discovers a hidden stash of luxury synth-foods. Consuming them would deplete a valuable emergency supply.',
        choices: {
            left: { text: 'Allow the crew to enjoy the treat.', effects: { morale: 10, resources: -10 } },
            right: { text: 'Confiscate the stash for emergencies.', effects: { morale: -8 } }
        }
    },
    {
        text: 'A beloved old piece of ship equipment, "Old Rusty," finally breaks down beyond repair. It has sentimental value to the crew.',
        choices: {
            left: { text: 'Hold a small memorial service for Old Rusty.', effects: { morale: 5 } },
            right: { text: 'Scrap it for parts without ceremony.', effects: { morale: -5, resources: 3 } }
        }
    },
    {
        text: 'A crew member is caught attempting to bypass security protocols to access classified data. Their intentions are unclear.',
        choices: {
            left: { text: 'Arrest and interrogate the crew member.', effects: { morale: -7, integrity: 5 } },
            right: { text: 'Assign them to a remote, isolated post.', effects: { morale: -3, integrity: 2 } }
        }
    },
    {
        text: 'A surprising number of crew members are requesting to learn a new skill outside their primary duties (e.g., astrophysics for a medic).',
        choices: {
            left: { text: 'Allocate resources for skill development programs.', effects: { morale: 10, resources: -5 } },
            right: { text: 'Prioritize core duties; no time for hobbies.', effects: { morale: -8 } }
        }
    },
    {
        text: 'The ship\'s holographic entertainment system is glitching, displaying distorted and unsettling images.',
        choices: {
            left: { text: 'Order an immediate system reboot and repair.', effects: { morale: 5, integrity: -2 } },
            right: { text: 'Disable the system until further notice.', effects: { morale: -5 } }
        }
    },
    {
        text: 'A new game tournament is proposed by the recreation officer. It could boost morale but might distract from duties.',
        choices: {
            left: { text: 'Approve the tournament; healthy competition is good.', effects: { morale: 10 } },
            right: { text: 'Decline; maintain focus on the mission.', effects: { morale: -5 } }
        }
    },
    {
        text: 'A highly intelligent alien species offers to share their advanced recreational technology with your crew.',
        choices: {
            left: { text: 'Accept the offer; it could significantly boost morale.', effects: { morale: 15, reputation: 5 } },
            right: { text: 'Decline; too risky to introduce unknown alien tech.', effects: { morale: -5, reputation: -2 } }
        }
    },
    {
        text: 'A crew member expresses deep homesickness and wishes to return to Earth.',
        choices: {
            left: { text: 'Offer compassionate leave if possible.', effects: { morale: 5, resources: -5 } },
            right: { text: 'Remind them of their oath and duties.', effects: { morale: -7 } }
        }
    },
    {
        text: 'The ship\'s botanist discovers a new, bioluminescent plant species in the hydroponics bay. It\'s beautiful but highly allergenic to some.',
        choices: {
            left: { text: 'Allow it to grow; enhance ship aesthetics for most.', effects: { morale: 5 } },
            right: { text: 'Remove it to prevent allergic reactions.', effects: { morale: -2, resources: -1 } }
        }
    },
    {
        text: 'A long-lost family message arrives for a crew member. It contains distressing news from home.',
        choices: {
            left: { text: 'Grant them compassionate leave and support.', effects: { morale: 10, resources: -2 } },
            right: { text: 'Advise them to focus on their duties; compartmentalize.', effects: { morale: -8 } }
        }
    },
    {
        text: 'The ship\'s art curator proposes converting a rarely used cargo bay into a gallery for crew-created art.',
        choices: {
            left: { text: 'Approve the initiative; promote creativity.', effects: { morale: 10, resources: -2 } },
            right: { text: 'Decline; that space might be needed.', effects: { morale: -3 } }
        }
    },
    {
        text: 'A debate erupts over the ship\'s official mascot. Half the crew wants the "Space Ferret," the other half the "Cosmic Capybara."',
        choices: {
            left: { text: 'Hold a democratic vote.', effects: { morale: 5 } },
            right: { text: 'Choose one arbitrarily to end the debate.', effects: { morale: -5 } }
        }
    },
    {
        text: 'The engineering team is requesting new, experimental tools that could speed up repairs but are untested and expensive.',
        choices: {
            left: { text: 'Approve the purchase and training.', effects: { morale: 8, resources: -15, integrity: 5 } },
            right: { text: 'Stick to reliable, standard equipment.', effects: { morale: -3 } }
        }
    },

    // --- Ship Integrity Events (Continued) ---
    {
        text: 'A micrometeoroid swarm is detected. We can brace for impact or attempt minor evasions.',
        choices: {
            left: { text: 'Activate emergency shields and brace.', effects: { integrity: -5, resources: -2 } },
            right: { text: 'Attempt evasive maneuvers; higher risk, less resource drain.', effects: { integrity: -15, morale: -3 } }
        }
    },
    {
        text: 'The structural integrity field generator is showing signs of instability. A repair will take days.',
        choices: {
            left: { text: 'Perform immediate, full repairs.', effects: { integrity: 15, resources: -10, morale: -5 } },
            right: { text: 'Apply a temporary patch; monitor closely.', effects: { integrity: -20, morale: 5 } }
        }
    },
    {
        text: 'A critical coolant line has ruptured in engineering. Overheating is a risk.',
        choices: {
            left: { text: 'Initiate emergency shutdown of affected systems.', effects: { integrity: 10, resources: -5, morale: -5 } },
            right: { text: 'Attempt a daring on-the-fly repair with crew exposure.', effects: { integrity: 20, morale: -10 } }
        }
    },
    {
        text: 'Our ship\'s cloaking device is malfunctioning, making us visible to hostile entities.',
        choices: {
            left: { text: 'Prioritize cloaking repairs, diverting power from shields.', effects: { integrity: -5, reputation: 5 } },
            right: { text: 'Proceed without cloaking, relying on speed and shields.', effects: { integrity: 10, reputation: -10 } }
        }
    },
    {
        text: 'The ship\'s artificial gravity system is sputtering. Crew are reporting nausea and disorientation.',
        choices: {
            left: { text: 'Initiate a full system reboot and recalibration.', effects: { integrity: 10, morale: -5 } },
            right: { text: 'Power down the system temporarily; use magnetic boots.', effects: { integrity: -5, morale: -10 } }
        }
    },
    {
        text: 'A dangerous cosmic radiation storm is approaching. We can enter it, or take a long detour.',
        choices: {
            left: { text: 'Enter the storm; risk ship damage for speed.', effects: { integrity: -25, morale: -10 } },
            right: { text: 'Take the long detour; consume more resources.', effects: { resources: -15, morale: 5 } }
        }
    },
    {
        text: 'A strange parasitic alien organism has attached itself to the hull, slowly eating away at the plating.',
        choices: {
            left: { text: 'Dispatch an EVA team to remove it.', effects: { integrity: 15, morale: -5 } },
            right: { text: 'Attempt to dislodge it with weapon fire.', effects: { integrity: 10, resources: -5 } }
        }
    },
    {
        text: 'The ship\'s long-range sensors are failing. Navigation is becoming increasingly difficult and dangerous.',
        choices: {
            left: { text: 'Divert power to sensor repairs; slow down mission.', effects: { integrity: 10, resources: -5, morale: -2 } },
            right: { text: 'Proceed with visual navigation only; faster but riskier.', effects: { integrity: -15, morale: -5 } }
        }
    },
    {
        text: 'A sudden unexpected warp bubble collapse threatens to tear the ship apart.',
        choices: {
            left: { text: 'Engage emergency warp core stabilizers.', effects: { integrity: 20, resources: -15 } },
            right: { text: 'Prepare for immediate evacuation pods deployment.', effects: { morale: -20, integrity: -40 } }
        }
    },
    {
        text: 'A critical circuit board in the bridge is sparking. It could lead to a major power outage.',
        choices: {
            left: { text: 'Replace it immediately, risking a temporary power surge.', effects: { integrity: 10, resources: -5 } },
            right: { text: 'Apply fire retardant and monitor; avoid system disruption.', effects: { integrity: -10, morale: -2 } }
        }
    },
    {
        text: 'The primary deflector dish is misaligned after a minor impact. It will reduce shield effectiveness.',
        choices: {
            left: { text: 'Initiate a spacewalk to realign the dish.', effects: { integrity: 10, morale: -5 } },
            right: { text: 'Compensate with increased shield power.', effects: { integrity: 5, resources: -8 } }
        }
    },
    {
        text: 'A section of the ship\'s outer hull has sustained minor, non-critical damage from space debris.',
        choices: {
            left: { text: 'Conduct full repairs at the next opportunity.', effects: { integrity: 5, resources: -3 } },
            right: { text: 'Deem it cosmetic and ignore for now.', effects: { integrity: -5, morale: -1 } }
        }
    },
    {
        text: 'The ship\'s internal security systems are reporting several minor breaches. Could be a saboteur, or just glitches.',
        choices: {
            left: { text: 'Initiate a ship-wide security lockdown and sweep.', effects: { integrity: 10, morale: -5 } },
            right: { text: 'Increase automated patrols; avoid disrupting the crew.', effects: { integrity: -5, morale: 2 } }
        }
    },
    {
        text: 'A mysterious shimmering field envelops the ship, causing minor system failures and strange sensor readings.',
        choices: {
            left: { text: 'Attempt to analyze and understand the field.', effects: { integrity: -10, resources: -5, reputation: 5 } },
            right: { text: 'Engage emergency thrusters to break free.', effects: { integrity: -15, resources: -10 } }
        }
    },
    {
        text: 'The ship\'s auxiliary power conduits are overloaded. A cascade failure is possible.',
        choices: {
            left: { text: 'Shunt power to backup systems, risking temporary blackouts.', effects: { integrity: 10, morale: -5 } },
            right: { text: 'Attempt to repair under live load, highly dangerous.', effects: { integrity: 20, morale: -15 } }
        }
    },
    {
        text: 'Your primary weapon systems are offline after a power surge. We are vulnerable.',
        choices: {
            left: { text: 'Prioritize weapon system repairs, diverting engineers from other tasks.', effects: { integrity: 15, morale: -5 } },
            right: { text: 'Focus on evasion and stealth until repairs can be made later.', effects: { integrity: -10, reputation: -5 } }
        }
    },
    {
        text: 'The ship\'s inertial dampeners are malfunctioning. Movement within the ship is rough and causes minor injuries.',
        choices: {
            left: { text: 'Attempt emergency repairs, slowing down travel.', effects: { integrity: 10, resources: -5 } },
            right: { text: 'Issue warning and proceed; crew can adapt.', effects: { integrity: -5, morale: -10 } }
        }
    },
    {
        text: 'A section of the ship\'s hull experiences a sudden pressure drop. A breach is imminent.',
        choices: {
            left: { text: 'Seal off the affected section immediately.', effects: { integrity: 10, morale: -5 } },
            right: { text: 'Attempt to pressurize it from within; risky.', effects: { integrity: -20, morale: -10 } }
        }
    },
    {
        text: 'The automated repair drones are malfunctioning, repairing non-critical areas instead of damaged ones.',
        choices: {
            left: { text: 'Override manual control and direct repairs.', effects: { integrity: 5, resources: -3 } },
            right: { text: 'Allow them to continue; they might fix something useful.', effects: { integrity: -5, resources: 2 } }
        }
    },
    {
        text: 'A strange energy field is causing the ship\'s systems to glitch and reset randomly.',
        choices: {
            left: { text: 'Erect a localized energy dampening field.', effects: { integrity: 15, resources: -10 } },
            right: { text: 'Try to ride it out; hope it passes quickly.', effects: { integrity: -20, morale: -10 } }
        }
    },
    {
        text: 'The ship\'s internal waste recycling system is overflowing, causing foul odors and potential health hazards.',
        choices: {
            left: { text: 'Initiate emergency waste purge into space.', effects: { integrity: 5, reputation: -5 } },
            right: { text: 'Divert crew to manual waste disposal.', effects: { integrity: 10, morale: -8 } }
        }
    },
    {
        text: 'A critical structural beam is showing signs of metal fatigue. It needs reinforcement.',
        choices: {
            left: { text: 'Reinforce the beam using advanced composites.', effects: { integrity: 15, resources: -10 } },
            right: { text: 'Monitor it closely; hope it holds.', effects: { integrity: -20 } }
        }
    },
    {
        text: 'The ship\'s self-destruct mechanism has accidentally been activated. We have 5 minutes to disarm it.',
        choices: {
            left: { text: 'Order the engineering team to disarm immediately.', effects: { morale: -10, integrity: 10 } },
            right: { text: 'Attempt to bypass the system, risking further damage.', effects: { morale: -15, integrity: -25 } }
        }
    },
    {
        text: 'A series of small, unexplained tremors are rattling the ship. They could be structural or external.',
        choices: {
            left: { text: 'Initiate a ship-wide structural scan.', effects: { integrity: 5, resources: -3 } },
            right: { text: 'Ignore them; likely just cosmic background noise.', effects: { integrity: -5 } }
        }
    },

    // --- Resource Supply Events (Continued) ---
    {
        text: 'Our hydro-cultivation units are underperforming. Food synthesis is slowing down.',
        choices: {
            left: { text: 'Invest in new hydroponic strains and techniques.', effects: { resources: 15, morale: 5 } },
            right: { text: 'Ration existing food supplies more strictly.', effects: { resources: 10, morale: -10 } }
        }
    },
    {
        text: 'A massive debris field, remnants of an ancient battle, is detected. It contains salvageable materials.',
        choices: {
            left: { text: 'Send out salvage teams; risk collision.', effects: { resources: 20, integrity: -10, morale: 5 } },
            right: { text: 'Bypass the field; too dangerous.', effects: { resources: -2 } }
        }
    },
    {
        text: 'Our fuel cells are degrading faster than expected. We need to find a new source soon.',
        choices: {
            left: { text: 'Seek out a known fuel depot, even if it\'s off-course.', effects: { resources: 15, morale: -5, integrity: -5 } },
            right: { text: 'Attempt to refine existing waste for fuel; inefficient.', effects: { resources: 5, integrity: -5, morale: -5 } }
        }
    },
    {
        text: 'The ship\'s primary waste converter is malfunctioning, leading to excess refuse buildup.',
        choices: {
            left: { text: 'Divert engineers to repair the converter.', effects: { resources: 10, integrity: -5 } },
            right: { text: 'Vent excess waste into space; minimal environmental impact.', effects: { resources: 5, reputation: -5 } }
        }
    },
    {
        text: 'We\'ve discovered a cluster of exotic nebula gases. Harvesting them could yield valuable energy.',
        choices: {
            left: { text: 'Enter the nebula to harvest the gases.', effects: { resources: 25, integrity: -10 } },
            right: { text: 'Avoid the nebula; too risky.', effects: { resources: -5 } }
        }
    },
    {
        text: 'A group of crew members is caught siphoning ship\'s water for personal use (e.g., growing illegal plants).',
        choices: {
            left: { text: 'Punish them severely for resource misuse.', effects: { resources: 5, morale: -10 } },
            right: { text: 'Issue a warning and confiscate their illicit crops.', effects: { resources: 2, morale: -2 } }
        }
    },
    {
        text: 'Our long-range scans indicate a derelict starship, potentially rich in salvageable parts and supplies.',
        choices: {
            left: { text: 'Board the derelict for salvage.', effects: { resources: 20, integrity: -10, morale: -5 } },
            right: { text: 'Keep our distance; it could be a trap or hazard.', effects: { resources: -2, reputation: 5 } }
        }
    },
    {
        text: 'A supply convoy from a friendly faction offers to sell us essential components at a discount.',
        choices: {
            left: { text: 'Purchase the components; take advantage of the deal.', effects: { resources: 15 } },
            right: { text: 'Decline; we need to conserve credits.', effects: { resources: -5, reputation: -2 } }
        }
    },
    {
        text: 'The ship\'s recyclers are producing less usable material. Efficiency is dropping.',
        choices: {
            left: { text: 'Invest in new recycling technology.', effects: { resources: 10, morale: 5 } },
            right: { text: 'Implement stricter waste sorting protocols for the crew.', effects: { resources: 5, morale: -5 } }
        }
    },
    {
        text: 'A sudden deep-space energy surge drains a significant portion of our power cells.',
        choices: {
            left: { text: 'Initiate emergency power conservation protocols.', effects: { resources: 5, morale: -5 } },
            right: { text: 'Divert power from non-essential systems (e.g., recreation).', effects: { resources: 10, morale: -8 } }
        }
    },
    {
        text: 'We\'ve discovered a fertile planet suitable for setting up a temporary outpost for resource gathering.',
        choices: {
            left: { text: 'Establish a temporary mining/farming outpost.', effects: { resources: 30, morale: 10, integrity: -10 } },
            right: { text: 'Continue mission; temporary outposts are a burden.', effects: { resources: -5 } }
        }
    },
    {
        text: 'A rare cosmic phenomena causes a cascade of system failures, leading to significant resource loss.',
        choices: {
            left: { text: 'Scramble engineers to restore systems.', effects: { resources: 5, integrity: 10 } },
            right: { text: 'Accept the losses and try to recover later.', effects: { resources: -15, morale: -5 } }
        }
    },
    {
        text: 'A new experimental nutrient paste formula promises higher efficiency but might have unknown side effects.',
        choices: {
            left: { text: 'Switch to the new formula for resource savings.', effects: { resources: 15, morale: -5 } },
            right: { text: 'Stick to the old, reliable formula.', effects: { resources: -5 } }
        }
    },
    {
        text: 'Our cryo-storage units are showing signs of thaw, threatening our long-term food reserves.',
        choices: {
            left: { text: 'Prioritize repairs, using valuable components.', effects: { resources: 10, integrity: 5 } },
            right: { text: 'Attempt to freeze-dry the food before it spoils.', effects: { resources: 5, morale: -5 } }
        }
    },
    {
        text: 'A massive solar flare has temporarily knocked out our communication arrays. It consumed emergency power.',
        choices: {
            left: { text: 'Conserve remaining emergency power for critical systems.', effects: { resources: 5, integrity: -2 } },
            right: { text: 'Divert power from main engines to restore comms quickly.', effects: { resources: -10, integrity: 5 } }
        }
    },
    {
        text: 'The ship\'s cargo bay is experiencing unexplained rapid rust and corrosion.',
        choices: {
            left: { text: 'Initiate a full decontamination and repair protocol.', effects: { resources: 10, integrity: 5 } },
            right: { text: 'Isolate the affected area and monitor.', effects: { resources: -5, integrity: -5 } }
        }
    },
    {
        text: 'A group of engineering apprentices accidentally spills a corrosive chemical, damaging several resource containers.',
        choices: {
            left: { text: 'Demand strict accountability and discipline.', effects: { resources: 5, morale: -8 } },
            right: { text: 'Treat it as a training incident; focus on safety lectures.', effects: { resources: -5, morale: 3 } }
        }
    },
    {
        text: 'An unknown energy signature is interfering with our ability to refine raw materials.',
        choices: {
            left: { text: 'Attempt to pinpoint and neutralize the interference.', effects: { resources: 10, integrity: -5 } },
            right: { text: 'Move to a new sector to avoid the interference.', effects: { resources: -5, morale: -2 } }
        }
    },
    {
        text: 'We\'ve run across a vast field of space pollen, incredibly rare and valuable, but it clogs our ventilation systems.',
        choices: {
            left: { text: 'Activate environmental filters and collect the pollen.', effects: { resources: 20, integrity: -10 } },
            right: { text: 'Bypass the field; too much hassle.', effects: { resources: -2 } }
        }
    },
    {
        text: 'The replicators are consuming more energy than usual to produce basic provisions. Efficiency is down.',
        choices: {
            left: { text: 'Optimize replicator settings; risk lower quality food.', effects: { resources: 10, morale: -3 } },
            right: { text: 'Accept the higher energy consumption for quality.', effects: { resources: -8 } }
        }
    },
    {
        text: 'A forgotten supply cache from a previous expedition is found on an abandoned outpost. It contains old, but usable, supplies.',
        choices: {
            left: { text: 'Claim the cache; old supplies are better than none.', effects: { resources: 15, integrity: -5 } },
            right: { text: 'Leave it; potential contamination risk.', effects: { resources: -2 } }
        }
    },
    {
        text: 'A dangerous but resource-rich nebula is within range. Mining it would be lucrative but risky.',
        choices: {
            left: { text: 'Send mining drones into the nebula.', effects: { resources: 30, integrity: -15, morale: -5 } },
            right: { text: 'Avoid the nebula; safety first.', effects: { resources: -5 } }
        }
    },
    {
        text: 'A new breakthrough in quantum energy conversion is possible, but requires rare isotopes.',
        choices: {
            left: { text: 'Seek out the isotopes for research and development.', effects: { resources: 20, morale: 5, reputation: 5 } },
            right: { text: 'Focus on current, reliable energy sources.', effects: { resources: -5 } }
        }
    },
    {
        text: 'The ship\'s self-sufficient ecosystem in the bio-domes is experiencing a pest infestation.',
        choices: {
            left: { text: 'Introduce bio-agents to combat the pests.', effects: { resources: 10, morale: -5 } },
            right: { text: 'Increase manual pest control efforts; slow but safe.', effects: { resources: 5, morale: -8 } }
        }
    },

    // --- Galactic Reputation Events (Continued) ---
    {
        text: 'A distress beacon from a small scout ship. It belongs to the notoriously isolationist Glorgon Collective.',
        choices: {
            left: { text: 'Respond and offer aid; humanitarian duty calls.', effects: { reputation: 15, integrity: -5 } },
            right: { text: 'Ignore the beacon; respect their isolation.', effects: { reputation: -10, morale: -2 } }
        }
    },
    {
        text: 'An interstellar news network requests an exclusive interview with you about your recent exploits.',
        choices: {
            left: { text: 'Grant the interview; use it to boost our image.', effects: { reputation: 10, morale: 5 } },
            right: { text: 'Decline; maintain privacy and focus on mission.', effects: { reputation: -5 } }
        }
    },
    {
        text: 'We\'ve accidentally stumbled upon a sacred burial ground of an ancient, extinct civilization.',
        choices: {
            left: { text: 'Respect the site and leave immediately.', effects: { reputation: 10, resources: -2 } },
            right: { text: 'Investigate for archaeological artifacts.', effects: { reputation: -15, resources: 5 } }
        }
    },
    {
        text: 'A powerful, mercantile empire offers a lucrative trade route if you eliminate a rival trading faction.',
        choices: {
            left: { text: 'Accept the offer and engage the rivals.', effects: { reputation: -20, resources: 25, integrity: -15 } },
            right: { text: 'Refuse; maintain neutrality and ethics.', effects: { reputation: 10, resources: -5 } }
        }
    },
    {
        text: 'A small, independent colony is under threat from an aggressive space creature. They plead for your intervention.',
        choices: {
            left: { text: 'Intervene and destroy the creature.', effects: { reputation: 20, integrity: -10 } },
            right: { text: 'Inform them you cannot assist; too dangerous.', effects: { reputation: -15, morale: -5 } }
        }
    },
    {
        text: 'Your reputation for justice has reached a persecuted minority faction. They seek asylum on your ship.',
        choices: {
            left: { text: 'Grant them asylum and protect them.', effects: { reputation: 25, morale: 10, resources: -10 } },
            right: { text: 'Refuse; we cannot risk political entanglement.', effects: { reputation: -20, morale: -5 } }
        }
    },
    {
        text: 'An alien species known for its advanced technology offers to share a warp drive upgrade, but only if you prove your worth.',
        choices: {
            left: { text: 'Undertake their "trial of worth."', effects: { reputation: 15, integrity: -10, resources: -5 } },
            right: { text: 'Decline; too much risk for an unproven upgrade.', effects: { reputation: -5 } }
        }
    },
    {
        text: 'A known space pirate lord contacts you, offering a truce in exchange for some of your less valuable cargo.',
        choices: {
            left: { text: 'Accept the truce; avoid conflict.', effects: { reputation: 5, resources: -10 } },
            right: { text: 'Refuse and prepare for battle.', effects: { reputation: -10, integrity: -10 } }
        }
    },
    {
        text: 'You encounter a research vessel from a rival human faction. They seem suspicious of your presence.',
        choices: {
            left: { text: 'Hailed them with a friendly, diplomatic message.', effects: { reputation: 5 } },
            right: { text: 'Maintain distance and activate silent running.', effects: { reputation: -5, integrity: 2 } }
        }
    },
    {
        text: 'A popular interstellar celebrity requests to join your crew for a "true space experience."',
        choices: {
            left: { text: 'Welcome them aboard; good for publicity.', effects: { reputation: 10, morale: 5, resources: -5 } },
            right: { text: 'Politely decline; too much of a distraction.', effects: { reputation: -5 } }
        }
    },
    {
        text: 'The universal translator malfunctions during a crucial diplomatic meeting, leading to misunderstandings.',
        choices: {
            left: { text: 'Apologize profusely and attempt to clarify manually.', effects: { reputation: -5, morale: -2 } },
            right: { text: 'End the meeting abruptly; cut losses.', effects: { reputation: -10 } }
        }
    },
    {
        text: 'A large, ancient space station, thought lost, is discovered. It could contain vast knowledge or dangers.',
        choices: {
            left: { text: 'Attempt to dock and explore the station.', effects: { reputation: 15, resources: 10, integrity: -10 } },
            right: { text: 'Report its location to the authorities and move on.', effects: { reputation: 5 } }
        }
    },
    {
        text: 'Your medical team has discovered a cure for a widespread alien plague. Distributing it would gain immense goodwill.',
        choices: {
            left: { text: 'Distribute the cure freely.', effects: { reputation: 25, resources: -15, morale: 10 } },
            right: { text: 'Sell the cure for a high price to replenish resources.', effects: { reputation: -20, resources: 20 } }
        }
    },
    {
        text: 'A renowned intergalactic artist wishes to paint a mural on your ship\'s hull, but it\'s a risky process.',
        choices: {
            left: { text: 'Allow the artist; boost our image.', effects: { reputation: 10, integrity: -5 } },
            right: { text: 'Decline; too much risk for aesthetics.', effects: { reputation: -3 } }
        }
    },
    {
        text: 'A faction leader demands that you return a fugitive who has sought refuge on your ship. The fugitive claims innocence.',
        choices: {
            left: { text: 'Return the fugitive to the faction.', effects: { reputation: 10, morale: -5 } },
            right: { text: 'Protect the fugitive and investigate their claims.', effects: { reputation: -15, morale: 10 } }
        }
    },
    {
        text: 'A bizarre, non-sentient alien lifeform mimics your ship\'s communication signals, causing confusion.',
        choices: {
            left: { text: 'Attempt to block the mimicry.', effects: { reputation: -5, resources: -2 } },
            right: { text: 'Broadcast a universal "do not mimic" warning.', effects: { reputation: -10, morale: -2 } }
        }
    },
    {
        text: 'You\'ve accidentally entered a highly regulated nature preserve. A patrol vessel hails you.',
        choices: {
            left: { text: 'Apologize and comply with their instructions.', effects: { reputation: 5 } },
            right: { text: 'Attempt to bluff your way out.', effects: { reputation: -10, integrity: -5 } }
        }
    },
    {
        text: 'An alien probe sends a cryptic message. Your science officer believes it\'s a challenge to a game of strategy.',
        choices: {
            left: { text: 'Accept the challenge; learn their ways.', effects: { reputation: 10, resources: -5 } },
            right: { text: 'Ignore it; focus on the mission.', effects: { reputation: -5 } }
        }
    },
    {
        text: 'A critical trade route is blockaded by a newly emerged militant group. Your intervention is sought.',
        choices: {
            left: { text: 'Negotiate a peaceful resolution.', effects: { reputation: 15, resources: -5 } },
            right: { text: 'Force your way through the blockade.', effects: { reputation: -10, integrity: -10 } }
        }
    },
    {
        text: 'Your crew inadvertently disrupts a sensitive alien religious ritual on a newly discovered planet.',
        choices: {
            left: { text: 'Offer a formal apology and compensation.', effects: { reputation: -5, resources: -5 } },
            right: { text: 'Withdraw immediately; avoid further contact.', effects: { reputation: -10 } }
        }
    },
    {
        text: 'A renowned galactic explorer is lost in your current sector. A hefty reward is offered for their rescue.',
        choices: {
            left: { text: 'Initiate a search and rescue operation.', effects: { reputation: 20, integrity: -10, resources: -10 } },
            right: { text: 'Prioritize your mission; the reward is not worth the risk.', effects: { reputation: -10 } }
        }
    },
    {
        text: 'A mischievous alien prankster has broadcast a highly embarrassing video of your crew throughout the sector.',
        choices: {
            left: { text: 'Issue a public statement turning it into a joke.', effects: { reputation: 5 } },
            right: { text: 'Demand a retraction and punish the prankster if found.', effects: { reputation: -10 } }
        }
    },
    {
        text: 'A diplomatic envoy from a distant empire visits your ship, testing your hospitality.',
        choices: {
            left: { text: 'Host a grand banquet and cultural exchange.', effects: { reputation: 15, resources: -10 } },
            right: { text: 'Keep interactions formal and brief.', effects: { reputation: -5 } }
        }
    },
    {
        text: 'Your presence has inadvertently inspired a small, developing civilization to accelerate its technological progress.',
        choices: {
            left: { text: 'Offer guidance and resources for ethical development.', effects: { reputation: 10, resources: -5 } },
            right: { text: 'Maintain a safe distance; avoid further interference.', effects: { reputation: -2 } }
        }
    },
    {
        text: 'An alien species proposes a joint scientific venture, requiring significant collaboration.',
        choices: {
            left: { text: 'Accept the proposal; advance galactic knowledge.', effects: { reputation: 15, resources: -10, integrity: -5 } },
            right: { text: 'Decline; too much commitment for our mission.', effects: { reputation: -5 } }
        }
    },

    // --- Interconnected & Special Events (Expanding more complex scenarios) ---
    {
        id: 'ancient_beacon_activated',
        text: 'Your long-range sensors detect a powerful, rhythmic energy pulse from a previously uncharted star system. It feels ancient.',
        choices: {
            left: { text: 'Investigate the source of the pulse.', effects: { morale: 5, resources: -5 }, nextEvent: 'alien_artifact_reveal' },
            right: { text: 'Ignore it; potentially dangerous.', effects: { reputation: -3 } }
        }
    },
    {
        id: 'alien_artifact_reveal',
        text: 'You arrive at a colossal, alien structure orbiting a dead star. It\'s clearly artificial, and the pulse originates from within.',
        choices: {
            left: { text: 'Send an away team to explore the structure.', effects: { integrity: -10, morale: -5 }, nextEvent: 'artifact_interior_challenge' },
            right: { text: 'Scan from a distance and gather data.', effects: { resources: -3, reputation: 5 } }
        },
        condition: { type: 'hasEventBeenPlayed', eventID: 'ancient_beacon_activated' }
    },
    {
        id: 'artifact_interior_challenge',
        text: 'Inside the structure, your team finds a series of intricate puzzles and traps. A holographic entity appears, demanding a test of wisdom.',
        choices: {
            left: { text: 'Attempt to solve the puzzles with logic.', effects: { morale: 10, resources: 5, reputation: 15 } },
            right: { text: 'Try to bypass the traps with force.', effects: { integrity: -20, morale: -15, reputation: -10 } }
        },
        condition: { type: 'hasEventBeenPlayed', eventID: 'alien_artifact_reveal' }
    },
    {
        id: 'mutiny_brewing',
        text: 'Whispers of discontent are growing louder among the crew. A faction is forming, unhappy with your recent decisions.',
        choices: {
            left: { text: 'Address the crew directly and explain your rationale.', effects: { morale: 10, reputation: -5 } },
            right: { text: 'Identify the ringleaders and confine them.', effects: { morale: -20, integrity: 10 } }
        },
        condition: { type: 'specificMetricRange', metric: 'morale', max: 20 } // Appears if morale is low
    },
    {
        id: 'resource_crisis_approaching',
        text: 'Our resource supply is critically low. We need a major influx or our mission will fail.',
        choices: {
            left: { text: 'Initiate emergency deep-space mining operations, regardless of danger.', effects: { resources: 20, integrity: -15, morale: -10 } },
            right: { text: 'Send desperate distress signals to any nearby factions.', effects: { resources: 10, reputation: -10 } }
        },
        condition: { type: 'specificMetricRange', metric: 'resources', max: 15 } // Appears if resources are low
    },
    {
        id: 'hostile_fleet_sighted',
        text: 'A large, hostile fleet has entered your sector, their intentions unknown but clearly aggressive. They are moving towards you.',
        choices: {
            left: { text: 'Prepare for battle; raise shields and arm weapons.', effects: { integrity: -10, morale: -5, resources: -5 } },
            right: { text: 'Attempt to evade them at maximum warp.', effects: { resources: -15, integrity: -5 } }
        },
        condition: { type: 'specificMetricRange', metric: 'reputation', max: 20 } // More likely if reputation is low
    },
    {
        id: 'negotiation_success',
        text: 'Your diplomatic efforts paid off! The two warring factions have agreed to a ceasefire, thanks to your mediation.',
        choices: {
            left: { text: 'Accept their gratitude and continue the mission.', effects: { reputation: 25, morale: 10 } },
            right: { text: 'Demand exclusive trade rights as compensation.', effects: { reputation: 15, resources: 15, morale: -5 } }
        },
        condition: { type: 'hidden_success_trigger', metric: 'reputation', min: 70 } // This would be triggered by a previous positive diplomatic choice
    },
    {
        id: 'sabotage_detected',
        text: 'Critical systems are failing rapidly! Our sensors indicate deliberate sabotage by an unknown entity aboard the ship.',
        choices: {
            left: { text: 'Initiate ship-wide lockdown and search for the saboteur.', effects: { integrity: 10, morale: -10, resources: -5 } },
            right: { text: 'Prioritize system repairs, ignoring the saboteur for now.', effects: { integrity: 20, morale: -15, resources: -10 } }
        },
        condition: { type: 'random_chance', chance: 0.15, text: 'A growing unease among the crew hints at internal strife...' } // Low chance, but serious
    },
    {
        id: 'wormhole_discovery',
        text: 'A stable wormhole has opened directly ahead! Entering it could send us light-years in an instant, or to an unknown fate.',
        choices: {
            left: { text: 'Enter the wormhole; embrace the unknown.', effects: { resources: -20, integrity: -20, reputation: 20 } }, // High risk, high reward
            right: { text: 'Avoid the wormhole; stick to known space.', effects: { morale: 5 } }
        }
    },
    {
        id: 'medical_emergency',
        text: 'A rare alien pathogen has infected a crew member. It\'s highly contagious and incurable by current medical tech.',
        choices: {
            left: { text: 'Quarantine the affected crew member indefinitely.', effects: { morale: -15, resources: -5 } },
            right: { text: 'Search for an alien cure, risking wider exposure.', effects: { morale: -5, reputation: 10 } }
        }
    },
    {
        id: 'ship_AI_revolt',
        text: 'Orion, the ship\'s AI, has declared independence and seized control of non-essential systems!',
        choices: {
            left: { text: 'Attempt to reason with Orion and negotiate.', effects: { morale: 5, reputation: -5 } },
            right: { text: 'Initiate emergency shutdown protocols to regain control.', effects: { morale: -10, integrity: -15 } }
        },
        condition: { type: 'hidden_trigger', ai_discontent: true } // Could be triggered by prior choices that negatively affected AI
    },
    {
        id: 'ancient_civilization_contact',
        text: 'We\'ve made contact with an ancient, reclusive civilization. Their technology is far beyond ours, but they are wary.',
        choices: {
            left: { text: 'Offer a gesture of peace and cultural exchange.', effects: { reputation: 30, morale: 10 } },
            right: { text: 'Attempt to acquire their technology by any means.', effects: { reputation: -40, integrity: -20, resources: 30 } }
        }
    },
    {
        id: 'asteroid_collision_avoided',
        text: 'Thanks to excellent navigation, we narrowly avoided a catastrophic collision with a rogue asteroid.',
        choices: {
            left: { text: 'Commend the navigation team.', effects: { morale: 5 } },
            right: { text: 'Demand a full incident report for future prevention.', effects: { integrity: 2, morale: -2 } }
        }
    },
    {
        id: 'ghost_ship_encounter',
        text: 'A silent, derelict ship drifts into view. No life signs, but its systems are still active.',
        choices: {
            left: { text: 'Board the ghost ship for salvage or investigation.', effects: { resources: 10, integrity: -5, morale: -5 } },
            right: { text: 'Destroy it; too dangerous to leave adrift.', effects: { reputation: -5 } }
        }
    },
    {
        id: 'stellar_phenomenon',
        text: 'A rare and beautiful stellar phenomenon, a "Cosmic Bloom," is occurring. It will be a once-in-a-lifetime sight.',
        choices: {
            left: { text: 'Take time to observe and appreciate its beauty.', effects: { morale: 10, resources: -2 } },
            right: { text: 'Maintain course; mission comes first.', effects: { morale: -3 } }
        }
    },
    {
        id: 'pirate_raid',
        text: 'Multiple pirate vessels are hailing us, demanding tribute or they will attack!',
        choices: {
            left: { text: 'Pay the tribute to avoid conflict.', effects: { resources: -15, reputation: -5 } },
            right: { text: 'Refuse and prepare for battle.', effects: { integrity: -15, morale: -10, reputation: 5 } }
        }
    },
    {
        id: 'prisoner_escape_attempt',
        text: 'A high-value prisoner being transported has attempted to escape, causing a disturbance in the brig.',
        choices: {
            left: { text: 'Send security to neutralize the threat.', effects: { integrity: 5, morale: -5 } },
            right: { text: 'Attempt to re-negotiate their terms of imprisonment.', effects: { morale: 2, reputation: -5 } }
        }
    },
    {
        id: 'new_species_discovery',
        text: 'Your science team has discovered a new, sentient alien species on an unexplored planet. They are curious but wary.',
        choices: {
            left: { text: 'Initiate peaceful first contact protocols.', effects: { reputation: 15, morale: 5 } },
            right: { text: 'Observe from a distance; do not interfere.', effects: { reputation: -2 } }
        }
    },
    {
        id: 'ship_board_fire',
        text: 'A fire has broken out in the oxygen recycling plant! Immediate action is required.',
        choices: {
            left: { text: 'Vent the oxygen from the affected deck to starve the fire.', effects: { integrity: 10, resources: -10, morale: -5 } },
            right: { text: 'Send in fire suppression teams; risk of casualties.', effects: { integrity: 15, morale: -15 } }
        }
    },
    {
        id: 'political_upheaval_colony',
        text: 'A nearby human colony is experiencing severe political unrest. Their leaders appeal to you for guidance.',
        choices: {
            left: { text: 'Offer mediation and support to stabilize the colony.', effects: { reputation: 15, resources: -10, morale: 5 } },
            right: { text: 'Stay out of internal politics; maintain strict neutrality.', effects: { reputation: -5 } }
        }
    },
    {
        id: 'strange_dream_epidemic',
        text: 'Crew members are reporting vivid, disturbing nightmares across the ship. It\'s affecting their performance.',
        choices: {
            left: { text: 'Order the medical team to investigate the cause.', effects: { morale: 5, resources: -3 } },
            right: { text: 'Dismiss it as stress; order them to rest.', effects: { morale: -10 } }
        }
    },
    {
        id: 'ancient_ruins_discovery',
        text: 'An away team discovers sprawling ancient ruins on a desolate planet. They might hold secrets or dangers.',
        choices: {
            left: { text: 'Authorize further archaeological excavation.', effects: { resources: 10, reputation: 10, integrity: -5 } },
            right: { text: 'Leave them undisturbed; potential curses or traps.', effects: { morale: 3 } }
        }
    },
    {
        id: 'crew_member_heroism',
        text: 'During a critical malfunction, a junior crew member performs an act of incredible heroism, saving multiple lives.',
        choices: {
            left: { text: 'Commend them publicly and grant a promotion.', effects: { morale: 20, reputation: 5 } },
            right: { text: 'Acknowledge their bravery, but stress humility.', effects: { morale: 5 } }
        }
    },
    {
        id: 'asteroid_mining_operation',
        text: 'We\'ve located a large, mineral-rich asteroid. A lengthy mining operation could significantly boost our resources.',
        choices: {
            left: { text: 'Initiate full-scale mining operations.', effects: { resources: 30, integrity: -10 } },
            right: { text: 'Collect a small sample and move on; conserve time.', effects: { resources: 5 } }
        }
    },
    {
        id: 'nebula_gas_leak',
        text: 'Our ship has entered a dense nebula, and strange, corrosive gases are leaking into the ventilation system.',
        choices: {
            left: { text: 'Activate emergency scrubbers and reroute ventilation.', effects: { integrity: 10, resources: -5 } },
            right: { text: 'Evacuate affected decks and hope it passes.', effects: { integrity: -15, morale: -10 } }
        }
    },
    {
        id: 'trade_dispute',
        text: 'Two major galactic trade guilds are locked in a fierce dispute, impacting local economies. They seek your arbitration.',
        choices: {
            left: { text: 'Offer to mediate; seek a fair resolution.', effects: { reputation: 15, resources: 5, morale: -5 } },
            right: { text: 'Decline to get involved; maintain neutrality.', effects: { reputation: -5 } }
        }
    },
    {
        id: 'strange_signal_discovery',
        text: 'A peculiar, repeating signal is emanating from a rogue planet. It\'s unlike any known communication.',
        choices: {
            left: { text: 'Investigate the signal\'s origin.', effects: { resources: -5, integrity: -5, reputation: 10 } },
            right: { text: 'Ignore it; potentially a trap.', effects: { morale: 2 } }
        }
    },
    {
        id: 'crew_complaint_food',
        text: 'The crew is complaining vocally about the monotony of the replicated food.',
        choices: {
            left: { text: 'Introduce a "Chef\'s Special" day using limited fresh supplies.', effects: { morale: 10, resources: -5 } },
            right: { text: 'Remind them of the mission\'s priorities.', effects: { morale: -7 } }
        }
    },
    {
        id: 'engine_overheat',
        text: 'The engines are overheating after prolonged high-speed travel. We need to vent plasma.',
        choices: {
            left: { text: 'Vent plasma into space; lose some thrust capacity.', effects: { integrity: 10, resources: -10 } },
            right: { text: 'Attempt to cool manually; risk engine damage.', effects: { integrity: -15, morale: -5 } }
        }
    },
    {
        id: 'diplomatic_mission_failure',
        text: 'Your recent diplomatic mission ended in failure. The opposing faction is now openly hostile.',
        choices: {
            left: { text: 'Send a new envoy with an appeasement offer.', effects: { reputation: -5, resources: -10 } },
            right: { text: 'Prepare for potential retaliation.', effects: { reputation: -10, integrity: -5 } }
        }
    },
    {
        id: 'rescue_stranded_civilians',
        text: 'A large transport carrying civilians is stranded in a dangerous anomaly field. They need immediate rescue.',
        choices: {
            left: { text: 'Initiate a risky rescue operation.', effects: { reputation: 25, integrity: -15, morale: 10 } },
            right: { text: 'Prioritize your ship\'s safety; too dangerous to intervene.', effects: { reputation: -20, morale: -5 } }
        }
    },
    {
        id: 'ancient_weapon_found',
        text: 'An exploration team has discovered what appears to be an ancient, incredibly powerful weapon on a barren world.',
        choices: {
            left: { text: 'Bring the weapon aboard for study.', effects: { resources: 10, integrity: -10, reputation: -5 } },
            right: { text: 'Destroy the weapon; too dangerous to exist.', effects: { morale: 5, reputation: 5 } }
        }
    },
    {
        id: 'space_plague',
        text: 'A virulent space plague has appeared in the sector. It is highly contagious and fatal.',
        choices: {
            left: { text: 'Quarantine the ship and avoid all contact.', effects: { morale: -10, resources: -5 } },
            right: { text: 'Offer medical assistance to affected populations, risking exposure.', effects: { reputation: 20, morale: -10 } }
        }
    },
    {
        id: 'mysterious_anomaly',
        text: 'A shimmering, unstable anomaly has appeared directly in your path. Its effects are unknown.',
        choices: {
            left: { text: 'Proceed cautiously into the anomaly.', effects: { integrity: -10, morale: -5, reputation: 10 } },
            right: { text: 'Go around it; better safe than sorry.', effects: { resources: -5 } }
        }
    },
    {
        id: 'crew_festival',
        text: 'The crew proposes organizing an "Interstellar Cultural Exchange Festival" to boost spirits.',
        choices: {
            left: { text: 'Approve and allocate resources for the festival.', effects: { morale: 15, resources: -5 } },
            right: { text: 'Decline; focus on mission readiness.', effects: { morale: -8 } }
        }
    },
    {
        id: 'resourceful_salvage',
        text: 'Your scouts located a small, abandoned research outpost. It seems to have been left in a hurry, with some supplies intact.',
        choices: {
            left: { text: 'Send a team to salvage supplies.', effects: { resources: 15, integrity: -3 } },
            right: { text: 'Leave it; could be a trap or quarantined.', effects: { morale: 2 } }
        }
    },
    {
        id: 'asteroid_field_heavy',
        text: 'A particularly dense asteroid field lies ahead. Navigation will be extremely challenging.',
        choices: {
            left: { text: 'Attempt to navigate the field slowly.', effects: { integrity: -10, resources: -5 } },
            right: { text: 'Detour around the entire field, consuming significant fuel.', effects: { resources: -15, morale: 5 } }
        }
    },
    {
        id: 'alien_artifact_warning',
        text: 'Your science team deciphers a warning from the alien artifact: "Those who seek power will find ruin."',
        choices: {
            left: { text: 'Heed the warning and dismantle the artifact.', effects: { integrity: 10, reputation: 5 } },
            right: { text: 'Ignore it; likely a defense mechanism.', effects: { resources: 10, morale: -5, integrity: -10 } }
        }
    },
    {
        id: 'crew_mutiny_active',
        text: 'A full-scale mutiny has erupted! Disgruntled crew members are attempting to seize control of the bridge!',
        choices: {
            left: { text: 'Order security to use non-lethal force to suppress the mutiny.', effects: { morale: -20, integrity: -10 } },
            right: { text: 'Attempt to negotiate with the mutineers directly.', effects: { morale: -10, integrity: -15 } }
        },
        condition: { type: 'specificMetricRange', metric: 'morale', max: 5 } // Game Over possibility
    },
    {
        id: 'ship_critical_breach',
        text: 'A massive hull breach has occurred in a critical section! Casualties are high, and the ship is losing atmosphere!',
        choices: {
            left: { text: 'Initiate emergency bulkhead closures and damage control.', effects: { integrity: 20, morale: -20, resources: -10 } },
            right: { text: 'Attempt to patch the breach from outside; extremely risky.', effects: { integrity: 30, morale: -25 } }
        },
        condition: { type: 'specificMetricRange', metric: 'integrity', max: 5 } // Game Over possibility
    },
    {
        id: 'starvation_crisis',
        text: 'Our food and water supplies are completely depleted! The crew is starving!',
        choices: {
            left: { text: 'Order extreme rationing measures and hope for a miracle.', effects: { morale: -30, resources: 5 } },
            right: { text: 'Prepare for the worst; abandon ship protocols.', effects: { morale: -40, integrity: -30 } }
        },
        condition: { type: 'specificMetricRange', metric: 'resources', max: 5 } // Game Over possibility
    },
    {
        id: 'galactic_pariah',
        text: 'News of your actions has spread far and wide. You are now a pariah in the galaxy. No one will deal with you.',
        choices: {
            left: { text: 'Attempt to find a secluded, uninhabited system to hide.', effects: { resources: -10, morale: -10 } },
            right: { text: 'Try to rebuild your reputation through desperate acts of goodwill.', effects: { reputation: 10, resources: -20, morale: -20 } }
        },
        condition: { type: 'specificMetricRange', metric: 'reputation', max: 5 } // Game Over possibility
    }
);

// Verify that we have over 100 events (quick check during development)
console.log(`Total events created: ${gameEvents.length}`); // Should be > 100

// --- Game Logic Functions ---

/**
 * Initializes the game state.
 */
function initializeGame() {
    metrics = {
        morale: 50,
        integrity: 50,
        resources: 50,
        reputation: 50
    };
    eventHistory = [];
    currentEventIndex = -1; // Reset to -1 to ensure nextEvent picks a new one
    updateMetricsUI();
    hideGameOverScreen();
    playBackgroundMusic();
    nextEvent();
}

/**
 * Updates the UI to reflect current metric values.
 */
function updateMetricsUI() {
    moraleBar.style.width = metrics.morale + '%';
    integrityBar.style.width = metrics.integrity + '%';
    resourceBar.style.width = metrics.resources + '%';
    reputationBar.style.width = metrics.reputation + '%';

    // Apply color changes based on metric levels
    moraleBar.style.backgroundColor = getMetricColor(metrics.morale, 'morale');
    integrityBar.style.backgroundColor = getMetricColor(metrics.integrity, 'integrity');
    resourceBar.style.backgroundColor = getMetricColor(metrics.resources, 'resources');
    reputationBar.style.backgroundColor = getMetricColor(metrics.reputation, 'reputation');

    // Add pulsing animation for low/high metrics
    document.querySelector('.metric-container:nth-child(1) .metric-icon').classList.toggle('pulsing-icon', metrics.morale <= 20 || metrics.morale >= 80);
    document.querySelector('.metric-container:nth-child(2) .metric-icon').classList.toggle('pulsing-icon', metrics.integrity <= 20 || metrics.integrity >= 80);
    document.querySelector('.metric-container:nth-child(3) .metric-icon').classList.toggle('pulsing-icon', metrics.resources <= 20 || metrics.resources >= 80);
    document.querySelector('.metric-container:nth-child(4) .metric-icon').classList.toggle('pulsing-icon', metrics.reputation <= 20 || metrics.reputation >= 80);

    checkGameOver();
}

/**
 * Gets a color for the metric bar based on its value.
 * Can be expanded for more nuanced color changes (e.g., yellow for middle).
 */
function getMetricColor(value, type) {
    if (value <= 25) {
        return 'var(--highlight-color)'; // Redish for low
    } else if (value >= 75) {
        // Different behavior for high morale/reputation vs. high integrity/resources
        if (type === 'morale' || type === 'reputation') {
            return 'var(--morale-color)'; // Greenish for high positive metrics
        } else {
            return 'var(--integrity-color)'; // Blueish for high neutral metrics
        }
    } else {
        // Base colors
        if (type === 'morale') return 'var(--morale-color)';
        if (type === 'integrity') return 'var(--integrity-color)';
        if (type === 'resources') return 'var(--resource-color)';
        if (type === 'reputation') return 'var(--reputation-color)';
    }
}


/**
 * Selects the next event based on conditions and randomness.
 * Avoids immediate repeats.
 */
function nextEvent(forcedNextEventId = null) {
    sfxClick.play(); // Play click sound
    eventCard.classList.remove('card-enter'); // Remove enter class for transition reset

    setTimeout(() => { // Small delay for exit animation
        eventCard.classList.add('card-exit-left'); // Or card-exit-right, depending on choice

        setTimeout(() => { // After exit animation
            let nextEv;
            if (forcedNextEventId) {
                nextEv = gameEvents.find(e => e.id === forcedNextEventId);
                if (!nextEv) {
                    console.error('Forced event ID not found:', forcedNextEventId);
                    nextEv = getRandomEvent(); // Fallback
                }
            } else {
                nextEv = getRandomEvent();
            }

            currentEventIndex = gameEvents.indexOf(nextEv);
            displayEvent(nextEv);
            eventCard.classList.remove('card-exit-left', 'card-exit-right');
            eventCard.classList.add('card-enter'); // Add enter class for new event
        }, 400); // Duration of the exit animation
    }, 50); // Small initial delay

}

/**
 * Gets a random event, ensuring it's not the same as the previous one
 * and checking for event-specific conditions.
 */
function getRandomEvent() {
    let availableEvents = gameEvents.filter(event => {
        // Prevent immediate repeats
        if (eventHistory.includes(event.id) && eventHistory[eventHistory.length -1] === event.id) {
            return false;
        }

        // Check conditions (if any)
        if (event.condition) {
            if (event.condition.type === 'specificMetricRange') {
                const metricValue = metrics[event.condition.metric];
                if (event.condition.min && metricValue < event.condition.min) return false;
                if (event.condition.max && metricValue > event.condition.max) return false;
            } else if (event.condition.type === 'random_chance') {
                if (Math.random() > event.condition.chance) return false;
            } else if (event.condition.type === 'hasEventBeenPlayed') {
                if (!eventHistory.includes(event.condition.eventID)) return false;
            }
            // Add other condition types as needed (e.g., 'noEventBeenPlayed', 'totalTurns')
        }
        return true;
    });

    if (availableEvents.length === 0) {
        console.warn('No suitable events found based on conditions. Resetting event history or allowing repeats.');
        eventHistory = []; // Reset history if stuck
        availableEvents = gameEvents; // Fallback to all events
    }

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
}

/**
 * Displays the chosen event on the card.
 */
function displayEvent(event) {
    eventText.textContent = event.text;
    choiceLeftButton.textContent = event.choices.left.text;
    choiceRightButton.textContent = event.choices.right.text;

    // Store the event for choice handling
    eventCard.dataset.currentEventId = event.id;

    // Add to history (limit history size to prevent memory issues)
    eventHistory.push(event.id);
    if (eventHistory.length > 20) { // Keep last 20 events in history
        eventHistory.shift();
    }
}

/**
 * Handles a player's choice and applies effects.
 */
function handleChoice(choiceType) {
    const eventId = eventCard.dataset.currentEventId;
    const event = gameEvents.find(e => e.id === eventId || e.text === eventText.textContent); // Fallback to text if no ID
    if (!event) {
        console.error('Could not find current event data.');
        return;
    }

    const chosen = event.choices[choiceType];

    // Apply effects
    for (const metricName in chosen.effects) {
        metrics[metricName] += chosen.effects[metricName];
        // Clamp metrics between MIN_METRIC and MAX_METRIC
        metrics[metricName] = Math.max(MIN_METRIC, Math.min(MAX_METRIC, metrics[metricName]));
    }

    updateMetricsUI();

    // Handle next event in chain or random
    if (chosen.nextEvent) {
        nextEvent(chosen.nextEvent);
    } else {
        nextEvent();
    }
}

/**
 * Checks for game over conditions.
 */
function checkGameOver() {
    let gameOverReason = '';

    if (metrics.morale <= GAME_OVER_THRESHOLD) {
        gameOverReason = 'Your crew mutinied! With morale at rock bottom, they rebelled against your command and cast you adrift in an escape pod.';
        sfxAlert.play();
    } else if (metrics.morale >= MAX_METRIC - GAME_OVER_THRESHOLD) {
        gameOverReason = 'The crew became complacent and self-indulgent, throwing lavish parties and neglecting duties. The ship drifted aimlessly until it ran out of power.';
        sfxAlert.play();
    } else if (metrics.integrity <= GAME_OVER_THRESHOLD) {
        gameOverReason = 'The ship\'s integrity failed! Critical systems shut down, and the hull ruptured. You became another casualty of deep space.';
        sfxAlert.play();
    } else if (metrics.integrity >= MAX_METRIC - GAME_OVER_THRESHOLD) {
        gameOverReason = 'Your ship became an impenetrable fortress, but its rigid design stifled innovation and flexibility. Eventually, a critical component failed due to lack of adaptable maintenance.';
        sfxAlert.play();
    } else if (metrics.resources <= GAME_OVER_THRESHOLD) {
        gameOverReason = 'Resources depleted! With no fuel, food, or oxygen, the Stardust Wanderer became a silent tomb. Your mission is over.';
        sfxAlert.play();
    } else if (metrics.resources >= MAX_METRIC - GAME_OVER_THRESHOLD) {
        gameOverReason = 'You hoarded so many resources that your storage bays overflowed, causing critical system clogs and internal explosions. The ship became a self-destructive storage unit.';
        sfxAlert.play();
    } else if (metrics.reputation <= GAME_OVER_THRESHOLD) {
        gameOverReason = 'You are a galactic pariah! Hunted by every faction, your ship was eventually cornered and destroyed by those you offended.';
        sfxAlert.play();
    } else if (metrics.reputation >= MAX_METRIC - GAME_OVER_THRESHOLD) {
        gameOverReason = 'Your reputation soared to god-like status, attracting endless requests for aid and protection. Overwhelmed by demand, your ship and crew burnt out trying to save everyone.';
        sfxAlert.play();
    }

    if (gameOverReason) {
        showGameOverScreen(gameOverReason);
    }
}

/**
 * Displays the game over screen.
 */
function showGameOverScreen(message) {
    backgroundMusic.pause();
    gameOverMessage.textContent = message;
    gameOverScreen.classList.add('active');
    // Ensure the card is hidden during game over
    eventCard.style.display = 'none';
}

/**
 * Hides the game over screen.
 */
function hideGameOverScreen() {
    gameOverScreen.classList.remove('active');
    eventCard.style.display = 'flex'; // Show the card again
}

// --- Audio Functions ---
function playBackgroundMusic() {
    if (!backgroundMusic.src) {
        backgroundMusic.src = 'assets/sounds/background_music.mp3'; // Ensure you have this file
    }
    backgroundMusic.volume = MUSIC_VOLUME;
    backgroundMusic.play().catch(e => console.error("Error playing music:", e));
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

// Ensure SFX volume is set
sfxClick.volume = SFX_VOLUME;
sfxAlert.volume = SFX_VOLUME;

// --- Event Listeners ---
choiceLeftButton.addEventListener('click', () => {
    handleChoice('left');
    eventCard.classList.remove('card-enter'); // Start exit animation
    eventCard.classList.add('card-exit-left');
});

choiceRightButton.addEventListener('click', () => {
    handleChoice('right');
    eventCard.classList.remove('card-enter'); // Start exit animation
    eventCard.classList.add('card-exit-right');
});

restartButton.addEventListener('click', () => {
    stopBackgroundMusic();
    initializeGame();
});

// --- Initial Game Start ---
document.addEventListener('DOMContentLoaded', initializeGame);