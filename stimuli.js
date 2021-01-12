// Item types
const PASSIVE   = "PASSIVE";
const ACTIVE    = "ACTIVE";
const FILLER    = "FILLER";
const PRAC      = "PRAC";

// experimental, filler and practice items from:
// Caterina Laura Paolazzi, Nino Grillo, Artemis Alexiadou & Andrea Santi (2019)
// Passives are not hard to interpret but hard to remember: evidence from
// online and offline studies, Language, Cognition and Neuroscience,
// 34:8, 991-1015, DOI: 10.1080/23273798.2019.1602733.
// Questions made up by Iris Mulders.

// Groups 
const GROUPS = [
    "group1",
    "group2"
    // "group3"
];

const PRACTICE_ITEMS = [
    {
        id : 1,
        item_type : PRAC,

        stimulus :                                                            // Single "/" delimit boundaries between words presented
                                                                              // together, words presented together.
                                                                              // boundaries must be activated by setting "/" as
                                                                              // GROUPING_STRING in globals.js. The default is null
                                                                              // which means every word is a group of in its own.
                                                                              // If the grouping string isn't set or null,
                                                                              // the "/" will be displayed instead of used for grouping.
            "The teacher took /the /car /instead /of /the /express"         + // The '+' adds strings together or concatenates them.
            "/train \ndue to the previously announced public\n"             + // A "\n" makes the string jump to the next line.
            "transport strike.\n",                                            // use a comma here.
        question : "",                                                        // An empty string means no question for this trial.
        qanswer : undefined                                                   // We can't define a answer if there ain't no question.
    },
    {
        id : 2,
        item_type : PRAC,
        stimulus :
            "The researcher presented /his /most /recent /work\n"           +
            "/to /the /commission and obtained very positive\n"             +
            "comments regarding the experimental design.\n"                 ,
        question : "The researcher presented old work.",
        qanswer : FALSE_BUTTON_TEXT                                           // Use FALSE_BUTTON_TEXT if the answer is true,
                                                                              // TRUE_BUTTON_TEXT otherwise
    }
];

/*
 * In this list there is a stimulus, if a word or group of words starts with a
 * '#' it's reaction time will be recorded. So don't put any '#" elsewhere...
 */
const LIST_GROUP1 = [
    {
        id : 1,
        item_type : PASSIVE,
        stimulus :
            "The guitarist was rejected by /#the /#attractive /#and\n"      + 
            "/#talented /#singer /#in /#the /#concert /#hall /#next /#to\n" + 
            "/#the /#Irish /#pub.\n"                                        , 
        question : "The singer was attractive.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : ACTIVE,
        stimulus :
            "The sculptor mugged /#the /#strange /#and\n"                   +
            "/#temperamental /#photographer /#in /#the /#art /#gallery\n"   +
            "/#next /#to /#the /#book /#shop.\n"                            ,
        question : "",
        qanswer : undefined
    },
    {
        id : 3,
        item_type : FILLER,
        stimulus :
            "The beautiful princess married her young and\n"            +
            "handsome chauffeur and shocked the royal\n"                +
            "family and the press.\n"                                   ,
        question : "The chauffeur was an old man.",
        qanswer : FALSE_BUTTON_TEXT
    },
    {
        id : 4,
        item_type : FILLER,
        stimulus :
            "The little girl did not play with her brother\n"           +
            "in the colourful playground next to their weedy\n"         +
            "garden.\n"                                                 ,
        question : "",
        qanswer : undefined
    }
];

/*
 * In this list there is a stimulus, if a word starts with a '#' its
 * reaction time will be recorded. So don't put any '#" elsewhere...
 */
const LIST_GROUP2 = [
    {
        id : 1,
        item_type : ACTIVE,
        stimulus :
            "The guitarist rejected /#the /#attractive /#and\n"             + 
            "/#talented /#singer /#in /#the /#concert/# hall /#next /#to\n" + 
            "/#the /#Irish /#pub.\n"                                        , 
        question : "The singer was attractive.",
        qanswer : TRUE_BUTTON_TEXT
    },
    {
        id : 2,
        item_type : PASSIVE,
        stimulus :
            "The sculptor was mugged by /#the /#strange /#and\n"            +
            "/#temperamental /#photographer /#in /#the /#art /#gallery\n"   +
            "/#next /#to /#the /#book /#shop.\n"                            ,
        question : "",
        qanswer : undefined
    },
    {
        id : 3,
        item_type : FILLER,
        stimulus :
            "The beautiful princess married her young and\n"                +
            "handsome chauffeur and shocked the royal\n"                    +
            "family and the press.\n"                                       ,
        question : "The chauffeur was an old man.",
        qanswer : FALSE_BUTTON_TEXT
    },
    {
        id : 4,
        item_type : FILLER,
        stimulus :
            "The little girl did not play with her brother\n"               +
            "in the colourful playground next to their weedy\n"             +
            "garden.\n"                                                     ,
        question : "",
        qanswer : undefined
    }
];

// Add a third list of stimuli when required.
// const LIST_GROUP3 = [
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

