// Item types
const GRAM      = "GRAM";
const UNGRAM    = "UNGRAM";
const FILLER    = "FILLER";
const PRAC      = "PRAC";

const GROUPS = [
    "group1",
    "group2"
    // "group3"
];

const PRACTICE_ITEMS = [
    {
        id : 1,
        item_type : PRAC,
        stimulus :
            "In het tuincentrum konden Martine en Marije\n"     + // A '+' adds strings together
            "genoeg van hun gading vinden. Martine zocht\n"     + // or concatenates them.
            "een zes appelbomen van een ziekte bestendig\n"     + // A "\n" makes the string
            "ras uit en Marije twaalf bessenstruiken.\n"        + // jump to the next line.
            "Gelukkig was het prima weer om hun nieuwe\n"       +
            "aanwisten meteen te planten.\n"                     , // use a comma here.
        question : "", // An empty string means no question for this trial.
        qanswer : undefined // We can't define a answer if there ain't no question.
    },
    {
        id : 2,
        item_type : PRAC,
        stimulus :
            "Godelieve en Vincent waren net verhuisd\n"         +
            "en waren aan het klussen op zolder. Godelieve\n"   +
            "zaagde een boekenplank van MDF, terwijl\n"         +
            "Vincent de kozijnen verde. Na een dag\n"           +
            "hard werken gingen ze tevreden slapen\n"           +
            "in hun nieuwe huis.\n"                             ,
        question : "Vincent verfde de kozijnen.",
        qanswer : TRUE_BUTTON_TEXT // Put a true if the expected answer is true, a false otherwise.
    }
];

/*
 * In this list there is a stimulus, if a word starts with a '#' it's
 * reaction time will be recorded. So don't put any '#" elsewhere...
 */
const LIST_GROUP1 = [
    {
        id : 1,
        item_type : UNGRAM,
        stimulus :
            "Jan en Marie zaten na een lange\n"                         + 
            "werkdag samen te wachten in de\n"                          + 
            "stationsresauratie in Amsterdam.\n"                        + 
            "Jan at een broodje met ham\n"                              + 
            "#en #Marie #een #koffie #met #veel #melk. #De #stemming\n" + 
            "#was #niet #best, #omdat #de #trein meer dan\n"            + 
            "30 minuten vertraging had.\n"                              ,
        question : "Jan at een broodje.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : GRAM,
        stimulus :
            "Roos en Lisa hadden aangeboden het huis\n"                 +
            "van oma eens flink op te knappen en schoon te\n"           +
            "maken. Roos schrobde het houtwerk in de gang\n"            +
            "#en #Lisa #het #tapijt #in #de #kamer. #Oma #wist\n"       +
            "#niet #wat #ze #zag #en #bedankte de dames met\n"          +
            "een bos bloemen\n"                                         ,
        question : "",
        qanswer : undefined
    },
    {
        id : 3,
        item_type : FILLER,
        stimulus :
            "Op het introductiekamp van hun nieuwe studie\n"            +
            "misten Suzy en Jochem hun partner meer dan ooit.\n"        +
            "Suzy zoch een brief van haar vrien, en Jochem\n"           +
            "een foto van zijn vriendin. Gelukkig duurde het\n"         +
            "kamp maar vijf dagen"                                      ,
        question : "Suzy zocht een foto.",
        qanswer : FALSE_BUTTON_TEXT
    },
    {
        id : 4,
        item_type : FILLER,
        stimulus :
            "Martijn en Jessica verwachten samen hun\n"                 +
            "eerste kindje en vonden het leuk zelf\n"                   +
            "babyspulletjes te maken. Martijn zaagde\n"                 +
            "een bedje van hout, terwijl Jessica een\n"                 +
            "dekentje van zachte wol breide.\n"                         +
            "Het resultaat was een practige wieg.\n"                    ,
        question : "",
        qanswer : undefined
    }
];

/*
 * In this list there is a stimulus, if a word starts with a '#' it's
 * reaction time will be recorded. So don't put any '#" elsewhere...
 */
const LIST_GROUP2 = [
    {
        id : 1,
        item_type : GRAM,
        stimulus :
            "Jan en Marie zaten na een lange\n"                         + 
            "werkdag samen te wachten in de\n"                          + 
            "stationsrestauratie in Amsterdam.\n"                       + 
            "Jan at een broodje met ham,\n"                             + 
            "#en #Marie #een #koffie #met #veel #melk. #De #stemming\n" + 
            "#Was #niet #best, #omdat #de #trein meer dan\n"            + 
            "30 minuten vertraging had.\n"                              ,
        question : "Jan at een broodje.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : UNGRAM,
        stimulus :
            "Roos en Lisa hadden aangeboden het huis \n"                +
            "van oma eens flink op te knappen en schoon te \n"          +
            "maken. Roos schuurde het houtwerk in de gang, \n"          +
            "#en #Lisa #het #tapijt #in #de #kamer. #Oma #wist\n"       +
            "#niet #wat #ze #zag #en #bedankte de dames met \n"         +
            "een bos bloemen."                                          ,
            
        question : "",
        qanswer : undefined
    },
    {
        id : 3,
        item_type : FILLER,
        stimulus :
            "Op het introductiekamp van hun nieuwe studie\n"            +
            "misten Suzy en Jochem hun partner meer dan ooit.\n"        +
            "Suzy zoch een brief van haar vrien, en Jochem\n"           +
            "een foto van zijn vriendin. Gelukkig duurde het\n"         +
            "kamp maar vijf dagen"                                      ,
        question : "Suzy zocht een foto.",
        qanswer : FALSE_BUTTON_TEXT
    },
    {
        id : 4,
        item_type : FILLER,
        stimulus :
            "Martijn en Jessica verwachten samen hun\n"                 +
            "eerste kindje en vonden het leuk zelf\n"                   +
            "babyspulletjes te maken. Martijn zaagde\n"                 +
            "een bedje van hout, terwijl Jessica een\n"                 +
            "dekentje van zachte wol breide.\n"                         +
            "Het resultaat was een practige wieg.\n"                    ,
        question : "",
        qanswer : undefined
    }
];

// Add a second list of stimuli when required.
// const LIST_GROUP2 = [
// ...
// ]

// These groups are not a between subjects variable, but
// define which list a participant gets.
const TEST_ITEMS = [
    {group_name: GROUPS[0], table: LIST_GROUP1},
    {group_name: GROUPS[1], table: LIST_GROUP2}
    // Add a third group here, put a comma on the
    // end of the line above here.
    // {group_name: GROUPS[1], table: LIST_GROUP3}
];

/**
 * Get the list of practice items
 *
 * Returns an object with a group and a table, the group will always indicate
 * "practice" since it are the practice items
 *
 * @returns {object} object with group and table fields
 */
function getPracticeItems() {
    return {group_name : "practice", table : PRACTICE_ITEMS};
}

/**
 * This function will pick a random group from the TEST_ITEMS array.
 *
 * Returns an object with a group and a table, the group will always indicate
 * which list has been chosen for the participant.
 *
 * @returns {object} object with group and table fields
 */
function pickRandomGroup() {
    let range = function (n) {
        let empty_array = [];
        let i;
        for (i = 0; i < n; i++) {
            empty_array.push(i);
        }
        return empty_array;
    }
    let num_groups = TEST_ITEMS.length;
    var shuffled_range = jsPsych.randomization.repeat(range(num_groups), 1)
    var retgroup = TEST_ITEMS[shuffled_range[0]];
    return retgroup
}
