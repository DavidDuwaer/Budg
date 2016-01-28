/**
 * Created by david on 28-1-2016.
 */

var color = d3.scale.category20();

var state =
{
    year: "2016",
    ministryHighlighted: null,
    sliderMouseDown: false
};

/*
 * TODO: get following arrays from API
 */
var yearValues = ["2013", "2014", "2015", "2016"];
var ministryValues = [
    "A: Infrastructuurfonds",
    "B: Gemeentefonds",
    "C: Provinciefonds",
    "F: Diergezondheidsfonds",
    "H: BES-fonds",
    "I: De Koning",
    "IIa: De Staten Generaal",
    "IIb: Overige Hoge Colleges van Staat",
    "III: Algemene Zaken",
    "IV: Koninkrijksrelaties",
    "IXa: Nationale Schuld",
    "IXb: Financiën",
    //"Rijk",
    "J: Deltafonds",
    "V: Buitenlandse Zaken",
    "VI: Veiligheid en Justitie",
    "VII: Binnenlandse Zaken en Koninkrijksrelaties",
    "VIII: Onderwijs: Cultuur en Wetenschap",
    "X: Defensie",
    "XII: Infrastructuur en Milieu",
    "XIII: Economische Zaken",
    "XV: Sociale Zaken en Werkgelegenheid",
    "XVI: Volksgezondheid: Welzijn en Sport",
    "XVII: Buitenlandse Handel & Ontwikkelingssamenwerking",
    "XVIII: Wonen en Rijksdienst"
];
var sideValues = ["O", "U", "V"];
var sideSigns = [-1, 1, 1];
console.log(yearValues[0]);
var yearsScale = d3.scale.linear()
    .domain(yearValues)
    .range(d3.range(0, yearValues.length - 1, 1));
var ministriesScale = d3.scale.ordinal()
    .domain(ministryValues)
    .range(d3.range(0, ministryValues.length - 1, 1));
var sidesScale = d3.scale.ordinal()
    .domain(sideValues)
    .range(sideSigns);