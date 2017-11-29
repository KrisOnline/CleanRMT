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
			let noHyphen = ["Deoxys", "Rotom", "Giratina", "Shaymin", "Darmanitan"];
			let differentFormeLetter = ["Charizard", "Pikachu", "Mewtwo", "Castform", "Tornadus", "Thundurus", "Landorus", "Pumpkaboo", "Gourgeist", "Zygarde", "Oricorio", "Necrozma"];
			if (noHyphen.includes(pokemon)) {
				if (pokemon === "Rotom" && pokemon.endsWith("-Fan")) data += "s";
				if (pokemon === "Darmanitan" && pokemon.endsWith("-Zen")) data += "d";
				data += pokemon[pokemon.indexOf("-") + 1];
			}
			if (differentFormeLetter.includes(pokemon)) {
				if (["Charizard", "Mewtwo"].includes(pokemon) && pokemon.endsWith("-Mega-X")) data += "-mx";
				if (["Charizard", "Mewtwo"].includes(pokemon) && pokemon.endsWith("-Mega-Y")) data += "-my";
				if (pokemon === "Pikachu" && pokemon.endsWith("-PhD")) data += "-phd";
				if (pokemon === "Pikachu" && pokemon.endsWith("-Pop-Star")) data += "-ps";
				if (pokemon === "Castform" && pokemon.endsWith("-Snowy")) data += "-i";
				if (["Tornadus", "Thundurus", "Landorus"].includes(pokemon) && pokemon.endsWith("-Therian")) data += "-s";
				if (["Pumpkaboo", "Gourgeist"].includes(pokemon) && pokemon.endsWith("-Super")) data += "-h";
				if (pokemon === "Oricorio" && pokemon.endsWith("-Pau")) data += "-pau";
				if (pokemon === "Necrozma" && pokemon.endsWith("-Dusk-Mane")) data += "-dm";
				if (pokemon === "Necrozma" && pokemon.endsWith("-Dawn-Wings")) data += "-dw";
				if (pokemon === "Necrozma" && pokemon.endsWith("-Ultra")) data += "-u";
				if (pokemon === "Zygarde" && pokemon.endsWith("-10%")) data += "-10";
			}
			data += (pokemon === "Minior" && pokemon.endsWith("-Meteor") ? "" : "-" + pokemon[pokemon.indexOf("-") + 1]);
		}
		if (format === "paraiso" && ~pokemon.indexOf("mega")) data += "-mega";
		if (format === "serebii") {
			let differentFormeLetter = ["Charizard", "Mewtwo", "Castform", "Rotom", "Darmanitan", "Tornadus", "Thundurus", "Landorus", "Pumpkaboo", "Gourgeist", "Zygarde"];
			if (differentFormeLetter.includes(pokemon)) {
				if (["Charizard", "Mewtwo"].includes(pokemon) && pokemon.endsWith("-Mega-X")) data += "-mx";
				if (["Charizard", "Mewtwo"].includes(pokemon) && pokemon.endsWith("-Mega-Y")) data += "-my";
				if (pokemon === "Castform" && pokemon.endsWith("-Snowy")) data += "-i";
				if (pokemon === "Rotom" && pokemon.endsWith("-Fan")) data += "-s";
				if (pokemon === "Darmanitan" && pokemon.endsWith("-Zen")) data += "-d";
				if (["Tornadus", "Thundurus", "Landorus"].includes(pokemon) && pokemon.endsWith("-Therian")) data += "-s";
				if (["Pumpkaboo", "Gourgeist"].includes(pokemon) && pokemon.endsWith("-Super")) data += "-h";
				if (pokemon === "Zygarde" && pokemon.endsWith("-10%")) data += "-10";
			}
			data += "-" + pokemon[pokemon.indexOf("-") + 1];
		}
		return data;
	}
	return pokemon;
}

function removeNicks(line) {
	if (!~line.indexOf('(')) return line.trim();
	let start = line.indexOf('(') + 1;
	let len = line.indexOf(')') - start;
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
				line[0] = removeNicks(line[0]).replace('(M)', '').replace('(F)', '');
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
	if ((format === 'xyanimated' || format === 'xy') && !fdata[2] && ~pokemon.indexOf("-")) {
		let hasMega = ["Abomasnow", "Absol", "Aerodactyl", "Aggron", "Alakazam", "Altaria", "Ampharos", "Audino", "Banette", "Beedrill", "Blastoise", "Blaziken", "Camerupt", "Charizard", "Diancie", "Gallade", "Garchomp", "Gardevoir", "Gengar", "Glalie", "Gyarados", "Heracross", "Houndoom", "Kangaskhan", "Latias", "Latios", "Lopunny", "Lucario", "Manectric", "Mawile", "Medicham", "Metagross", "Mewtwo", "Pidgeot", "Pinsir", "Rayquaza", "Sableye", "Salamence", "Sceptile", "Scizor", "Sharpedo", "Slowbro", "Steelix", "Swampert", "Tyranitar", "Venusaur"];
		if (hasMega.includes(pokemon)) {
			if (pokemon.endsWith("-Mega-X")) pokemon += "-megax";
			if (pokemon.endsWith("-Mega-Y")) pokemon += "-megay";
			pokemon += "-mega";
		}
		if (pokemon.endsWith("-Alola") || pokemon.endsWith("-Alola-Totem")) pokemon += "-alola";
		if (pokemon === "Deoxys") {
			if (pokemon.endsWith("-Attack")) pokemon += "-attack";
			if (pokemon.endsWith("-Defense")) pokemon += "-defense";
			if (pokemon.endsWith("-Speed")) pokemon += "-speed";
		}
		if (pokemon === "Pikachu") {
			if (pokemon.endsWith("-Cosplay") || 
				pokemon.endsWith("-PhD") || 
				pokemon.endsWith("-Pop-Star") || 
				pokemon.endsWith("-Libre") || 
				pokemon.endsWith("-Rock-Star")) pokemon += "-cosplay";
			if (pokemon.endsWith("-Belle")) pokemon += "-belle";
			if (pokemon.endsWith("-Original")) pokemon += "-original";
			if (pokemon.endsWith("-Hoenn")) pokemon += "-hoenn";
			if (pokemon.endsWith("-Sinnoh")) pokemon += "-sinnoh";
			if (pokemon.endsWith("-Unova")) pokemon += "-unova";
			if (pokemon.endsWith("-Kalos")) pokemon += "-kalos";
			if (pokemon.endsWith("-Partner")) pokemon += "-partner";
		}
		if (pokemon === "Castform") {
			if (pokemon.endsWith("-Sunny")) pokemon += "-sunny";
			if (pokemon.endsWith("-Rainy")) pokemon += "-rainy";
			if (pokemon.endsWith("-Snowy")) pokemon += "-snowy";
		}
		if (["Groudon", "Kyogre"].includes(pokemon) && pokemon.endsWith("-Primal")) pokemon += "-primal";
		if (["Burmy", "Wormadam"].includes(pokemon)) {
			if (pokemon.endsWith("-Sandy")) pokemon += "-sandy";
			if (pokemon.endsWith("-Trash")) pokemon += "-trash";
		}
		if (pokemon === "Cherrim" && pokemon.endsWith("-Sunshine")) pokemon += "-sunshine";
		if (pokemon === "Rotom") {
			if (pokemon.endsWith("-Fan")) pokemon += "-fan";
			if (pokemon.endsWith("-Frost")) pokemon += "-frost";
			if (pokemon.endsWith("-Heat")) pokemon += "-heat";
			if (pokemon.endsWith("-Mow")) pokemon += "-mow";
			if (pokemon.endsWith("-Wash")) pokemon += "-wash";
		}
		if (pokemon === "Giratina" && pokemon.endsWith("-Origin")) pokemon += "-origin";
		if (pokemon === "Shaymin" && pokemon.endsWith("-Sky")) pokemon += "-sky";
		if (pokemon === "Basculin" && pokemon.endsWith("-Blue-Striped")) pokemon += "-bluestriped";
		if (pokemon === "Darmanitan" && pokemon.endsWith("-Zen")) pokemon += "-zen";
		if (["Thundurus", "Tornadus", "Landorus"].includes(pokemon) && pokemon.endsWith("-Therian")) pokemon += "-therian";
		if (pokemon === "Kyurem") {
			if (pokemon.endsWith("-Black")) pokemon += "-black";
			if (pokemon.endsWith("-White")) pokemon += "-white";
		}
		if (pokemon === "Meloetta" && pokemon.endsWith("-Pirouette")) pokemon += "-pirouette";
		if (pokemon === "Aegislash" && pokemon.endsWith("-Blade")) pokemon += "-blade";
		if (pokemon === "Greninja" && pokemon.endsWith("-Ash")) pokemon += "-ash";
		if (["Pumpkaboo", "Gourgeist"].includes(pokemon)) {
			if (pokemon.endsWith("-Small")) pokemon += "-small";
			if (pokemon.endsWith("-Large")) pokemon += "-large";
			if (pokemon.endsWith("-Super")) pokemon += "-super";
		}
		if (pokemon === "Zygarde") {
			if (pokemon.endsWith("-10%")) pokemon += "-10";
			if (pokemon.endsWith("-Complete")) pokemon += "-complete";
		}
		if (pokemon === "Hoopa" && pokemon.endsWith("-Unbound")) pokemon += "-unbound";
		if (pokemon === "Oricorio") {
			if (pokemon.endsWith("-Pa'u")) pokemon += "-pau";
			if (pokemon.endsWith("-Pom-Pom")) pokemon += "-pompom";
			if (pokemon.endsWith("-Sensu")) pokemon += "-sensu";
		}
		if (pokemon === "Lycanroc") {
			if (pokemon.endsWith("-Midnight")) pokemon += "-midnight";
			if (pokemon.endsWith("-Dusk")) pokemon += "-dusk";
		}
		if (pokemon === "Wishiwashi" && pokemon.endsWith("-School")) pokemon += "-school";
		if (pokemon === "Minior" && pokemon.endsWith("-Meteor")) pokemon += "-meteor";
		if (pokemon === "Necrozma") {
			if (pokemon.endsWith("-Dusk-Mane")) pokemon += "-duskmane";
			if (pokemon.endsWith("-Dawn-Wings")) pokemon += "-dawnwings";
			if (pokemon.endsWith("-Ultra")) pokemon += "-ultra";
		}
		if (pokemon === "Magearna" && pokemon.endsWith("-Original")) pokemon += "-original";
	}
	return '[img]' + fdata[0] + (fdata[2] ? hash(pokemon, fdata[2]) : pokemon) + fdata[1] + '[/img]';
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
