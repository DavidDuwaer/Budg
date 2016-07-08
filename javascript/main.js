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
                "AInfrastructuurfonds": 0,
                "IXaNationaleSchuld": 1,
                "IXbFinancin": 2,
                "JDeltafonds": 3,
                "VBuitenlandseZaken": 4,
                "VIVeiligheidenJustitie": 5,
                "VIIBinnenlandseZakenenKoninkrijksrelaties": 6,
                "VIIIOnderwijsCultuurenWetenschap": 7,
                "XDefensie": 8,
                "XIIIEconomischeZaken": 9,
                "XVSocialeZakenenWerkgelegenheid": 10,
                "BGemeentefonds": 11,
                "CProvinciefonds": 12,
                "IVKoninkrijksrelaties": 13,
                "XIIInfrastructuurenMilieu": 14,
                "XVIVolksgezondheidWelzijnenSport": 15,
                "XVIIIWonenenRijksdienst": 16,
                "XVIIBuitenlandseHandelOntwikkelingssamenwerking": 17
            },
            {
                "AuswrtigesAmt": 18,
                "BundesministeriumdesInnern": 19,
                "BundesministeriumderJustiz": 5,
                "BundesministeriumderFinanzen": 2,
                "BundesministeriumfrWirtschaftundTechnologie": 7,
                "BundesministeriumfrErnhrungLandwirtschaftundVerbraucherschutz": 23,
                "BundesministeriumfrArbeitundSoziales": 24,
                "BundesministeriumfrVerkehrBauundStadtentwicklung": 25,
                "BundesministeriumderVerteidigung": 8,
                "BundesministeriumfrGesundheit": 15,
                "BundesministeriumfrUmweltNaturschutzundReaktorsicherheit": 28,
                "BundesministeriumfrFamilieSeniorenFrauenundJugend": 29,
                "BundesministeriumfrwirtschaftlicheZusammenarbeitundEntwicklung": 30,
                "BundesministeriumfrBildungundForschung": 31,
                "Bundesschuld": 1,
                "AllgemeineFinanzverwaltung": 33,
                "DeutscherBundestag": 34,
                "BundeskanzlerinundBundeskanzleramt": 35,
                "Bundesverfassungsgericht": 36,
                "Bundesrechnungshof": 37,
                "BundesministeriumderJustizundfrVerbraucherschutz": 38,
                "BundesministeriumfrWirtschaftundEnergie": 39,
                "BundesministeriumfrErnhrungundLandwirtschaft": 40,
                "BundesministeriumfrVerkehrunddigitaleInfrastruktur": 41,
                "BundesministeriumfrUmweltNaturschutzBauundReaktorsicherheit": 42
            }
        ];
    ministryName = simpleChars(ministryName);
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
    year: [
        parseInt(api.getYearValues()[api.getYearValues().length-1]),
        parseInt(api.getYearValues()[api.getYearValues().length-1])
        ],
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