"use strict";

const dex = require('./data/dex.js');
const megas = require('./data/megas.js');
const baseImage = require('./data/base-image.js');

const formats = {
	"icons": ["https://www.serebii.net/pokedex-sm/icon/", ".png", "iconserebii"],
	"shuffle": ["http://www.pkparaiso.com/imagenes/shuffle/sprites/", ".png", "paraiso"],
	"xyanimated": ["http://play.pokemonshowdown.com/sprites/xyani/", ".gif"],
	"xy": ["http://play.pokemonshowdown.com/sprites/xy/", ".png"],
	"smd": ["http://www.serebii.net/supermysterydungeon/pokemon/", ".png", "serebii"],
};

function hash(pokemon, format) {//gets dex number
	pokemon = pokemon[0].toUpperCase() + pokemon.substr(1);
	if (dex[pokemon]) return dex[pokemon];
	if (~pokemon.indexOf("-")) {
		let data = dex[pokemon.substr(0, pokemon.indexOf("-")).trim()];
		if (format === "iconserebii") {
			if (pokemon === "charizard" && pokemon[pokemon.lastIndexOf("-") + 1] === "x") data += "-mx";
			if (pokemon === "charizard" && pokemon[pokemon.lastIndexOf("-") + 1] === "y") data += "-my";
			if (pokemon === "pikachu" && pokemon[pokemon.lastIndexOf("p") + 1] === "h") data += "-phd";
			if (pokemon === "pikachu" && pokemon[pokemon.lastIndexOf("p") + 1] === "o") data += "-ps";
			if (pokemon === "mewtwo" && pokemon[pokemon.lastIndexOf("-") + 1] === "x") data += "-mx";
			if (pokemon === "mewtwo" && pokemon[pokemon.lastIndexOf("-") + 1] === "y") data += "-my";
			if (pokemon === "castform" && pokemon[pokemon.indexOf("s") + 1] === "n") data += "-i";
			if (pokemon === "deoxys" && pokemon[pokemon.indexOf("-") + 1] === "a") data += "a";
			if (pokemon === "deoxys" && pokemon[pokemon.indexOf("-") + 1] === "d") data += "d";
			if (pokemon === "deoxys" && pokemon[pokemon.indexOf("-") + 1] === "s") data += "s";
			if (pokemon === "rotom" && pokemon[pokemon.indexOf("f") + 1] === "a") data += "s";
			if (pokemon === "giratina" && pokemon[pokemon.indexOf("-") + 1] === "o") data += "o";
			if (pokemon === "shaymin" && pokemon[pokemon.indexOf("-") + 1] === "s") data += "s";
			if (pokemon === "darmanitan" && pokemon[pokemon.indexOf("-") + 1] === "z") data += "d";
			if (["tornadus", "thundurus", "landorus"].includes(pokemon) && pokemon[pokemon.indexOf("-") + 1] === "t") data += "-s";
			if (["pumpkaboo", "gourgeist"].includes(pokemon) && pokemon[pokemon.indexOf("s") + 1] === "u") data += "-h";
			if (pokemon === "oricorio" && pokemon[pokemon.indexOf("p") + 1] === "a") data += "-pau";
			if (pokemon === "necrozma" && pokemon[pokemon.lastIndexOf("-") + 1] === "m") data += "-dm";
			if (pokemon === "necrozma" && pokemon[pokemon.lastIndexOf("-") + 1] === "w") data += "-dw";
			if (pokemon === "necrozma" && pokemon[pokemon.indexOf("-") + 1] === "u") data += "-u";
			if (pokemon === "zygarde" && pokemon[pokemon.indexOf("-") + 1] === "1") data += "-10";
			data += (pokemon === "minior" && pokemon[pokemon.indexOf("-") + 1] === "m" ? "" : "-" + pokemon[pokemon.indexOf("-") + 1]);
		}
		if (format === "paraiso" && ~pokemon.indexOf("mega")) data += "-mega";
		if (format === "serebii") {
			if (pokemon === "charizard" && pokemon[pokemon.lastIndexOf("-") + 1] === "x") data += "-mx";
			if (pokemon === "charizard" && pokemon[pokemon.lastIndexOf("-") + 1] === "y") data += "-my";
			if (pokemon === "pikachu" && pokemon[pokemon.lastIndexOf("p") + 1] === "h") data += "-phd";
			if (pokemon === "pikachu" && pokemon[pokemon.lastIndexOf("p") + 1] === "o") data += "-ps";
			if (pokemon === "mewtwo" && pokemon[pokemon.lastIndexOf("-") + 1] === "x") data += "-mx";
			if (pokemon === "mewtwo" && pokemon[pokemon.lastIndexOf("-") + 1] === "y") data += "-my";
			if (pokemon === "castform" && pokemon[pokemon.indexOf("s") + 1] === "n") data += "-i";
			if (pokemon === "rotom" && pokemon[pokemon.indexOf("f") + 1] === "a") data += "-s";
			if (pokemon === "darmanitan" && pokemon[pokemon.indexOf("-") + 1] === "z") data += "-d";
			if (["tornadus", "thundurus", "landorus"].includes(pokemon) && pokemon[pokemon.indexOf("-") + 1] === "t") data += "-s";
			if (["pumpkaboo", "gourgeist"].includes(pokemon) && pokemon[pokemon.indexOf("s") + 1] === "u") data += "-h";
			if (pokemon === "zygarde" && pokemon[pokemon.indexOf("-") + 1] === "1") data += "-10";
			data += "-" + pokemon[pokemon.indexOf("-") + 1];
		}
	}
	return pokemon;
}

function removeParenthesizedInfo(line) {
	if (!~line.indexOf('(')) return line.trim();
	let start = line.indexOf('(') + 1;
	let len = line.lastIndexOf(')') - start;
	line = line.substr(start, len).trim();
	return line;
}

function checkMega(line) {
	let pokemon = line[0].toLowerCase();
	if (!line[1]) return line[0]; //no item, its not mega
	let item = line[1].toLowerCase().trim();
	if (!megas[pokemon]) return line[0];
	if (megas[pokemon]) {
		if (typeof (megas[pokemon]) !== "object" && megas[pokemon] === item) {
			return line[0] + '-Mega';
		} else if (typeof (megas[pokemon]) === "object") {
			if (megas[pokemon][0] === item) return line[0] + '-Mega-X';
			else if (megas[pokemon][1] === item) return line[0] + '-Mega-Y';
		} else {
			return line[0];
		}
	}
}

function packTeam(importable) {
	let team = {
		"pokemon": [],
		"pokenames": [],
		"items": [],
		"evs": [],
		"abilities": [],
		"natures": [],
		"moves": [],
		"ivs": [],
	};
	team.importable = importable;
	let lines = importable.split('\n');
	let data = [];
	let dataIndex = 0;
	data.push([lines[0]]);
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].length < 2) continue;
		if (lines[i - 1].length < 2) {
			dataIndex++;
			data.push([lines[i]]);
		} else {
			data[dataIndex].push(lines[i].trim());
		}
	}
	for (let j = 0; j < data.length; j++) {
		for (let k = 0; k < data[j].length; k++) {
			let l = data[j][k];
			if (k === 0) {
				let pokeno = team.pokemon.length;
				if (pokeno > team.evs.length) team.evs.push("No EVs");
				if (pokeno > team.abilities.length) team.abilities.push("No Ability");
				if (pokeno > team.natures.length) team.natures.push("No Nature");
				if (pokeno > team.ivs.length) team.ivs.push(false);
				let line = l.split(" @ ");
				team.pokenames.push(line[0]);
				line[0] = removeParenthesizedInfo(line[0]);
				team.pokemon.push(checkMega(line));
				/* eslint-disable */
				line[1] ? team.items.push(line[1].trim()) : team.items.push(false);
				/* eslint-enable */
			} else if (~l.indexOf("EVs: ")) {
				team.evs.push(l.substr(l.indexOf(' ')).trim());
			} else if (~l.indexOf("Ability: ")) {
				team.abilities.push(l.substr(l.indexOf(' ')).trim());
			} else if (~l.indexOf("IVs: ")) {
				team.ivs.push(l.substr(l.indexOf(' ')).trim());
			} else if (~l.indexOf("Nature")) {
				team.natures.push(l.substr(0, l.indexOf(' ')).trim());
			} else if (~l.indexOf("- ")) {
				let pokeno = team.pokemon.length - 1;
				if (team.moves[pokeno]) {
					team.moves[pokeno].push(l.substr(l.indexOf(" ")).trim());
				} else {
					team.moves.push([l.substr(l.indexOf(" ")).trim()]);
				}
			}
		}
	}
	let pokeno = team.pokemon.length;
	if (pokeno > team.evs.length) team.evs.push("No EVs");
	if (pokeno > team.abilities.length) team.abilities.push("No Ability");
	if (pokeno > team.natures.length) team.natures.push("No Nature");
	if (pokeno > team.ivs.length) team.ivs.push(false);
	return team;
}

function getImgs(format, team) {
	let output = "";
	if (typeof (team) !== "object") team = packTeam(team);
	let pokemon = team.pokemon;
	for (let j = 0; j < pokemon.length; j++) {
		output += getImg(format, pokemon[j].toLowerCase());
	}
	return output;
}

function getImg(format, pokemon) {
	if (!formats[format]) return;
	if (pokemon === "mime jr.") pokemon = "mimejr";
	// if (baseImage[pokemon]) format = 'xyanimated';
	let fdata = formats[format];
	let output = '[img]' + fdata[0] + (fdata[2] ? hash(pokemon, fdata[2]) : pokemon) + fdata[1] + '[/img]';
	if ((format === 'xyanimated' || format === 'xy') && !fdata[2] && ~pokemon.indexOf("-")) {
		let hasMega = ["abomasnow", "absol", "aerodactyl", "aggron", "alakazam", "altaria", "ampharos", "audino", "banette", "beedrill", "blastoise", "blaziken", "camerupt", "charizard", "diancie", "gallade", "garchomp", "gardevoir", "gengar", "glalie", "gyarados", "heracross", "houndoom", "kangaskhan", "latias", "latios", "lopunny", "lucario", "manectric", "mawile", "medicham", "metagross", "mewtwo", "pidgeot", "pinsir", "rayquaza", "sableye", "salamence", "sceptile", "scizor", "sharpedo", "slowbro", "steelix", "swampert", "tyranitar", "venusaur"];
		if (hasMega.includes(pokemon)) {
			if (pokemon[pokemon.lastIndexOf("-") + 1] === "x") pokemon += "-megax";
			if (pokemon[pokemon.lastIndexOf("-") + 1] === "y") pokemon += "-megay";
			pokemon += "-mega";
		}
		if (pokemon[pokemon.indexOf("-a") + 1] === "l") pokemon += "-alola";
		if (pokemon === "deoxys") {
			if (pokemon[pokemon.indexOf("-") + 1] === "a") pokemon += "-attack";
			if (pokemon[pokemon.indexOf("-") + 1] === "d") pokemon += "-defense";
			if (pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-speed";
		}
		if (pokemon === "pikachu") {
			if (pokemon[pokemon.indexOf("-") + 1] === "c" || 
				pokemon[pokemon.lastIndexOf("p") + 1] === "h" || 
				pokemon[pokemon.lastIndexOf("p") + 1] === "o" || 
				pokemon[pokemon.indexOf("-") + 1] === "l" || 
				pokemon[pokemon.indexOf("-") + 1] === "r") pokemon += "-cosplay";
			if (pokemon[pokemon.indexOf("-") + 1] === "b") pokemon += "-belle";
			if (pokemon[pokemon.indexOf("-") + 1] === "o") pokemon += "-original";
			if (pokemon[pokemon.indexOf("-") + 1] === "h") pokemon += "-hoenn";
			if (pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-sinnoh";
			if (pokemon[pokemon.indexOf("-") + 1] === "u") pokemon += "-unova";
			if (pokemon[pokemon.indexOf("-") + 1] === "k") pokemon += "-kalos";
			if (pokemon[pokemon.indexOf("-") + 1] === "p") pokemon += "-partner";
		}
		if (pokemon === "castform") {
			if (pokemon[pokemon.indexOf("s") + 1] === "u") pokemon += "-sunny";
			if (pokemon[pokemon.indexOf("-") + 1] === "r") pokemon += "-rainy";
			if (pokemon[pokemon.indexOf("s") + 1] === "n") pokemon += "-snowy";
		}
		if (["groudon", "kyogre"].includes(pokemon) && pokemon[pokemon.indexOf("-") + 1] === "p") pokemon += "-primal";
		if (["burmy", "wormadam"].includes(pokemon)) {
			if (pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-sandy";
			if (pokemon[pokemon.indexOf("-") + 1] === "t") pokemon += "-trash";
		}
		if (pokemon === "cherrim" && pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-sunshine";
		if (pokemon === "rotom") {
			if (pokemon[pokemon.indexOf("f") + 1] === "a") pokemon += "-fan";
			if (pokemon[pokemon.indexOf("f") + 1] === "r") pokemon += "-frost";
			if (pokemon[pokemon.indexOf("-") + 1] === "h") pokemon += "-heat";
			if (pokemon[pokemon.indexOf("-") + 1] === "m") pokemon += "-mow";
			if (pokemon[pokemon.indexOf("-") + 1] === "w") pokemon += "-wash";
		}
		if (pokemon === "giratina" && pokemon[pokemon.indexOf("-") + 1] === "o") pokemon += "-origin";
		if (pokemon === "shaymin" && pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-sky";
		if (pokemon === "basculin" && pokemon[pokemon.indexOf("-") + 1] === "b") pokemon += "-bluestriped";
		if (pokemon === "darmanitan" && pokemon[pokemon.indexOf("-") + 1] === "z") pokemon += "-zen";
		if (["thundurus", "tornadus", "landorus"].includes(pokemon) && pokemon[pokemon.indexOf("-") + 1] === "t") pokemon += "-therian";
		if (pokemon === "kyurem") {
			if (pokemon[pokemon.indexOf("-") + 1] === "b") pokemon += "-black";
			if (pokemon[pokemon.indexOf("-") + 1] === "w") pokemon += "-white";
		}
		if (pokemon === "meloetta" && pokemon[pokemon.indexOf("-") + 1] === "p") pokemon += "-pirouette";
		if (pokemon === "aegislash" && pokemon[pokemon.indexOf("-") + 1] === "b") pokemon += "-blade";
		if (pokemon === "greninja" && pokemon[pokemon.indexOf("-") + 1] === "a") pokemon += "-ash";
		if (["pumpkaboo", "gourgeist"].includes(pokemon)) {
			if (pokemon[pokemon.indexOf("s") + 1] === "m") pokemon += "-small";
			if (pokemon[pokemon.indexOf("-") + 1] === "l") pokemon += "-large";
			if (pokemon[pokemon.indexOf("s") + 1] === "u") pokemon += "-super";
		}
		if (pokemon === "zygarde") {
			if (pokemon[pokemon.indexOf("-") + 1] === "1") pokemon += "-10";
			if (pokemon[pokemon.indexOf("-") + 1] === "c") pokemon += "-complete";
		}
		if (pokemon === "hoopa" && pokemon[pokemon.indexOf("-") + 1] === "u") pokemon += "-unbound";
		if (pokemon === "oricorio") {
			if (pokemon[pokemon.indexOf("p") + 1] === "a") pokemon += "-pau";
			if (pokemon[pokemon.indexOf("p") + 1] === "o") pokemon += "-pompom";
			if (pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-sensu";
		}
		if (pokemon === "lycanroc") {
			if (pokemon[pokemon.indexOf("-") + 1] === "m") pokemon += "-midnight";
			if (pokemon[pokemon.indexOf("-") + 1] === "d") pokemon += "-dusk";
		}
		if (pokemon === "wishiwashi" && pokemon[pokemon.indexOf("-") + 1] === "s") pokemon += "-school";
		if (pokemon === "minior" && pokemon[pokemon.indexOf("-") + 1] === "m") pokemon += "-meteor";
		if (pokemon === "necrozma") {
			if (pokemon[pokemon.lastIndexOf("-") + 1] === "m") pokemon += "-duskmane";
			if (pokemon[pokemon.lastIndexOf("-") + 1] === "w") pokemon += "-dawnwings";
			if (pokemon[pokemon.indexOf("-") + 1] === "u") pokemon += "-ultra";
		}
		if (pokemon === "magearna" && pokemon[pokemon.indexOf("-") + 1] === "o") pokemon += "-original";
	}
	return output;
}

function toTitle(text, options) { //This function is a disaster lol
	let output = "[" + options.align + "][FONT=" + options.tfont + "][SIZE=" + options.size + "]";
	if (options.bold) output += "[B]";
	if (options.underlined) output += "[U]";
	if (options.bold === "first") text = text[0] + "[/B]" + text.substr(1);
	output += text;
	if (options.bold && options.bold !== "first") output += "[/B]";
	if (options.underlined) output += "[/U]";
	output += "[/SIZE][/FONT][/" + options.align + "]";
	return output;
}

function buildingProcess(format, pokemon, f, fe) {
	let output = ["", "", "", "", "", ""];
	for (let i = 0; i < pokemon.length; i++) {
		let img = getImg(format, pokemon[i].toLowerCase());
		for (let j = i; j < pokemon.length; j++) {
			output[j] += img;
		}
	}
	for (let k = 0; k < output.length; k++) {
		output[k] += "\n" + f + "**Why did you choose this pokemon?**" + fe + "\n";
	}
	return output.join("");
}
/* eslint-disable */
function buildSets(data, options, f, fe) {
	let output = "";
	switch (options.setFormat) {
	case 'importable': //default
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[" + options. align + "]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "\n" +
				data.pokenames[i] + " @ " + data.items[i] + "\n" +
				"Ability: " + data.abilities[i] + "\n" +
				"EVs: " + data.evs[i] + "\n" +
				data.natures[i] + " Nature \n" +
				(data.ivs[i] ? "IVs: " + data.ivs[i] + "\n" : "");
			for (let k = 0; k < data.moves[i].length; k++) {
				output += "- " + data.moves[i][k] + "\n";
			}
		output += "[/" + options.align + "]\n" + f + "" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "" + fe + "\n\n";
		}
	break;
	case 'bold-importable': //default with bold
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[LEFT]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "\n" +
				"[B]" + data.pokenames[i] + "[/B]" + (data.items[i] ? " @ " + data.items[i] : "") + "\n" +
				"[B]Ability:[/B] " + data.abilities[i] + "\n" +
				"[B]Nature:[/B] " + data.natures[i] + "\n" +
				"[B]EVs:[/B] " + data.evs[i] + "\n" +
				(data.ivs[i] ? "[B]IVs:[/B] " + data.ivs[i] + "\n" : "") +
				"[B]Moves:[/B] ";
			for (let k = 0; k < data.moves[i].length; k++) {
				if (k !== 0) output += " | ";
				output += data.moves[i][k];
			}
		output += "[/LEFT]\n\n" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "\n\n";
		}
	break;
	case 'alternative': //trinitrotoluene
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[B][SIZE=2][LEFT][INDENT]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "[/INDENT]\n" +
				data.pokenames[i] + (data.items[i] ? " @ " + data.items[i] : "") + " | " +
				data.abilities[i] + "\n" +
				data.natures[i] + " | " +
				data.evs[i] + "\n" +
				(data.ivs[i] ? "IVs: " + data.ivs[i] + "\n" : "");
			for (let k = 0; k < data.moves[i].length; k++) {
				output += "• " + data.moves[i][k] + "\n";
			}
		output += "[/B][/SIZE][/LEFT]" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "\n\n";
		}
	break;
	case 'pearl': //Pearl
		for (let i = 0; i < data.pokemon.length; i++) {
			output += "[SIZE=2][CENTER]" + getImg(options.imgFormat, data.pokemon[i].toLowerCase()) + "\n" +
				(data.items[i] ?
					"@ [IMG]http://www.serebii.net/itemdex/sprites/" + data.items[i].toLowerCase().split(" ").join("") + ".png[/IMG]\n" :
					"") +
				"[B]Ability-[/B] " + data.abilities[i] + "\n" +
				"[B]EVs-[/B] " + data.evs[i].split(' / ').join(' | ') + "\n" +
				(data.ivs[i] ? "[B]IVs-[/B] " + data.ivs[i] + "\n" : "") +
				"[B]Nature- [/B]" + data.natures[i] + "\n\n";
			for (let k = 0; k < data.moves[i].length; k++) {
				if (k !== 0) output+= " | ";
				output += data.moves[i][k];
			}
		output += "[/SIZE][/CENTER]\n" + f + "**Why did you choose this pokemon? What does it do for your team?**" + fe + "\n\n";
		}
	break;
	}
	return output;
}
/* eslint-enable */

function rmt(team, options) {
	let data = packTeam(team);
	options.align = options.align.toUpperCase(); //easier than doing this client-side
	options.size = parseInt(options.size);
	options.process = options.process === 'true';
	options.bold = options.bold === 'true';
	options.underlined = options.underlined === 'true';
	let f = "[FONT=" + options.font + "]";
	let fe = "[/FONT]";
	let output = "";
	output += "[center]" + getImgs(options.imgFormat, data) + "[/center]\n\n" +
		toTitle("Introduction", options) + "\n\n" + f + "**Introduction goes here**" + fe + "\n\n";
	if (options.process) {
		output += toTitle("Teambuilding Process", options) + "\n\n" +
			"[hide]" + buildingProcess(options.processFormat, data.pokemon, f, fe) + "[/hide]\n" +
			"\n" + toTitle("The Team", options) + "\n\n";
	}
	output += buildSets(data, options, f, fe);
	output += toTitle("Conclusion", options) + "\n\n" + f + "**Conclusion goes here**" + fe + "\n\n" +
		"[hide=Importable]" + data.importable + "[/hide]";
	return output;
}

module.exports.rmt = rmt;
module.exports.getImgs = getImgs;
