/*-------------------------------------------------------------------------
 | Main
 | ========================================================================
 | Main file.
 -------------------------------------------------------------------------*/

var colorScale = d3.scale.category20b();

function ministrySimilarityClass(dataSetIndex, ministryName)
{
    if (dataSetIndex == null || ministryName == null) return null;

    var similarityClass =
        [
            {
                "A, Infrastructuurfonds": 0,
                "IXa, Nationale Schuld": 1,
                "IXb, FinanciÃ«n": 2,
                "J, Deltafonds": 3,
                "V, Buitenlandse Zaken": 4,
                "VI, Veiligheid en Justitie": 5,
                "VII, Binnenlandse Zaken en Koninkrijksrelaties": 6,
                "VIII, Onderwijs, Cultuur en Wetenschap": 7,
                "X, Defensie": 8,
                "XIII, Economische Zaken": 9,
                "XV, Sociale Zaken en Werkgelegenheid": 10,
                "B, Gemeentefonds": 11,
                "C, Provinciefonds": 12,
                "IV, Koninkrijksrelaties": 13,
                "XII, Infrastructuur en Milieu": 14,
                "XVI, Volksgezondheid, Welzijn en Sport": 15,
                "XVIII, Wonen en Rijksdienst": 16,
                "XVII, Buitenlandse Handel & Ontwikkelingssamenwerking": 17
            },
            {
                "AuswÃ¤rtiges Amt": 18,
                "Bundesministerium des Innern": 19,
                "Bundesministerium der Justiz": 5,
                "Bundesministerium der Finanzen": 2,
                "Bundesministerium fÃ¼r Wirtschaft und Technologie": 7,
                "Bundesministerium fÃ¼r ErnÃ¤hrung, Landwirtschaft und Verbraucherschutz": 23,
                "Bundesministerium fÃ¼r Arbeit und Soziales": 24,
                "Bundesministerium fÃ¼r Verkehr, Bau und Stadtentwicklung": 25,
                "Bundesministerium der Verteidigung": 8,
                "Bundesministerium fÃ¼r Gesundheit": 15,
                "Bundesministerium fÃ¼r Umwelt, Naturschutz und Reaktorsicherheit": 28,
                "Bundesministerium fÃ¼r Familie, Senioren, Frauen und Jugend": 29,
                "Bundesministerium fÃ¼r wirtschaftliche Zusammenarbeit und Entwicklung": 30,
                "Bundesministerium fÃ¼r Bildung und Forschung": 31,
                "Bundesschuld": 1,
                "Allgemeine Finanzverwaltung": 33,
                "Deutscher Bundestag": 34,
                "Bundeskanzlerin und Bundeskanzleramt": 35,
                "Bundesverfassungsgericht": 36,
                "Bundesrechnungshof": 37,
                "Bundesministerium der Justiz und fÃ¼r Verbraucherschutz": 38,
                "Bundesministerium fÃ¼r Wirtschaft und Energie": 39,
                "Bundesministerium fÃ¼r ErnÃ¤hrung und Landwirtschaft": 40,
                "Bundesministerium fÃ¼r Verkehr und digitale Infrastruktur": 41,
                "Bundesministerium fÃ¼r Umwelt, Naturschutz, Bau und Reaktorsicherheit": 42
            }
        ];
    var simClass;
    if (similarityClass[dataSetIndex][ministryName] == undefined)
        simClass = ministryName;
    else
        simClass = similarityClass[dataSetIndex][ministryName];

    return simClass;
}

function color(dataSetIndex, ministryName)
{
    //return colorScale(ministrySimilarityClass(dataSetIndex, ministryName));
    return colorScale(ministrySimilarityClass(dataSetIndex, ministryName));
}

var state = {
    year: parseInt(api.getYearValues()[api.getYearValues().length-1]),
    minimum: +api.getYearValues()[0],
    ministryHighlighted: "null",
    rainbow: $("input[name='rainbow'][value='on']").is(':checked'),

    /*
     * "U, V", and O signs respectively (-1, 0 or 1)
     */
    budgetScale: {"U": 1, "V": 1, "O": 0},
    getSigns: function() {
        return [this.budgetScale["U"], this.budgetScale["V"], this.budgetScale["O"]]
    },

    /*
     * @param budgetType A string containing "O", "U" or "V"
     * @return The sign in which the inputted budget type should occur
     * in the visualisations
     */
    getSign: function(budgetType)
    {
        return this.budgetScale[budgetType];
    },

    sliderMouseDown: "false",
    subscribers: [],
    subscribe: function(callback) {
        this.subscribers.push(callback)
    },
    notify: function(source) {
        for (var sub in this.subscribers) {
            this.subscribers[sub]("this", source)
        }
    }
};

function HighlightState()
{
    /*
     * State variables
     */
    this.dataSetIndex = null;
    this.ministry = null;

    /*
     * Listener design pattern
     */
    subscribers = [];
    this.subscribe = function(callback)
    {
        subscribers.push(callback);
    };
    this.notify = function(source)
    {
        for (var sub in subscribers) {
            subscribers[sub]("this", source);
        }
    }
}

var highlightState = new HighlightState();